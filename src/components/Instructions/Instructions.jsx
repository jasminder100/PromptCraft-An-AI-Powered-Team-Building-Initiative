import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Target,
  Eye,
  Brain,
  Trophy,
  Clock,
  Lightbulb,
  Star,
  Zap,
  ArrowRight,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getGameSession } from '../../services/api';
import './Instructions.css';

const Instructions = ({ gameState, updateGameState }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (gameState.sessionId) {
      verifySession();
    } else {
      toast.error('No active game session found');
      navigate('/');
    }
  }, [gameState.sessionId, navigate]);

  const verifySession = async () => {
    try {
      setIsLoading(true);
      const result = await getGameSession(gameState.sessionId);
     
      if (result.success) {
        setSessionValid(true);
        updateGameState({
          playerName: result.data.player_name,
          targetPrompt: result.data.target_prompt,
          targetImageUrl: result.data.target_image_url,
          bestScore: result.data.best_score,
          bestGrade: result.data.best_grade,
          currentAttempt: result.data.attempts_count + 1
        });
      } else {
        toast.error('Game session not found in database');
        navigate('/');
      }
    } catch (error) {
      console.error('Error verifying session:', error);
      toast.error('Failed to verify game session');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = () => {
    if (!sessionValid) {
      toast.error('Please wait while we verify your game session');
      return;
    }

    updateGameState({
      gamePhase: 'playing',
      currentAttempt: 1
    });
   
    toast.success('Starting challenge! Make it count! 🎯');
    navigate('/game');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  if (isLoading) {
    return (
      <div className="instructions-page">
        <div className="bg-animation" />
        <div className="loading-instructions">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <h2>Preparing Your Challenge...</h2>
            <p>Please wait while we set up your PromptCraft experience.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="instructions-page">
      <div className="bg-animation" />
     
      <motion.div
        className="instructions-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="instructions-header" variants={itemVariants}>
          <div className="header-icon">
            <Target className="target-icon" />
          </div>
          <h1 className="instructions-title">
            Ready for PromptCraft?
          </h1>
          <p className="instructions-subtitle">
            Welcome <strong>{gameState.playerName}</strong>! Master the art of reverse prompt engineering in one perfect shot.
          </p>
          {sessionValid && (
            <div className="session-status">
              <CheckCircle className="status-icon success" />
              <span>Challenge verified and ready!</span>
            </div>
          )}
        </motion.div>

        <div className="instructions-content">
          <motion.div className="game-rules card" variants={cardVariants}>
            <div className="rules-header">
              <Brain className="rules-icon" />
              <h2 className="rules-title">How PromptCraft Works</h2>
            </div>
           
            <div className="rules-grid">
              <motion.div className="rule-step" variants={itemVariants}>
                <div className="step-number">1</div>
                <div className="step-content">
                  <Eye className="step-icon" />
                  <h3>Analyze the Masterpiece</h3>
                  <p>Study every detail of the AI-generated image with precision</p>
                </div>
              </motion.div>
             
              <motion.div className="rule-step" variants={itemVariants}>
                <div className="step-number">2</div>
                <div className="step-content">
                  <Brain className="step-icon" />
                  <h3>Craft Your Guess</h3>
                  <p>You have ONE shot to reverse-engineer the original prompt</p>
                </div>
              </motion.div>
             
              <motion.div className="rule-step" variants={itemVariants}>
                <div className="step-number">3</div>
                <div className="step-content">
                  <Trophy className="step-icon" />
                  <h3>Achieve Perfection</h3>
                  <p>Capture ALL meaningful words for 100% similarity score</p>
                </div>
              </motion.div>
             
              <motion.div className="rule-step" variants={itemVariants}>
                <div className="step-number">4</div>
                <div className="step-content">
                  <Clock className="step-icon" />
                  <h3>Race Against Time</h3>
                  <p>Speed matters! Faster completion gives you an edge in rankings</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="info-cards">
            <motion.div className="scoring-guide card" variants={cardVariants}>
              <div className="guide-header">
                <Star className="guide-icon" />
                <h3>Scoring & Ranking</h3>
              </div>
             
              <div className="score-levels">
                <div className="score-level grade-perfect">
                  <span className="grade">💯 (100%)</span>
                  <span className="description">PERFECT! All meaningful words captured</span>
                </div>
                <div className="score-level grade-a">
                  <span className="grade">A+ (98%+)</span>
                  <span className="description">Nearly perfect match</span>
                </div>
                <div className="score-level grade-a">
                  <span className="grade">A (92%+)</span>
                  <span className="description">Excellent meaningful match</span>
                </div>
                <div className="score-level grade-b">
                  <span className="grade">B (70%+)</span>
                  <span className="description">Good meaningful words</span>
                </div>
                <div className="score-level grade-c">
                  <span className="grade">C (40%+)</span>
                  <span className="description">Some meaningful matches</span>
                </div>
                <div className="score-level grade-f">
                  <span className="grade">F (&lt;40%)</span>
                  <span className="description">Needs more precision</span>
                </div>
              </div>
             
              <div className="ranking-note">
                <AlertTriangle className="note-icon" />
                <p><strong>Ranking System:</strong> First by similarity score (higher = better), then by completion time (faster = better) as tiebreaker.</p>
              </div>
            </motion.div>

            <motion.div className="strategy-tips card" variants={cardVariants}>
              <div className="tips-header">
                <Lightbulb className="tips-icon" />
                <h3>Master Strategy Tips</h3>
              </div>
             
              <div className="tips-list">
                <div className="tip-item">
                  <Zap className="tip-icon" />
                  <div>
                    <strong>Be comprehensive & specific</strong>
                    <p>Include subjects, adjectives, colors, lighting, mood, style</p>
                  </div>
                </div>
                <div className="tip-item">
                  <Zap className="tip-icon" />
                  <div>
                    <strong>Use exact descriptive terms</strong>
                    <p>"Crystalline lake" not "water body" - precision matters</p>
                  </div>
                </div>
                <div className="tip-item">
                  <Zap className="tip-icon" />
                  <div>
                    <strong>Balance speed and accuracy</strong>
                    <p>Higher score matters most, but speed breaks ties!</p>
                  </div>
                </div>
                <div className="tip-item">
                  <Zap className="tip-icon" />
                  <div>
                    <strong>Include atmospheric elements</strong>
                    <p>Golden hour, misty, dramatic shadows, soft lighting</p>
                  </div>
                </div>
                <div className="tip-item">
                  <Zap className="tip-icon" />
                  <div>
                    <strong>Think like an AI prompt</strong>
                    <p>What would YOU write to generate this exact image?</p>
                  </div>
                </div>
                <div className="tip-item">
                  <Zap className="tip-icon" />
                  <div>
                    <strong>Quality over quantity</strong>
                    <p>Better to nail key words than add irrelevant details</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div className="word-highlighting card" variants={cardVariants}>
            <h3 className="highlight-title">Instant Word Analysis Feedback</h3>
            <p className="highlight-description">
              After your guess, see exactly how well you did with color-coded analysis:
            </p>
            <div className="highlight-examples">
              <div className="highlight-item">
                <span className="word-perfect">Gold</span>
                <span className="highlight-desc">Perfect match - 100% contribution!</span>
              </div>
              <div className="highlight-item">
                <span className="word-correct">Green</span>
                <span className="highlight-desc">Exact meaningful match - maximum points!</span>
              </div>
              <div className="highlight-item">
                <span className="word-similar">Light Green</span>
                <span className="highlight-desc">Similar meaningful word - partial points</span>
              </div>
              <div className="highlight-item">
                <span className="word-wrong">Red</span>
                <span className="highlight-desc">Wrong meaningful word - no points</span>
              </div>
              <div className="highlight-item">
                <span className="word-neutral">Gray</span>
                <span className="highlight-desc">Common words (ignored in scoring)</span>
              </div>
            </div>
          </motion.div>

          <motion.div className="perfect-score-challenge card" variants={cardVariants}>
            <h3 className="challenge-title">🎯 The Perfect Score Challenge</h3>
            <div className="challenge-content">
              <div className="challenge-text">
                <h4>Can you achieve 100% similarity?</h4>
                <p>
                  When you capture <strong>every single meaningful word</strong> from the original prompt,
                  you'll achieve the coveted <span className="perfect-badge">💯 PERFECT SCORE</span>!
                </p>
                <div className="challenge-requirements">
                  <h5>Requirements for 100%:</h5>
                  <ul>
                    <li>✓ Include all key subjects and objects</li>
                    <li>✓ Capture all descriptive adjectives</li>
                    <li>✓ Match colors and lighting terms</li>
                    <li>✓ Include style and mood descriptors</li>
                    <li>✓ Don't miss any meaningful details</li>
                  </ul>
                </div>
                <div className="speed-bonus">
                  <h5>Speed Tiebreaker:</h5>
                  <p>If multiple players achieve the same score, the faster completion time wins!</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className="game-preview card" variants={cardVariants}>
            <h3 className="preview-title">🎯 Your PromptCraft Challenge</h3>
            <div className="preview-content">
              <div className="preview-image">
                <img
                  src={gameState.targetImageUrl}
                  alt="Challenge Preview"
                  className="preview-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    toast.error('Failed to load challenge image');
                  }}
                />
              </div>
              <div className="preview-info">
                <h4>This is your one-shot challenge!</h4>
                <p>Study every pixel, every color, every detail. What prompt would create this exact masterpiece?</p>
                <div className="preview-stats">
                  <div className="stat">
                    <strong>Player:</strong> {gameState.playerName}
                  </div>
                  <div className="stat">
                    <strong>Attempts:</strong> 1 perfect shot
                  </div>
                  <div className="stat">
                    <strong>Goal:</strong> 100% similarity + speed
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div className="start-section" variants={itemVariants}>
          <div className="player-ready">
            <h2 className="ready-title">Ready for the challenge, {gameState.playerName}?</h2>
            <p className="ready-subtitle">
              You have one perfect shot to reverse-engineer the prompt. Study the image, think like an AI, and craft your masterpiece guess. Can you achieve 100% and dominate the leaderboard? 🎯
            </p>
          </div>
         
          <motion.button
            className={`btn btn-primary start-btn ${!sessionValid ? 'disabled' : ''}`}
            onClick={handleStartGame}
            disabled={!sessionValid}
            whileHover={sessionValid ? { scale: 1.05 } : {}}
            whileTap={sessionValid ? { scale: 0.95 } : {}}
          >
            <Play size={24} />
            {sessionValid ? 'Start PromptCraft Challenge' : 'Preparing Challenge...'}
            <ArrowRight size={24} />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Instructions;