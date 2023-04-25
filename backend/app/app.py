from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Union
from . import auth
import ast
from .db import models, schemas, crud
from .db.database import engine, SessionLocal
from .connection_manager import ConnectionManager
from .game import Game
from uuid import UUID
from starlette.middleware.authentication import AuthenticationMiddleware
from starlette.middleware import Middleware
from starlette.authentication import requires
from .auth import get_db

models.Base.metadata.create_all(bind=engine)


origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    'http://192.168.0.16:3000'
]


middleware = [
    Middleware(
        AuthenticationMiddleware,
        backend=auth.BasicAuthBackend,
    ),
    Middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )
]

app = FastAPI(middleware=middleware)


templates = Jinja2Templates(directory="templates/")
app.mount("/static", StaticFiles(directory="static"), name="static")


manager = ConnectionManager()
game = Game(manager)


@app.get("/users/me/")
async def read_users_me(current_user: schemas.User = Depends(auth.get_current_user)):
    return current_user


@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    if user.password1 != user.password2:
        raise HTTPException(status_code=400, detail="Password must match")
    return crud.create_user(db=db, user=user)


@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@app.post("/rooms/", response_model=schemas.Room)
def create_room(room: schemas.RoomCreate, db: Session = Depends(get_db)):
    return crud.create_room(db=db, room=room)


@app.get("/")
async def some_func(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "user": "hello"})


@app.get("/get-my-games")
async def get_my_games(current_user: schemas.User = Depends(auth.get_current_user),  db: Session = Depends(get_db)):
    my_games = crud.get_game_result(db=db, user=current_user)
    return my_games



@app.get("/rooms/")
async def get_all_rooms(db: Session = Depends(get_db)):
    rooms = crud.get_rooms(db)
    return rooms


@app.get("/rooms/{room_id}")
async def get_room(room_id: Union[UUID, int, str], db: Session = Depends(get_db)):
    if type(room_id) in [int, str]:
        raise HTTPException(status_code=404, detail="Room not found")
    room = crud.get_room(db, room_id)
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found.")
    if room.status != models.Statuses.created:
        raise HTTPException(status_code=403, detail="Room is not available.")
    return room


@app.post("/token", response_model=auth.Token)
async def login_for_access_token(db: Session = Depends(get_db), form_data: auth.OAuth2PasswordRequestForm = Depends()):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=auth.status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = auth.timedelta(
        minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    headers = {"Access-Control-Allow-Origin": "http://127.0.0.1:3000"}
    response = JSONResponse(
        {"access_token": access_token, "token_type": "bearer"}, headers=headers)
    token_for_cookie = access_token.split(".")
    response.set_cookie("header.payload", ".".join(
        token_for_cookie[:2]), max_age=1800, secure=True)
    response.set_cookie(
        "signature", token_for_cookie[2], httponly=True, secure=True)
    return response


async def commands(websocket, data):
    command = data.get("command")
    if command == "ready":
        await game.add_readies(websocket)
    elif command == "not ready":
        await game.remove_readies(websocket)


@app.websocket("/ws/{room}")
async def websocket_endpoint(websocket: WebSocket):
    if manager.get_connections_amount(websocket.get("path")) < 2:
        await manager.connect(websocket)
        await manager.send_connections_amount(websocket.get("path"))
        await game.update_players_status(websocket)
        try:
            while True:
                data = await websocket.receive_text()
                data = ast.literal_eval(data)
                if data.get("command"):
                    await commands(websocket, data)
                elif data.get("result"):
                    path = websocket.get("path")
                    gamer = websocket.get("client")[1]
                    result = data.get('result') # data = {result: { item: myChoice, user: currentUser }}
                    print("Result: ", result)
                    await game.on_game_over(path=path, gamer=gamer, result=result)
        except WebSocketDisconnect:
            await manager.disconnect(websocket)
            await game.remove_readies(websocket)
            await manager.send_connections_amount(websocket.get("path"))
