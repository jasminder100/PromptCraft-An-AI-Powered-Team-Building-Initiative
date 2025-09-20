import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import {
  Trophy,
  Star,
  Target,
  RotateCcw,
  Medal,
  Crown,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import './Results.css';

const Results = ({ gameState, resetGame }) => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = React.useState(false);

  useEffect(() => {
    if (gameState.bestScore >= 1.0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000);
    } else if (gameState.bestScore >= 0.75) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [gameState.bestScore]);

  const handleNewGame = () => {
    resetGame();
    navigate('/');
  };

  const getPerformanceMessage = () => {
    if (gameState.bestScore >= 1.0) return "🏆 LEGENDARY! You achieved the perfect 100% score! Master of PromptCraft!";
    if (gameState.bestScore >= 0.90) return "🌟 Outstanding! You're incredibly skilled at reverse prompt engineering!";
    if (gameState.bestScore >= 0.75) return "👍 Excellent work! You have strong visual analysis abilities!";
    if (gameState.bestScore >= 0.60) return "😊 Great job! You understood most of the image details!";
    if (gameState.bestScore >= 0.40) return "🎯 Good effort! Keep practicing your PromptCraft skills!";
    return "💪 Keep crafting! Every challenge makes you better at prompt engineering!";
  };

  const getScoreColor = (score) => {
    if (score >= 1.0) return '#ffd700';
    if (score >= 0.90) return '#28a745';
    if (score >= 0.75) return '#4facfe';
    if (score >= 0.60) return '#ffc107';
    if (score >= 0.40) return '#ff5722';
    return '#dc3545';
  };

  const getPerformanceIcon = () => {
    if (gameState.bestScore >= 1.0) return <Crown className="performance-icon perfect" />;
    if (gameState.bestScore >= 0.90) return <Trophy className="performance-icon legendary" />;
    if (gameState.bestScore >= 0.75) return <Medal className="performance-icon excellent" />;
    if (gameState.bestScore >= 0.60) return <Star className="performance-icon good" />;
    return <Target className="performance-icon learning" />;
  };

  const generateHighlightedText = (wordAnalysis) => {
    if (!wordAnalysis || !wordAnalysis.guess_analysis) return '';
   
    return wordAnalysis.guess_analysis.map((analysis, index) => {
      const { word, status } = analysis;
      let className = '';
     
      if (status === 'correct') className = 'word-correct';
      else if (status === 'similar') className = 'word-similar';
      else if (status === 'wrong') className = 'word-wrong';
      else className = 'word-neutral';
     
      return (
        <span key={index} className={className}>
          {word}{index < wordAnalysis.guess_analysis.length - 1 ? ' ' : ''}
        </span>
      );
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const singleAttempt = gameState.attempts[0];

  return (
    <div className="results-page">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={gameState.bestScore >= 1.0 ? 500 : 200}
          recede={true}
          colors={gameState.bestScore >= 1.0 ? ['#ffd700', '#ffed4e', '#fff59d', '#f9a825'] : undefined}
        />
      )}
     
      <div className="bg-animation" />
     
      <motion.div
        className="results-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="results-header" variants={itemVariants}>
          <div className="game-over-banner">
            <motion.div
              className="banner-text"
              animate={{
                scale: [1, 1.05, 1],
                textShadow: gameState.bestScore >= 1.0 ? [
                  '0 0 20px rgba(255, 215, 0, 0.5)',
                  '0 0 40px rgba(255, 215, 0, 0.8)',
                  '0 0 20px rgba(255, 215, 0, 0.5)'
                ] : [
                  '0 0 20px rgba(102, 126, 234, 0.5)',
                  '0 0 40px rgba(102, 126, 234, 0.8)',
                  '0 0 20px rgba(102, 126, 234, 0.5)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            >
              {gameState.bestScore >= 1.0 ? '🏆 PERFECT SCORE! 🏆' : '🎯 CHALLENGE COMPLETE! 🎯'}
            </motion.div>
          </div>
         
          <h1 className="results-title">
            PromptCraft Results for {gameState.playerName}
          </h1>
        </motion.div>

        <motion.div className="performance-overview card" variants={itemVariants}>
          <div className="performance-header">
            {getPerformanceIcon()}
            <div className="performance-text">
              <h2>Your Performance</h2>
              <p>{getPerformanceMessage()}</p>
            </div>
          </div>
         
          <div className="final-stats">
            <div className="stat-card best-score">
              <div className="stat-icon-container">
                <TrendingUp className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Final Score</div>
                <div
                  className="stat-value"
                  style={{ color: getScoreColor(gameState.bestScore) }}
                >
                  {gameState.bestScore >= 1.0 ? '💯 PERFECT!' : `${(gameState.bestScore * 100).toFixed(1)}%`}
                </div>
              </div>
            </div>
           
            <div className="stat-card final-grade">
              <div className="stat-icon-container">
                <Award className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Final Grade</div>
                <div className="stat-value grade-value">
                  {gameState.bestGrade}
                </div>
              </div>
            </div>
           
            <div className="stat-card completion-time">
              <div className="stat-icon-container">
                <Zap className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Completion Time</div>
                <div className="stat-value">{formatTime(gameState.gameDuration)}</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="results-content">
          <motion.div className="challenge-recap card" variants={itemVariants}>
            <div className="recap-header">
              <Target className="recap-icon" />
              <h3>Challenge Recap</h3>
            </div>
           
            <div className="recap-content">
              <div className="original-challenge">
                <h4>🎯 Original PromptCraft Challenge</h4>
                <div className="challenge-image-container">
                  <img
                    src={gameState.targetImageUrl}
                    alt="Challenge"
                    className="challenge-image-small"
                  />
                </div>
                <div className="original-prompt">
                  <strong>Original Prompt:</strong>
                  <div className="prompt-text">"{gameState.targetPrompt}"</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className="attempt-summary card" variants={itemVariants}>
            <div className="summary-header">
              <Trophy className="summary-icon" />
              <h3>Your One-Shot Attempt</h3>
            </div>
           
            {singleAttempt && (
              <motion.div
                className="attempt-summary perfect-attempt"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="attempt-summary-header">
                  <div className="attempt-number">
                    Your Perfect Shot
                    {gameState.bestScore >= 1.0 && <Crown className="perfect-crown" />}
                  </div>
                  <div
                    className="attempt-score"
                    style={{ color: getScoreColor(singleAttempt.similarity_score) }}
                  >
                    {singleAttempt.similarity_score >= 1.0 ? '💯 PERFECT!' : `${(singleAttempt.similarity_score * 100).toFixed(1)}%`}
                  </div>
                </div>
               
                <div className="attempt-details">
                  <div className="attempt-grade">
                    Grade: <span style={{ color: getScoreColor(singleAttempt.similarity_score) }}>
                      {singleAttempt.grade}
                    </span>
                  </div>
                 
                  <div className="attempt-guess">
                    <strong>Your Crafted Guess:</strong>
                    <div className="highlighted-guess">
                      {generateHighlightedText(singleAttempt.word_analysis)}
                    </div>
                  </div>
                 
                  {singleAttempt.word_analysis && (
                    <div className="word-match-stats">
                      <div className="match-summary">
                        <span className="match-count">
                          Meaningful words matched: {singleAttempt.word_analysis.exact_matches || 0}/{singleAttempt.word_analysis.total_target_meaningful || 0}
                        </span>
                        <span className="match-percentage">
                          ({singleAttempt.word_analysis.total_target_meaningful > 0
                            ? ((singleAttempt.word_analysis.exact_matches / singleAttempt.word_analysis.total_target_meaningful) * 100).toFixed(1)
                            : 0}% word precision)
                        </span>
                      </div>
                      {singleAttempt.word_analysis.exact_matches === singleAttempt.word_analysis.total_target_meaningful && (
                        <div className="perfect-match-notice">
                          🎯 You captured every single meaningful word! Perfect PromptCraft mastery!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        <motion.div className="results-actions" variants={itemVariants}>
          <div className="action-message">
            <h3>Ready for Another PromptCraft Challenge?</h3>
            <p>
              {gameState.bestScore >= 1.0
                ? "You've mastered this one! Can you achieve perfection again and secure your leaderboard position?"
                : "Practice makes perfect! Try another challenge to improve your score and climb the leaderboard."}
            </p>
          </div>
         
          <motion.button
            className="btn btn-primary new-game-btn"
            onClick={handleNewGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={24} />
            New PromptCraft Challenge
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Results;