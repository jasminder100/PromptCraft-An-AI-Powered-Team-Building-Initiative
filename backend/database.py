from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from models import Base, GameSession, GuessAttempt
from datetime import datetime
import os
import json
from dotenv import load_dotenv

load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./ai_prompt_guessing_game.db")
        self.engine = create_engine(self.database_url, echo=False)
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

    def get_db(self) -> Session:
        return self.SessionLocal()

    def create_game_session(self, team_name: str, target_prompt: str, target_image_url: str) -> str:
        """Create new game session"""
        db = self.get_db()
        try:
            session = GameSession(
                team_name=team_name,
                target_prompt=target_prompt,
                target_image_url=target_image_url,
            )
            db.add(session)
            db.commit()
            db.refresh(session)
            return session.id
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

    def get_game_session(self, session_id: str) -> GameSession:
        """Get game session by ID"""
        db = self.get_db()
        try:
            return db.query(GameSession).filter(GameSession.id == session_id).first()
        finally:
            db.close()

    def add_guess_attempt(
        self,
        session_id: str,
        attempt_number: int,
        guess_prompt: str,
        similarity_score: float,
        grade: str,
        word_analysis: dict = None, # Expect a dictionary now due to Pydantic
    ) -> str:
        """Add a guess attempt"""
        db = self.get_db()
        try:
            # Store word_analysis as JSON string (it's already a dict now)
            word_analysis_json = json.dumps(word_analysis) if word_analysis else None
           
            attempt = GuessAttempt(
                session_id=session_id,
                attempt_number=attempt_number,
                guess_prompt=guess_prompt,
                similarity_score=similarity_score,
                grade=grade,
                word_analysis=word_analysis_json,
            )
            db.add(attempt)

            session = db.query(GameSession).filter(GameSession.id == session_id).first()
            if session:
                session.attempts_count = attempt_number

                if similarity_score > session.best_score:
                    session.best_score = similarity_score
                    session.best_grade = grade
            db.commit()
            db.refresh(attempt)
            return attempt.id
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
   
    def update_game_session_final_data(self, session_id: str, duration: int, best_score: float, best_grade: str) -> bool:
        """Update game session final data (duration, best score, best grade) and mark as completed"""
        db = self.get_db()
        try:
            session = db.query(GameSession).filter(GameSession.id == session_id).first()
            if session:
                session.duration = duration
                session.best_score = best_score
                session.best_grade = best_grade
                session.game_completed = True
                session.completed_at = datetime.utcnow()
                db.commit()
                return True
            return False
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

    def get_session_attempts(self, session_id: str) -> list:
        """Get all attempts for a session"""
        db = self.get_db()
        try:
            attempts = (
                db.query(GuessAttempt)
                .filter(GuessAttempt.session_id == session_id)
                .order_by(GuessAttempt.attempt_number)
                .all()
            )
           
            # Parse word_analysis JSON for each attempt - now it will be the structured dict
            for attempt in attempts:
                if attempt.word_analysis:
                    try:
                        attempt.word_analysis = json.loads(attempt.word_analysis)
                    except:
                        attempt.word_analysis = None
           
            return attempts
        finally:
            db.close()

    def get_all_completed_games(self) -> list:
        """Get all completed games for leaderboard"""
        db = self.get_db()
        try:
            return (
                db.query(GameSession)
                .filter(GameSession.game_completed == True)
                .order_by(GameSession.best_score.desc())
                .all()
            )
        finally:
            db.close()

# Global instance
db_manager = DatabaseManager()