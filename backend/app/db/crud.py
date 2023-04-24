from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext
from uuid import UUID
from sqlalchemy import or_
from typing import Union


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_room(db: Session, room_id: Union[UUID, int]):
    return db.query(models.Room).filter(models.Room.id == room_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_my_games(db: Session, user: schemas.User, skip: int = 0, limit: int = 100):
    print(type(db.query(models.Room).filter(or_(models.Room.first_player_id == user.id, models.Room.second_player_id == user.id)).offset(skip).limit(limit).all()))
    query = db.query(models.Room).filter(or_(models.Room.first_player_id == user.id, models.Room.second_player_id == user.id)).offset(skip).limit(limit).all()
    
    for row in query:
        first_player = row.first_player
        first_player.hashed_password = None
        second_player = row.second_player
        second_player.hashed_password = None


    return query


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User.id, models.User.email, models.User.first_name, models.User.last_name).offset(skip).limit(limit).all()


def get_rooms(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Room).filter().all()


def create_user(db: Session, user: schemas.UserCreate):
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash(user.password1)
    db_user = models.User(email=user.email, first_name=user.first_name,
                          last_name=user.last_name, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_room(db: Session, room: schemas.RoomCreate):
    room = models.Room()
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


def update_room_status_to_played(db: Session, room_id: UUID, player_one, player_two):
    if type(room_id) == str:
        room_id = UUID(room_id)
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    room.status = models.Statuses.played
    room.first_player_id = player_one
    room.second_player_id = player_two
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


def get_game_result(db: Session, user: schemas.User, skip: int = 0, limit: int = 100):
    print(type(db.query(models.Room).filter(or_(models.Room.first_player_id == user.id, models.Room.second_player_id == user.id)).offset(skip).limit(limit).all()))
    query = db.query(models.GameResult).filter(or_(models.GameResult.winner_id == user.id, models.GameResult.loser_id == user.id)).order_by(models.GameResult.created_at.desc()).offset(skip).limit(limit).all()
    
    for row in query:
        first_player = row.winner
        first_player.hashed_password = None
        second_player = row.loser
        second_player.hashed_password = None


    return query

def save_result(db: Session,
                is_dead_heat,
                winner_id,
                loser_id,
                winner_item,
                loser_item,
                room_id
                ):
    result = models.GameResult(
        is_dead_heat=is_dead_heat,
        winner_id=winner_id,
        winner_item=winner_item,
        loser_id=loser_id,
        loser_item=loser_item,
        room_id=room_id
    )
    print(loser_id)
    print(winner_id)
    db.add(result)
    db.commit()
    db.refresh(result)
    return result
