from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from database import db_manager
from game_engine import game_engine
import json

app = FastAPI(title="AI Prompt Guessing Game API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class GenerateImageRequest(BaseModel):
    prompt: str

class GenerateImageResponse(BaseModel):
    success: bool
    image_url: Optional[str] = None
    revised_prompt: Optional[str] = None
    model: Optional[str] = None
    resolution: Optional[str] = None
    aspect_ratio: Optional[str] = None
    provider: Optional[str] = None
    error: Optional[str] = None

class CreateSessionRequest(BaseModel):
    team_name: str
    target_prompt: str
    target_image_url: str

class CreateSessionResponse(BaseModel):
    success: bool
    session_id: Optional[str] = None
    error: Optional[str] = None

class CalculateSimilarityRequest(BaseModel):
    target_prompt: str
    guess_prompt: str

class WordAnalysisDetail(BaseModel):
    word: str
    status: str
    reason: Optional[str] = None

class WordAnalysisData(BaseModel):
    guess_analysis: List[WordAnalysisDetail]
    target_prompt_analysis: List[WordAnalysisDetail]
    exact_matches: int
    total_target_meaningful: int

class SimilarityResponse(BaseModel):
    success: bool
    similarity_score: Optional[float] = None
    grade: Optional[str] = None
    word_analysis: Optional[WordAnalysisData] = None
    error: Optional[str] = None

class AddAttemptRequest(BaseModel):
    session_id: str
    attempt_number: int
    guess_prompt: str
    similarity_score: float
    grade: str
    word_analysis: Optional[WordAnalysisData] = None

class GameSessionResponse(BaseModel):
    id: str
    team_name: str
    target_prompt: str
    target_image_url: str
    attempts_count: int
    best_score: float
    best_grade: str
    game_completed: bool
    created_at: str
    completed_at: Optional[str] = None
    duration: Optional[int] = None

class AttemptResponse(BaseModel):
    id: str
    session_id: str
    attempt_number: int
    guess_prompt: str
    similarity_score: float
    grade: str
    word_analysis: Optional[WordAnalysisData] = None
    created_at: str

class LeaderboardResponse(BaseModel):
    success: bool
    data: Optional[List[GameSessionResponse]] = None
    error: Optional[str] = None

class FinalizeSessionRequest(BaseModel):
    duration: int
    best_score: float
    best_grade: str

@app.get("/")
async def root():
    return {"message": "AI Prompt Guessing Game API", "status": "running"}

@app.post("/api/generate-image", response_model=GenerateImageResponse)
async def generate_image(request: GenerateImageRequest):
    """Generate image using Google Imagen 4.0 with fallback to OpenAI"""
    try:
        # First try Google Imagen 4.0
        result = game_engine.generate_image(request.prompt)
       
        # If Gemini fails, fallback to OpenAI
        if not result["success"] and hasattr(game_engine, 'generate_image_fallback_openai'):
            print("= Google Imagen failed, trying OpenAI DALL-E fallback...")
            result = game_engine.generate_image_fallback_openai(request.prompt)
       
        return GenerateImageResponse(**result)
    except Exception as e:
        return GenerateImageResponse(success=False, error=str(e))

@app.post("/api/create-session", response_model=CreateSessionResponse)
async def create_session(request: CreateSessionRequest):
    """Create a new game session"""
    try:
        session_id = db_manager.create_game_session(
            request.team_name,
            request.target_prompt,
            request.target_image_url
        )
        return CreateSessionResponse(success=True, session_id=session_id)
    except Exception as e:
        return CreateSessionResponse(success=False, error=str(e))

@app.get("/api/session/{session_id}", response_model=GameSessionResponse)
async def get_session(session_id: str):
    """Get game session by ID"""
    try:
        session = db_manager.get_game_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
       
        return GameSessionResponse(
            id=session.id,
            team_name=session.team_name,
            target_prompt=session.target_prompt,
            target_image_url=session.target_image_url,
            attempts_count=session.attempts_count,
            best_score=session.best_score,
            best_grade=session.best_grade,
            game_completed=session.game_completed,
            created_at=session.created_at.isoformat(),
            completed_at=session.completed_at.isoformat() if session.completed_at else None,
            duration=session.duration
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/calculate-similarity", response_model=SimilarityResponse)
async def calculate_similarity(request: CalculateSimilarityRequest):
    """Calculate similarity between target and guess prompts"""
    try:
        result = game_engine.calculate_text_similarity(
            request.target_prompt,
            request.guess_prompt
        )
        return SimilarityResponse(**result)
    except Exception as e:
        return SimilarityResponse(success=False, error=str(e))

@app.post("/api/add-attempt")
async def add_attempt(request: AddAttemptRequest):
    """Add a guess attempt to the database"""
    try:
        attempt_id = db_manager.add_guess_attempt(
            request.session_id,
            request.attempt_number,
            request.guess_prompt,
            request.similarity_score,
            request.grade,
            request.word_analysis.model_dump() if request.word_analysis else None
        )
        return {"success": True, "attempt_id": attempt_id}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/session/{session_id}/complete")
async def finalize_session(session_id: str, request: FinalizeSessionRequest):
    """Finalize game session with duration, best score, best grade and mark as completed"""
    try:
        success = db_manager.update_game_session_final_data(
            session_id,
            request.duration,
            request.best_score,
            request.best_grade
        )
        if not success:
            raise HTTPException(status_code=404, detail="Session not found or failed to update final data")
        return {"success": True, "message": "Session finalized successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/session/{session_id}/attempts")
async def get_session_attempts(session_id: str):
    """Get all attempts for a session"""
    try:
        attempts = db_manager.get_session_attempts(session_id)
       
        attempts_data = []
        for attempt in attempts:
            attempts_data.append({
                "id": attempt.id,
                "session_id": attempt.session_id,
                "attempt_number": attempt.attempt_number,
                "guess_prompt": attempt.guess_prompt,
                "similarity_score": attempt.similarity_score,
                "grade": attempt.grade,
                "word_analysis": json.loads(attempt.word_analysis) if attempt.word_analysis else None,
                "created_at": attempt.created_at.isoformat()
            })
       
        return {"success": True, "data": attempts_data}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard():
    """Get leaderboard data"""
    try:
        games = db_manager.get_all_completed_games()
       
        leaderboard_data = []
        for game in games:
            leaderboard_data.append(GameSessionResponse(
                id=game.id,
                team_name=game.team_name,
                target_prompt=game.target_prompt,
                target_image_url=game.target_image_url,
                attempts_count=game.attempts_count,
                best_score=game.best_score,
                best_grade=game.best_grade,
                game_completed=game.game_completed,
                created_at=game.created_at.isoformat(),
                completed_at=game.completed_at.isoformat() if game.completed_at else None,
                duration=game.duration
            ))
       
        return LeaderboardResponse(success=True, data=leaderboard_data)
    except Exception as e:
        return LeaderboardResponse(success=False, error=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)