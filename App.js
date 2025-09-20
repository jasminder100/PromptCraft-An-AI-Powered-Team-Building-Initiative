import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login/Login';
import Instructions from './components/Instructions/Instructions';
import Game from './components/Game/game';
import Results from './components/Results/Results';
import Leaderboard from './components/Leaderboard/Leaderboard';
import Navbar from './components/shared/Navbar';
import './styles/App.css';

function App() {
  const [gameState, setGameState] = useState({
    sessionId: null,
    playerName: '',
    targetPrompt: '',
    targetImageUrl: '',
    currentAttempt: 1,
    attempts: [],
    gamePhase: 'login', // login, instructions, playing, results
    bestScore: 0,
    bestGrade: 'F',
    gameStartTime: null,
    gameDuration: 0,
  });

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    const savedState = localStorage.getItem('promptCraftGameState');
    if (savedState) {
      const loadedState = JSON.parse(savedState);
      setGameState(loadedState);

      if (loadedState.gamePhase === 'playing' && loadedState.gameStartTime) {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        timerIntervalRef.current = setInterval(() => {
          setGameState(prev => {
            const elapsed = Math.floor((Date.now() - prev.gameStartTime) / 1000);
            return {
              ...prev,
              gameDuration: elapsed,
            };
          });
        }, 1000);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const { gameDuration, ...restState } = gameState;
    localStorage.setItem('promptCraftGameState', JSON.stringify(restState));
  }, [gameState.sessionId, gameState.playerName, gameState.targetPrompt, gameState.targetImageUrl, gameState.currentAttempt, gameState.attempts, gameState.gamePhase, gameState.bestScore, gameState.bestGrade, gameState.gameStartTime]);

  const updateGameState = (updates) => {
    setGameState(prev => {
      const newState = { ...prev, ...updates };

      if (prev.gamePhase !== 'playing' && newState.gamePhase === 'playing') {
        newState.gameStartTime = Date.now();
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        timerIntervalRef.current = setInterval(() => {
          setGameState(current => {
            const elapsed = Math.floor((Date.now() - current.gameStartTime) / 1000);
            return {
              ...current,
              gameDuration: elapsed,
            };
          });
        }, 1000);
      } else if (prev.gamePhase === 'playing' && newState.gamePhase !== 'playing') {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        if (newState.gameDuration === prev.gameDuration && prev.gameStartTime !== null) {
            newState.gameDuration = Math.floor((Date.now() - prev.gameStartTime) / 1000);
        }
      }

      return newState;
    });
  };

  const resetGame = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setGameState({
      sessionId: null,
      playerName: '',
      targetPrompt: '',
      targetImageUrl: '',
      currentAttempt: 1,
      attempts: [],
      gamePhase: 'login',
      bestScore: 0,
      bestGrade: 'F',
      gameStartTime: null,
      gameDuration: 0,
    });
    localStorage.removeItem('promptCraftGameState');
  };

  const pageVariants = {
    initial: { opacity: 0, x: -100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 100 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  return (
    <div className="app">
      <Router>
        <Navbar
          showLeaderboard={showLeaderboard}
          setShowLeaderboard={setShowLeaderboard}
          gameState={gameState}
        />
       
        {showLeaderboard ? (
          <Leaderboard onClose={() => setShowLeaderboard(false)} />
        ) : (
          <AnimatePresence mode="wait">
            <Routes>
              <Route
                path="/"
                element={
                  <motion.div
                    key="login"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Login
                      gameState={gameState}
                      updateGameState={updateGameState}
                    />
                  </motion.div>
                }
              />
             
              <Route
                path="/instructions"
                element={
                  gameState.sessionId ? (
                    <motion.div
                      key="instructions"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Instructions
                        gameState={gameState}
                        updateGameState={updateGameState}
                      />
                    </motion.div>
                  ) : <Navigate to="/" />
                }
              />
             
              <Route
                path="/game"
                element={
                  gameState.gamePhase === 'playing' ? (
                    <motion.div
                      key="game"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Game
                        gameState={gameState}
                        updateGameState={updateGameState}
                      />
                    </motion.div>
                  ) : <Navigate to="/" />
                }
              />
             
              <Route
                path="/results"
                element={
                  gameState.gamePhase === 'results' ? (
                    <motion.div
                      key="results"
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Results
                        gameState={gameState}
                        resetGame={resetGame}
                      />
                    </motion.div>
                  ) : <Navigate to="/" />
                }
              />
            </Routes>
          </AnimatePresence>
        )}
       
        <Toaster position="top-right" />
      </Router>
    </div>
  );
}

export default App;