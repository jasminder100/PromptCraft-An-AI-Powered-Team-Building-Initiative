import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Home, BarChart3, Gamepad2, Wifi, WifiOff, Clock, Target } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ showLeaderboard, setShowLeaderboard, gameState }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = () => {
    if (gameState.gamePhase === 'playing' || gameState.gamePhase === 'results') {
      if (window.confirm('Are you sure you want to leave the current challenge? Your progress will be saved.')) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const getGamePhaseIndicator = () => {
    switch (gameState.gamePhase) {
      case 'login':
        return { text: 'Setup', color: '#ffc107', icon: '⚙️' };
      case 'instructions':
        return { text: 'Ready', color: '#17a2b8', icon: '📋' };
      case 'playing':
        return { text: 'Crafting', color: '#28a745', icon: '🎯' };
      case 'results':
        return { text: 'Complete', color: '#6f42c1', icon: '🏆' };
      default:
        return null;
    }
  };

  const phaseIndicator = getGamePhaseIndicator();

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.nav
      className="navbar glass"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">
        <div className="navbar-brand" onClick={handleHomeClick}>
          <Target className="brand-icon" />
          <span className="brand-text">PromptCraft</span>
          <div className="connection-status">
            <Wifi className="connection-icon connected" size={16} />
          </div>
        </div>
       
        <div className="navbar-info">
          {phaseIndicator && (
            <motion.div
              className="phase-indicator"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              style={{ borderColor: phaseIndicator.color }}
            >
              <span className="phase-icon">{phaseIndicator.icon}</span>
              <span className="phase-text" style={{ color: phaseIndicator.color }}>
                {phaseIndicator.text}
              </span>
            </motion.div>
          )}

          {gameState.playerName && (
            <motion.div
              className="player-info"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="player-label">Player:</span>
              <span className="player-name">{gameState.playerName}</span>
            </motion.div>
          )}
         
          {gameState.gamePhase === 'playing' && (
            <motion.div
              className="game-progress"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="progress-text">
                One Shot Challenge
              </span>
              <div className="progress-bar">
                <div
                  className="progress-fill one-shot"
                  style={{ width: '100%', background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' }}
                />
              </div>
              <div className="score-info">
                <span className="best-score">
                  Target: 100%
                </span>
                <span className="best-grade" style={{ color: '#28a745' }}>
                  Perfect Score
                </span>
              </div>
              {gameState.gameDuration !== undefined && (
                <div className="timer-display">
                    <Clock size={16} />
                    <span>{formatTime(gameState.gameDuration)}</span>
                </div>
              )}
            </motion.div>
          )}

          {gameState.gamePhase === 'results' && gameState.bestScore > 0 && (
            <motion.div
              className="final-score"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="final-score-label">Final:</span>
              <span className="final-score-value" style={{
                color: gameState.bestScore >= 1.0 ? '#ffd700' :
                      gameState.bestScore >= 0.8 ? '#28a745' :
                      gameState.bestScore >= 0.6 ? '#ffc107' : '#dc3545'
              }}>
                {gameState.bestScore >= 1.0 ? '💯 PERFECT!' : `${(gameState.bestScore * 100).toFixed(1)}% (${gameState.bestGrade})`}
              </span>
              {gameState.gameDuration !== undefined && (
                <div className="timer-display">
                    <Clock size={16} />
                    <span>{formatTime(gameState.gameDuration)}</span>
                </div>
              )}
            </motion.div>
          )}
        </div>
       
        <div className="navbar-actions">
          {location.pathname !== '/' && (
            <motion.button
              className="nav-btn home-btn"
              onClick={handleHomeClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Return to Home"
            >
              <Home size={20} />
              <span>Home</span>
            </motion.button>
          )}

          <motion.button
            className={`nav-btn leaderboard-btn ${showLeaderboard ? 'active' : ''}`}
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="View Leaderboard"
          >
            <Trophy size={20} />
            <span>Leaderboard</span>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;