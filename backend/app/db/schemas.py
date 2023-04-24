from typing import Union, List
from pydantic import BaseModel
import uuid
from datetime import datetime 

class RoomBase(BaseModel):
    pass

class Room(RoomBase):
    id: uuid.UUID
    created_at: datetime

    
    class Config:
        orm_mode = True


class RoomCreate(RoomBase):
    pass


class UserBase(BaseModel):
    email: str = None


class User(UserBase):
    id: int
    first_name: str = None  
    last_name: str = None

    class Config:
        orm_mode = True    


class UserCreate(UserBase):
    first_name: str
    last_name: str
    password1: str
    password2: str


class ResultBase(BaseModel):
    is_dead_heat: bool
    winner_id: Union[int, None]
    loser_id: Union[int, None]
    winner_item: str
    loser_item: str
    room_id: uuid.UUID


class Result(ResultBase):
    id: int


class SaveResult(ResultBase):
    pass
