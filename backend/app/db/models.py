from sqlalchemy import Integer, Column, String, ForeignKey, UUID, DateTime, Enum, Boolean
import enum
from sqlalchemy.orm import relationship
import datetime
from .database import Base
import uuid


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)


class Statuses(enum.Enum):
    created = "Created"
    played = "Played"
    canceled = "Canceled"


class Room(Base):
    __tablename__ = "rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.datetime.now())
    status = Column(Enum(Statuses), default=Statuses.created)
    first_player_id = Column(Integer, ForeignKey("users.id"), default=None, nullable=True, index=True)
    second_player_id = Column(Integer, ForeignKey("users.id"), default=None, nullable=True, index=True)

    first_player = relationship("User", foreign_keys=[first_player_id])
    second_player = relationship("User", foreign_keys=[second_player_id])


class GameResult(Base):
    __tablename__ = "games_results"

    id = Column(Integer, primary_key=True, index=True)
    is_dead_heat = is_dead_heat = Column(Boolean, nullable=True, default=None)
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    winner_item = Column(String)
    loser_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    loser_item = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.now())
    room_id = Column(UUID(as_uuid=True), ForeignKey("rooms.id"))

    winner = relationship("User", foreign_keys=[winner_id])
    loser = relationship("User", foreign_keys=[loser_id])
    room = relationship("Room", foreign_keys=[room_id])