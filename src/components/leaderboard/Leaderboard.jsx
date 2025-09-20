import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 Trophy,
 Medal,
 Award,
 Crown,
 Star,
 TrendingUp,
 Calendar,
 User,
 X,
 Loader,
 RefreshCw,
 Filter,
 Search,
 Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getLeaderboard } from '../../services/api';
import './Leaderboard.css';

const Leaderboard = ({ onClose }) => {
 const [leaderboardData, setLeaderboardData] = useState([]);
 const [filteredData, setFilteredData] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [sortBy, setSortBy] = useState('score');
 const [filterGrade, setFilterGrade] = useState('all');

 useEffect(() => {
 fetchLeaderboard();
 }, []);

 useEffect(() => {
 filterAndSortData();
 }, [leaderboardData, searchTerm, sortBy, filterGrade]);

 const fetchLeaderboard = async () => {
 try {
 setLoading(true);
 setError(null);
 const result = await getLeaderboard();
 
 if (result.success) {
 setLeaderboardData(result.data || []);
 if (result.data && result.data.length > 0) {
 toast.success(`Loaded ${result.data.length} completed games!`);
 }
 } else {
 setError(result.error || 'Failed to fetch leaderboard');
 toast.error(result.error || 'Failed to load leaderboard');
 }
 } catch (err) {
 const errorMessage = 'Failed to connect to server. Please check if the backend is running.';
 setError(errorMessage);
 toast.error(errorMessage);
 } finally {
 setLoading(false);
 }
 };

 const filterAndSortData = () => {
 let filtered = [...leaderboardData];

 if (searchTerm) {
 filtered = filtered.filter(entry =>
 entry.team_name.toLowerCase().includes(searchTerm.toLowerCase())
 );
 }

 if (filterGrade !== 'all') {
 filtered = filtered.filter(entry => {
 const grade = entry.best_grade.charAt(0);
 return grade === filterGrade;
 });
 }

 filtered.sort((a, b) => {
 switch (sortBy) {
 case 'score':
 if (a.best_score !== b.best_score) {
 return b.best_score - a.best_score;
 }
 return (a.duration || Infinity) - (b.duration || Infinity);
 
 case 'date':
 return new Date(b.created_at) - new Date(a.created_at);
 
 case 'duration':
 return (a.duration || Infinity) - (b.duration || Infinity);
 
 case 'grade':
 const gradeOrder = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'F': 1 };
 const aGrade = gradeOrder[a.best_grade.charAt(0)] || 0;
 const bGrade = gradeOrder[b.best_grade.charAt(0)] || 0;
 
 if (aGrade !== bGrade) {
 return bGrade - aGrade;
 }
 return (a.duration || Infinity) - (b.duration || Infinity);
 
 default:
 if (a.best_score !== b.best_score) {
 return b.best_score - a.best_score;
 }
 return (a.duration || Infinity) - (b.duration || Infinity);
 }
 });

 setFilteredData(filtered);
 };

 const getPositionIcon = (position) => {
 switch (position) {
 case 1:
 return <Crown className="position-icon gold" size={24} />;
 case 2:
 return <Trophy className="position-icon silver" size={24} />;
 case 3:
 return <Medal className="position-icon bronze" size={24} />;
 default:
 return <Award className="position-icon default" size={20} />;
 }
 };

 const getScoreColor = (score) => {
 if (score >= 0.95) return '#ffd700';
 if (score >= 0.90) return '#28a745';
 if (score >= 0.80) return '#4facfe';
 if (score >= 0.70) return '#17a2b8';
 if (score >= 0.60) return '#ffc107';
 if (score >= 0.50) return '#fd7e14';
 return '#dc3545';
 };

 const formatDate = (dateString) => {
 const date = new Date(dateString);
 return date.toLocaleDateString('en-US', {
 month: 'short',
 day: 'numeric',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit'
 });
 };

 const formatTime = (totalSeconds) => {
 if (totalSeconds === undefined || totalSeconds === null) return 'N/A';
 const minutes = Math.floor(totalSeconds / 60);
 const seconds = totalSeconds % 60;
 return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
 };

 const getPerformanceBadge = (score) => {
 if (score >= 1.0) return { text: 'Perfect', color: '#ffd700', icon: Crown };
 if (score >= 0.95) return { text: 'Legendary', color: '#ffd700', icon: Crown };
 if (score >= 0.90) return { text: 'Champion', color: '#28a745', icon: Trophy };
 if (score >= 0.80) return { text: 'Expert', color: '#4facfe', icon: Medal };
 if (score >= 0.70) return { text: 'Skilled', color: '#17a2b8', icon: Award };
 if (score >= 0.60) return { text: 'Good', color: '#ffc107', icon: Star };
 return { text: 'Learning', color: '#fd7e14', icon: Award };
 };

 const calculateStats = () => {
 if (!Array.isArray(leaderboardData) || leaderboardData.length === 0) return null;

 const avgScore = leaderboardData.reduce((sum, entry) => sum + entry.best_score, 0) / leaderboardData.length;
 const topScore = Math.max(...leaderboardData.map(entry => entry.best_score));
 const gradeDistribution = leaderboardData.reduce((acc, entry) => {
 const grade = entry.best_grade.charAt(0);
 acc[grade] = (acc[grade] || 0) + 1;
 return acc;
 }, {});
 const validDurations = leaderboardData.filter(entry => entry.duration !== undefined && entry.duration !== null);
 const avgDuration = validDurations.length > 0 ? validDurations.reduce((sum, entry) => sum + entry.duration, 0) / validDurations.length : 0;

 return {
 totalGames: leaderboardData.length,
 avgScore,
 topScore,
 gradeDistribution,
 avgDuration,
 };
 };

 const stats = calculateStats();

 const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 duration: 0.5,
 staggerChildren: 0.1
 }
 }
 };

 const itemVariants = {
 hidden: { opacity: 0, x: -20 },
 visible: {
 opacity: 1,
 x: 0,
 transition: { duration: 0.5 }
 }
 };

 const overlayVariants = {
 hidden: { opacity: 0 },
 visible: { opacity: 1 },
 exit: { opacity: 0 }
 };

 const modalVariants = {
 hidden: { scale: 0.8, opacity: 0 },
 visible: {
 scale: 1,
 opacity: 1,
 transition: { duration: 0.3 }
 },
 exit: {
 scale: 0.8,
 opacity: 0,
 transition: { duration: 0.3 }
 }
 };

 return (
 <AnimatePresence>
 <motion.div
 className="leaderboard-overlay"
 variants={overlayVariants}
 initial="hidden"
 animate="visible"
 exit="exit"
 onClick={onClose}
 style={{
 position: 'fixed',
 top: 0,
 left: 0,
 right: 0,
 bottom: 0,
 backgroundColor: 'rgba(0, 0, 0, 0.5)',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 zIndex: 1000
 }}
 >
 <motion.div
 className="leaderboard-modal"
 variants={modalVariants}
 onClick={(e) => e.stopPropagation()}
 style={{
 width: '95vw',
 maxWidth: '1200px',
 height: '90vh',
 maxHeight: '900px',
 backgroundColor: 'white',
 borderRadius: '16px',
 boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
 display: 'flex',
 flexDirection: 'column',
 overflow: 'hidden'
 }}
 >
 {/* HEADER */}
 <div style={{
 flexShrink: 0,
 padding: '1.5rem',
 borderBottom: '1px solid #e5e7eb',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between'
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
 <div style={{
 width: '48px',
 height: '48px',
 backgroundColor: '#fbbf24',
 borderRadius: '50%',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center'
 }}>
 <Trophy size={24} style={{ color: 'white' }} />
 </div>
 <div>
 <h1 style={{
 fontSize: '1.5rem',
 fontWeight: 'bold',
 margin: 0,
 color: '#111827'
 }}>
 🏆 PromptCraft Masters
 </h1>
 <p style={{
 fontSize: '0.875rem',
 color: '#6b7280',
 margin: 0
 }}>
 Top performers ranked by score, then speed
 </p>
 </div>
 </div>
 
 <motion.button
 onClick={onClose}
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.9 }}
 style={{
 width: '40px',
 height: '40px',
 borderRadius: '50%',
 border: 'none',
 backgroundColor: '#f3f4f6',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 cursor: 'pointer'
 }}
 >
 <X size={20} />
 </motion.button>
 </div>

 {/* CONTROLS */}
 <div style={{
 flexShrink: 0,
 padding: '1rem 1.5rem',
 borderBottom: '1px solid #e5e7eb',
 display: 'flex',
 gap: '1rem',
 alignItems: 'center',
 flexWrap: 'wrap'
 }}>
 <div style={{
 position: 'relative',
 flex: '1',
 minWidth: '200px'
 }}>
 <Search size={16} style={{
 position: 'absolute',
 left: '12px',
 top: '50%',
 transform: 'translateY(-50%)',
 color: '#9ca3af'
 }} />
 <input
 type="text"
 placeholder="Search players..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 style={{
 width: '100%',
 padding: '8px 8px 8px 40px',
 border: '1px solid #d1d5db',
 borderRadius: '8px',
 fontSize: '14px'
 }}
 />
 </div>

 <select
 value={sortBy}
 onChange={(e) => setSortBy(e.target.value)}
 style={{
 padding: '8px 12px',
 border: '1px solid #d1d5db',
 borderRadius: '8px',
 fontSize: '14px',
 minWidth: '180px'
 }}
 >
 <option value="score">Rank by Score & Time</option>
 <option value="date">Sort by Date</option>
 <option value="grade">Sort by Grade</option>
 <option value="duration">Sort by Time Only</option>
 </select>

 <select
 value={filterGrade}
 onChange={(e) => setFilterGrade(e.target.value)}
 style={{
 padding: '8px 12px',
 border: '1px solid #d1d5db',
 borderRadius: '8px',
 fontSize: '14px',
 minWidth: '120px'
 }}
 >
 <option value="all">All Grades</option>
 <option value="A">A Grades</option>
 <option value="B">B Grades</option>
 <option value="C">C Grades</option>
 <option value="D">D Grades</option>
 <option value="F">F Grades</option>
 </select>

 <button
 onClick={fetchLeaderboard}
 disabled={loading}
 style={{
 width: '40px',
 height: '40px',
 borderRadius: '8px',
 border: '1px solid #d1d5db',
 backgroundColor: 'white',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 cursor: 'pointer'
 }}
 >
 <RefreshCw size={16} style={{
 animation: loading ? 'spin 1s linear infinite' : 'none'
 }} />
 </button>
 </div>

 {/* MAIN CONTENT */}
 <div style={{
 flex: 1,
 overflow: 'hidden',
 display: 'flex',
 flexDirection: 'column'
 }}>
 {loading ? (
 <div style={{
 display: 'flex',
 flexDirection: 'column',
 alignItems: 'center',
 justifyContent: 'center',
 flex: 1,
 gap: '1rem'
 }}>
 <Loader size={48} style={{ animation: 'spin 1s linear infinite' }} />
 <p>Loading leaderboard...</p>
 </div>
 ) : error ? (
 <div style={{
 display: 'flex',
 flexDirection: 'column',
 alignItems: 'center',
 justifyContent: 'center',
 flex: 1,
 gap: '1rem'
 }}>
 <p style={{ color: '#dc2626' }}>❌ {error}</p>
 <button
 onClick={fetchLeaderboard}
 style={{
 padding: '8px 16px',
 backgroundColor: '#3b82f6',
 color: 'white',
 border: 'none',
 borderRadius: '8px',
 cursor: 'pointer'
 }}
 >
 Try Again
 </button>
 </div>
 ) : filteredData.length === 0 ? (
 <div style={{
 display: 'flex',
 flexDirection: 'column',
 alignItems: 'center',
 justifyContent: 'center',
 flex: 1,
 gap: '1rem'
 }}>
 {leaderboardData.length === 0 ? (
 <>
 <Trophy size={64} style={{ color: '#9ca3af' }} />
 <h3>No Games Played Yet</h3>
 <p>Be the first to complete a PromptCraft challenge and claim the top spot!</p>
 </>
 ) : (
 <>
 <Filter size={64} style={{ color: '#9ca3af' }} />
 <h3>No Results Found</h3>
 <p>Try adjusting your search or filter criteria.</p>
 </>
 )}
 </div>
 ) : (
 <motion.div
 variants={containerVariants}
 initial="hidden"
 animate="visible"
 style={{
 flex: 1,
 overflowY: 'auto',
 padding: '1rem 1.5rem'
 }}
 >
 {filteredData.map((entry, index) => {
 const badge = getPerformanceBadge(entry.best_score);
 const IconComponent = badge.icon;
 
 return (
 <motion.div
 key={entry.id}
 variants={itemVariants}
 whileHover={{ scale: 1.02, y: -2 }}
 transition={{ duration: 0.2 }}
 style={{
 display: 'flex',
 alignItems: 'center',
 gap: '1rem',
 padding: '1rem',
 marginBottom: '1rem',
 backgroundColor: 'white',
 border: `2px solid ${index < 3 ?
 index === 0 ? '#fbbf24' :
 index === 1 ? '#9ca3af' : '#cd7c2f'
 : '#e5e7eb'}`,
 borderRadius: '12px',
 boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
 position: 'relative',
 minHeight: '80px'
 }}
 >
 {/* Position */}
 <div style={{
 display: 'flex',
 flexDirection: 'column',
 alignItems: 'center',
 minWidth: '60px'
 }}>
 <div style={{
 fontSize: '1.25rem',
 fontWeight: 'bold',
 color: '#374151'
 }}>
 #{index + 1}
 </div>
 {getPositionIcon(index + 1)}
 </div>
 
 {/* Player Info */}
 <div style={{ flex: 1, minWidth: 0 }}>
 <h3 style={{
 fontSize: '1.25rem',
 fontWeight: 'bold',
 margin: '0 0 0.5rem 0',
 display: 'flex',
 alignItems: 'center',
 gap: '0.5rem'
 }}>
 {entry.team_name}
 {index === 0 && <Crown size={20} style={{ color: '#fbbf24' }} />}
 </h3>
 <div style={{
 display: 'flex',
 gap: '1rem',
 fontSize: '0.875rem',
 color: '#6b7280',
 flexWrap: 'wrap'
 }}>
 <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
 <Calendar size={14} />
 {formatDate(entry.created_at)}
 </span>
 <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
 <TrendingUp size={14} />
 {entry.attempts_count} attempt
 </span>
 <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
 <Clock size={14} />
 {formatTime(entry.duration)}
 </span>
 </div>
 </div>
 
 {/* Score */}
 <div style={{
 display: 'flex',
 alignItems: 'center',
 gap: '1rem'
 }}>
 <div style={{
 display: 'flex',
 flexDirection: 'column',
 alignItems: 'center',
 padding: '0.75rem',
 backgroundColor: getScoreColor(entry.best_score),
 borderRadius: '8px',
 minWidth: '80px'
 }}>
 <div style={{
 fontSize: '1.25rem',
 fontWeight: 'bold',
 color: 'white'
 }}>
 {entry.best_score >= 1.0 ? '💯' : `${(entry.best_score * 100).toFixed(1)}%`}
 </div>
 <div style={{
 fontSize: '0.875rem',
 color: 'white',
 opacity: 0.9
 }}>
 {entry.best_grade}
 </div>
 </div>
 
 <div style={{
 display: 'flex',
 alignItems: 'center',
 gap: '0.5rem',
 padding: '0.5rem 0.75rem',
 backgroundColor: badge.color,
 color: badge.color === '#ffd700' ? '#333' : 'white',
 borderRadius: '20px',
 fontSize: '0.875rem',
 fontWeight: 'bold'
 }}>
 <IconComponent size={16} />
 <span>{badge.text}</span>
 </div>
 </div>
 
 {/* Podium Ribbon */}
 {index < 3 && (
 <div style={{
 position: 'absolute',
 top: '-8px',
 right: '16px',
 backgroundColor: index === 0 ? '#fbbf24' :
 index === 1 ? '#9ca3af' : '#cd7c2f',
 color: 'white',
 padding: '4px 12px',
 borderRadius: '0 0 8px 8px',
 fontSize: '0.75rem',
 fontWeight: 'bold'
 }}>
 {index === 0 ? '1ST PLACE' : index === 1 ? '2ND PLACE' : '3RD PLACE'}
 </div>
 )}
 </motion.div>
 );
 })}
 </motion.div>
 )}
 </div>

 {/* FOOTER */}
 {!loading && !error && stats && (
 <div style={{
 flexShrink: 0,
 padding: '1rem 1.5rem',
 borderTop: '1px solid #e5e7eb',
 backgroundColor: '#f9fafb'
 }}>
 {/* Stats Row */}
 <div style={{
 display: 'flex',
 justifyContent: 'space-around',
 marginBottom: '1rem',
 flexWrap: 'wrap',
 gap: '1rem'
 }}>
 <div style={{
 display: 'flex',
 alignItems: 'center',
 gap: '0.5rem',
 fontSize: '0.875rem'
 }}>
 <User size={16} style={{ color: '#6b7280' }} />
 <span><strong>{stats.totalGames}</strong> Players</span>
 </div>
 <div style={{
 display: 'flex',
 alignItems: 'center',
 gap: '0.5rem',
 fontSize: '0.875rem'
 }}>
 <Trophy size={16} style={{ color: '#6b7280' }} />
 <span>Avg: <strong>{(stats.avgScore * 100).toFixed(1)}%</strong></span>
 </div>
 <div style={{
 display: 'flex',
 alignItems: 'center',
 gap: '0.5rem',
 fontSize: '0.875rem'
 }}>
 <Star size={16} style={{ color: '#6b7280' }} />
 <span>Top: <strong>{stats.topScore >= 1.0 ? '💯' : `${(stats.topScore * 100).toFixed(1)}%`}</strong></span>
 </div>
 {stats.avgDuration > 0 && (
 <div style={{
 display: 'flex',
 alignItems: 'center',
 gap: '0.5rem',
 fontSize: '0.875rem'
 }}>
 <Clock size={16} style={{ color: '#6b7280' }} />
 <span>Avg Time: <strong>{formatTime(Math.round(stats.avgDuration))}</strong></span>
 </div>
 )}
 </div>
 
 {/* Grade Distribution */}
 {stats.gradeDistribution && Object.keys(stats.gradeDistribution).length > 0 && (
 <div style={{ textAlign: 'center' }}>
 <h4 style={{
 fontSize: '0.875rem',
 margin: '0 0 0.75rem 0',
 color: '#374151'
 }}>
 Grade Distribution:
 </h4>
 <div style={{
 display: 'flex',
 gap: '1rem',
 justifyContent: 'center',
 alignItems: 'center',
 flexWrap: 'wrap'
 }}>
 {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
 <div key={grade} style={{
 display: 'flex',
 alignItems: 'center',
 gap: '0.5rem',
 padding: '0.5rem',
 backgroundColor: 'white',
 borderRadius: '8px',
 border: '1px solid #e5e7eb'
 }}>
 <span style={{
 fontSize: '0.875rem',
 fontWeight: 'bold',
 width: '20px',
 textAlign: 'center'
 }}>
 {grade}
 </span>
 <div style={{
 width: '60px',
 height: '8px',
 backgroundColor: getScoreColor(
 grade === 'A' ? 0.95 :
 grade === 'B' ? 0.75 :
 grade === 'C' ? 0.55 :
 grade === 'D' ? 0.35 : 0.15
 ),
 borderRadius: '4px'
 }} />
 <span style={{
 fontSize: '0.875rem',
 fontWeight: 'bold',
 minWidth: '20px',
 textAlign: 'center'
 }}>
 {count}
 </span>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 )}
 </motion.div>
 </motion.div>
 </AnimatePresence>
 );
};

export default Leaderboard;