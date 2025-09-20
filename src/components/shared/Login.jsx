import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Wand2, Sparkles, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateImage, createGameSession } from '../../services/api';
import './Login.css';

const Login = ({ gameState, updateGameState }) => {
  const [playerName, setPlayerName] = useState(gameState.playerName || '');
  const [targetPrompt, setTargetPrompt] = useState(gameState.targetPrompt || '');
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
   
    if (!playerName.trim()) {
      newErrors.playerName = 'Your name is required';
    } else if (playerName.trim().length < 2) {
      newErrors.playerName = 'Name must be at least 2 characters';
    }
   
    if (!targetPrompt.trim()) {
      newErrors.targetPrompt = 'Target prompt is required';
    } else if (targetPrompt.trim().length < 10) {
      newErrors.targetPrompt = 'Prompt must be at least 10 characters for good image generation';
    } else if (targetPrompt.trim().length > 500) {
      newErrors.targetPrompt = 'Prompt must be less than 500 characters';
    }
   
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsLoading(true);
    const loadingToastId = toast.loading('Creating your challenge...');
   
    try {
      toast.loading('🎨 Generating 1K resolution image with Google Imagen 4.0...', { id: loadingToastId });
     
      const imageResult = await generateImage(targetPrompt.trim());
     
      if (!imageResult.success) {
        throw new Error(imageResult.error || 'Failed to generate image');
      }
     
      toast.loading('💾 Creating game session...', { id: loadingToastId });
     
      const sessionResult = await createGameSession(
        playerName.trim(),
        targetPrompt.trim(),
        imageResult.image_url
      );
     
      if (!sessionResult.success) {
        throw new Error(sessionResult.error || 'Failed to create game session');
      }
     
      updateGameState({
        sessionId: sessionResult.session_id,
        playerName: playerName.trim(),
        targetPrompt: targetPrompt.trim(),
        targetImageUrl: imageResult.image_url,
        gamePhase: 'instructions',
        currentAttempt: 1,
        attempts: [],
        bestScore: 0,
        bestGrade: 'F'
      });
     
      toast.success(`🎮 1K Resolution challenge created successfully with ${imageResult.provider || 'Google Imagen 4.0'}!`, { id: loadingToastId });
     
      setTimeout(() => {
        navigate('/instructions');
      }, 1000);
     
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error(error.message || 'Failed to create challenge. Please try again.', { id: loadingToastId });
     
      if (error.message && error.message.includes('API')) {
        if (error.message.includes('Imagen') || error.message.includes('GoogleGenAI') || error.message.includes('Gemini')) {
          toast.error('Please check your Gemini API key configuration', {
            duration: 5000,
            icon: '🔑'
          });
        } else if (error.message.includes('OpenAI')) {
          toast.error('Please check your OpenAI API key configuration', {
            duration: 5000,
            icon: '🔑'
          });
        } else {
          toast.error('Please check your API key configuration', {
            duration: 5000,
            icon: '🔑'
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayerNameChange = (e) => {
    setPlayerName(e.target.value);
    if (errors.playerName) {
      setErrors(prev => ({ ...prev, playerName: null }));
    }
  };

  const handlePromptChange = (e) => {
    setTargetPrompt(e.target.value);
    if (errors.targetPrompt) {
      setErrors(prev => ({ ...prev, targetPrompt: null }));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
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

  return (
    <div className="login-page">
      <div className="bg-animation" />
     
      <motion.div
        className="login-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="login-header" variants={itemVariants}>
          <div className="header-icon">
            <Sparkles className="sparkle-icon" />
          </div>
          <h1 className="login-title">
            PromptCraft
          </h1>
          <p className="login-subtitle">
            Master the art of AI prompt creation! Create stunning 1K resolution images with Google's Imagen 4.0 and challenge yourself to reverse-engineer the perfect prompt in one shot.
          </p>
        </motion.div>

        <motion.div className="login-card card" variants={itemVariants}>
          <form onSubmit={handleSubmit} className="login-form">
            <motion.div className="form-section" variants={itemVariants}>
              <div className="section-header">
                <User className="section-icon" />
                <h3 className="section-title">Player Information</h3>
              </div>
             
              <div className="input-group">
                <label className="input-label">Your Name *</label>
                <input
                  type="text"
                  className={`input-field ${errors.playerName ? 'input-error' : ''}`}
                  placeholder="Enter your name..."
                  value={playerName}
                  onChange={handlePlayerNameChange}
                  disabled={isLoading}
                  maxLength={100}
                />
                {errors.playerName && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    <span>{errors.playerName}</span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div className="form-section admin-section" variants={itemVariants}>
              <div className="section-header">
                <Wand2 className="section-icon" />
                <h3 className="section-title">Challenge Setup</h3>
                <div className="admin-badge">Admin Only</div>
              </div>
             
              <div className="admin-warning">
                <strong>⚠️ Player should NOT see this section!</strong>
                <p>This prompt will generate a 1K resolution image using Google's Imagen 4.0 that you will try to reverse-engineer in ONE attempt.</p>
              </div>
             
              <div className="input-group">
                <div className="label-row">
                  <label className="input-label">Target Prompt (Keep Secret!) *</label>
                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => setShowPrompt(!showPrompt)}
                    disabled={isLoading}
                  >
                    {showPrompt ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showPrompt ? 'Hide' : 'Show'}
                  </button>
                </div>
                <textarea
                  className={`input-field textarea-field ${!showPrompt ? 'hidden-text' : ''} ${errors.targetPrompt ? 'input-error' : ''}`}
                  placeholder="Robot holding a red skateboard in a futuristic cityscape at sunset, photorealistic style with vibrant neon lighting and detailed metallic textures..."
                  value={targetPrompt}
                  onChange={handlePromptChange}
                  disabled={isLoading}
                  rows={4}
                  maxLength={500}
                />
                <div className="input-meta">
                  <span className="char-count">
                    {targetPrompt.length}/500 characters
                  </span>
                  {errors.targetPrompt && (
                    <div className="error-message">
                      <AlertCircle size={16} />
                      <span>{errors.targetPrompt}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div className="form-tips" variants={itemVariants}>
              <h4 className="tips-title">💡 Tips for Crafting Perfect 1K Resolution Prompts for Google Imagen 4.0:</h4>
              <div className="tips-grid">
                <div className="tip-item">
                  <strong>Specific Subjects:</strong> robot holding red skateboard, vintage motorcycle rider, elegant ballerina
                </div>
                <div className="tip-item">
                  <strong>Vivid Colors:</strong> vibrant neon blue, deep crimson red, golden sunset glow, electric purple
                </div>
                <div className="tip-item">
                  <strong>Detailed Environments:</strong> futuristic cityscape, ancient temple ruins, bustling night market
                </div>
                <div className="tip-item">
                  <strong>Art & Photo Styles:</strong> photorealistic, digital art, oil painting, professional photography
                </div>
                <div className="tip-item">
                  <strong>Lighting & Atmosphere:</strong> dramatic shadows, soft morning light, neon glow, cinematic lighting
                </div>
                <div className="tip-item">
                  <strong>Texture & Quality:</strong> metallic textures, high detail, sharp focus, 1K resolution quality
                </div>
              </div>
              <div className="perfect-score-tip">
                <strong>🎯 Perfect Score Challenge:</strong> Include many descriptive, meaningful words! Google's Imagen 4.0 at 1K resolution excels at understanding detailed prompts with specific subjects, colors, styles, textures, and atmospheric details. The more descriptive, the better the challenge!
              </div>
              <div className="resolution-info">
                <strong>📐 Resolution Info:</strong> All images are generated at 1K resolution (1024x1024 pixels) using Google Imagen 4.0 for optimal quality and consistency.
              </div>
            </motion.div>

            <motion.div className="form-actions" variants={itemVariants}>
              <button
                type="submit"
                className="btn btn-primary submit-btn"
                disabled={isLoading || !playerName.trim() || !targetPrompt.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner" />
                    Crafting 1K Challenge...
                  </>
                ) : (
                  <>
                    <Wand2 size={20} />
                    Create 1K PromptCraft Challenge
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
             
              {isLoading && (
                <div className="loading-info">
                  <p>🎨 Generating 1K resolution masterpiece with Google Imagen 4.0... This may take 15-30 seconds.</p>
                </div>
              )}
            </motion.div>
          </form>
        </motion.div>

        <motion.div className="login-footer" variants={itemVariants}>
          <p className="footer-text">
            Ready to master the art of 1K prompt crafting? One shot, perfect precision! ⚡
          </p>
          <div className="footer-note">
            <small>Powered by Google Imagen 4.0 (1K Resolution) & OpenAI Analysis • One Attempt • Maximum Impact</small>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;