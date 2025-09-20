import axios from 'axios';

// Base API URL for your backend
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance for backend
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generate image using backend API (which will use Gemini)
export const generateImage = async (prompt) => {
  try {
    const response = await api.post('/generate-image', {
      prompt: prompt
    });

    if (response.data.success) {
      return {
        success: true,
        image_url: response.data.image_url,
        model: response.data.model || 'imagen-4.0-generate-001',
        resolution: response.data.resolution || '1K',
        provider: response.data.provider || 'Google Imagen 4.0'
      };
    } else {
      throw new Error(response.data.error || 'Failed to generate image');
    }
  } catch (error) {
    console.error('Image generation error:', error);
   
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to generate image with Imagen 4.0'
    };
  }
};

// Calculate similarity using backend API (no more OpenAI dependency)
export const calculateSimilarity = async (targetPrompt, guessPrompt) => {
  try {
    const response = await api.post('/calculate-similarity', {
      target_prompt: targetPrompt,
      guess_prompt: guessPrompt
    });

    if (response.data.success) {
      return {
        success: true,
        similarity_score: response.data.similarity_score,
        grade: response.data.grade,
        word_analysis: response.data.word_analysis
      };
    } else {
      throw new Error(response.data.error || 'Failed to calculate similarity');
    }
  } catch (error) {
    console.error('Similarity calculation error:', error);
   
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to calculate similarity'
    };
  }
};

// Backend API functions
export const createGameSession = async (playerName, targetPrompt, targetImageUrl) => {
  try {
    const response = await api.post('/create-session', {
      team_name: playerName,
      target_prompt: targetPrompt,
      target_image_url: targetImageUrl,
    });
   
    return {
      success: true,
      session_id: response.data.session_id,
      data: response.data
    };
  } catch (error) {
    console.error('Create game session error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.response?.data?.message || 'Failed to create game session'
    };
  }
};

export const getGameSession = async (sessionId) => {
  try {
    const response = await api.get(`/session/${sessionId}`);
   
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get game session error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.response?.data?.message || 'Failed to get game session'
    };
  }
};

export const addGuessAttempt = async (sessionId, attemptNumber, guessPrompt, similarityScore, grade, wordAnalysis) => {
  try {
    const response = await api.post('/add-attempt', {
      session_id: sessionId,
      attempt_number: attemptNumber,
      guess_prompt: guessPrompt,
      similarity_score: similarityScore,
      grade: grade,
      word_analysis: wordAnalysis,
    });
   
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Add guess attempt error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.response?.data?.message || 'Failed to save guess attempt'
    };
  }
};

export const updateGameSessionDuration = async (sessionId, duration) => {
  try {
    const response = await api.patch(`/session/${sessionId}`, {
      duration: duration
    });
   
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Update game session duration error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.response?.data?.message || 'Failed to update game session duration'
    };
  }
};

export const endGameSession = async (sessionId, finalDuration, bestScore, bestGrade) => {
  try {
    const response = await api.post(`/session/${sessionId}/complete`, {
      duration: finalDuration,
      best_score: bestScore,
      best_grade: bestGrade
    });
   
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('End game session error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.response?.data?.message || 'Failed to end game session'
    };
  }
};

export const getLeaderboard = async () => {
  try {
    const response = await api.get('/leaderboard');
   
    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.response?.data?.message || 'Failed to get leaderboard',
      data: []
    };
  }
};