from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    team_name = Column(String(255), nullable=False)
    target_prompt = Column(Text, nullable=False)
    target_image_url = Column(Text, nullable=False)
    attempts_count = Column(Integer, default=0)
    best_score = Column(Float, default=0.0)
    best_grade = Column(String(5), default="F")
    game_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    duration = Column(Integer, nullable=True) # NEW: Add duration column

class GuessAttempt(Base):
    __tablename__ = "guess_attempts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, nullable=False)
    attempt_number = Column(Integer, nullable=False)
    guess_prompt = Column(Text, nullable=False)
    similarity_score = Column(Float, nullable=False)
    grade = Column(String(5), nullable=False)
    word_analysis = Column(Text, nullable=True)  # Store JSON as text
    created_at = Column(DateTime, default=datetime.utcnow)