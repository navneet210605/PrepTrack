import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Target,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
  History,
  Play,
  ArrowRight,
  ArrowLeft,
  Award,
  AlertCircle,
  Check,
  ChevronRight,
  Eye,
  X,
  Sparkles
} from 'lucide-react';

const Practice = () => {
  const { user, refreshUser } = useAuth();
  const location = useLocation();

  // Active view: 'config' | 'testing' | 'result' | 'history'
  const [activeTab, setActiveTab] = useState('config');

  // Test setup parameters
  const [category, setCategory] = useState(location.state?.category || 'DSA');
  const [difficulty, setDifficulty] = useState('Mixed');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Active test runner state
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: selectedIndex }
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // Result state
  const [resultData, setResultData] = useState(null);

  // History state
  const [historyAttempts, setHistoryAttempts] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedAttemptDetail, setSelectedAttemptDetail] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Countdown timer hook for test execution
  useEffect(() => {
    let timerId = null;
    if (timerActive && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerActive && timeLeft <= 0) {
      // Auto-submit when countdown hits zero
      handleAutoSubmit();
    }
    return () => clearInterval(timerId);
  }, [timerActive, timeLeft]);

  // Load history when tab is clicked
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory(historyPage);
    }
  }, [activeTab, historyPage]);

  const fetchHistory = async (page = 1) => {
    try {
      setHistoryLoading(true);
      const res = await api.get(`/tests/history?page=${page}&limit=8`);
      if (res.data.success) {
        setHistoryAttempts(res.data.data);
        setHistoryTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching test history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const startTest = async () => {
    try {
      setLoading(true);
      setError('');

      // MongoDB Aggregation: $match -> $sample -> $project
      const res = await api.post('/tests/start', {
        category,
        difficulty,
        count
      });

      if (res.data.success && res.data.data.length > 0) {
        setQuestions(res.data.data);
        setCurrentIdx(0);
        setAnswers({});
        setTimeLeft(res.data.data.length * 60); // 60 seconds per question
        setStartTime(Date.now());
        setTimerActive(true);
        setActiveTab('testing');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start test session.');
    } finally {
      setLoading(false);
    }
  };

  const selectOption = (qId, optionIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleAutoSubmit = () => {
    submitTest();
  };

  const submitTest = async () => {
    setTimerActive(false);
    setLoading(true);
    setError('');

    try {
      const timeTakenSec = Math.round((Date.now() - (startTime || Date.now())) / 1000);
      const questionIds = questions.map((q) => q._id);
      const formattedAnswers = questions.map((q) => ({
        questionId: q._id,
        selectedIndex: answers[q._id] !== undefined ? answers[q._id] : -1
      }));

      // Server-side grading & streak update with MongoDB operators
      const res = await api.post('/tests/submit', {
        questionIds,
        answers: formattedAnswers,
        timeTakenSec,
        category,
        difficulty
      });

      if (res.data.success) {
        setResultData(res.data.data);
        setActiveTab('result');
        if (refreshUser) refreshUser();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit test attempt.');
    } finally {
      setLoading(false);
    }
  };

  const viewAttemptDetail = async (attemptId) => {
    try {
      const res = await api.get(`/tests/${attemptId}`);
      if (res.data.success) {
        setSelectedAttemptDetail(res.data.data);
        setDetailModalOpen(true);
      }
    } catch (err) {
      console.error('Error loading attempt detail:', err);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
  };

  return (
    <div>
      {/* Tab Switcher */}
      {activeTab !== 'testing' && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setActiveTab('config')}
            className={`btn ${activeTab === 'config' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Target size={16} />
            <span>New Practice Test</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <History size={16} />
            <span>Test History & Reviews</span>
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* VIEW 1: TEST CONFIGURATION SELECTOR */}
      {activeTab === 'config' && (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div className="card">
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'inline-flex', padding: '0.6rem', borderRadius: '12px', background: 'var(--wc-blue-wash)', color: 'var(--wc-blue)', marginBottom: '0.75rem', border: '1px solid var(--wc-blue-border)', boxShadow: 'var(--shadow-sm)' }}>
                <Target size={26} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                Start Adaptive Practice Test
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                MongoDB aggregation ($match + $sample) randomly selects questions with server-side projection hiding answer keys.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Subject Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="DSA">DSA (Data Structures & Algorithms)</option>
                <option value="Aptitude">Aptitude (Quant, Logical, Verbal)</option>
                <option value="CS Core">CS Core (OS, DBMS, CN, OOP)</option>
                <option value="Development">Development (JS, React, Node, MongoDB)</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Difficulty Filter</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="Mixed">Mixed (All Levels)</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Question Count</label>
                <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
                  <option value={5}>5 Questions (5 mins)</option>
                  <option value={10}>10 Questions (10 mins)</option>
                  <option value={15}>15 Questions (15 mins)</option>
                </select>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.1rem 1.25rem',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={15} color="var(--accent-amber)" /> Assessment Rules:
              </div>
              <ul style={{ paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                <li>1 minute allotted per question with automatic submission at 00:00.</li>
                <li>Questions are graded securely on the server; explanations unlock immediately upon submission.</li>
                <li>Completing a test increments your daily activity streak in MongoDB!</li>
              </ul>
            </div>

            <button
              onClick={startTest}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
              disabled={loading}
            >
              <Play size={18} />
              <span>{loading ? 'Assembling Test...' : 'Begin Test Session'}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE TEST RUNNER */}
      {activeTab === 'testing' && questions.length > 0 && (
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          {/* Top Bar with Timer and Progress */}
          <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge badge-medium">{questions[currentIdx]?.category}</span>
              <span className={`badge ${questions[currentIdx]?.difficulty === 'Easy' ? 'badge-easy' : questions[currentIdx]?.difficulty === 'Hard' ? 'badge-hard' : 'badge-medium'}`}>
                {questions[currentIdx]?.difficulty}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {questions[currentIdx]?.topic}
              </span>
            </div>

            {/* Countdown Timer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: timeLeft <= 60 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(99, 102, 241, 0.15)',
              border: `1px solid ${timeLeft <= 60 ? 'rgba(244, 63, 94, 0.4)' : 'rgba(99, 102, 241, 0.3)'}`,
              color: timeLeft <= 60 ? '#f43f5e' : '#818cf8',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)'
            }}>
              <Clock size={16} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span>Single Choice</span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: '1.6', marginBottom: '1.5rem' }}>
              {questions[currentIdx]?.text}
            </h3>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {questions[currentIdx]?.options.map((opt, optIdx) => {
                const isSelected = answers[questions[currentIdx]._id] === optIdx;
                return (
                  <div
                    key={optIdx}
                    onClick={() => selectOption(questions[currentIdx]._id, optIdx)}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'rgba(15, 23, 42, 0.6)',
                      border: `1.5px solid ${isSelected ? 'var(--accent-indigo)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      border: `1.5px solid ${isSelected ? 'var(--accent-indigo)' : 'var(--text-muted)'}`,
                      background: isSelected ? 'var(--accent-indigo)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {isSelected ? <Check size={14} /> : String.fromCharCode(65 + optIdx)}
                    </div>
                    <span style={{ fontSize: '0.95rem', color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                      {opt}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Palette & Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Palette dots */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {questions.map((q, idx) => {
                const isAnswered = answers[q._id] !== undefined;
                const isCurrent = idx === currentIdx;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: isCurrent ? '2px solid var(--accent-indigo)' : '1px solid var(--border-color)',
                      background: isAnswered ? '#10b981' : isCurrent ? 'rgba(99, 102, 241, 0.3)' : 'rgba(15, 23, 42, 0.6)',
                      color: isAnswered ? '#fff' : 'var(--text-secondary)'
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Next / Prev / Submit */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="btn btn-secondary"
              >
                <ArrowLeft size={16} />
                <span>Previous</span>
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="btn btn-primary"
                >
                  <span>Next</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={submitTest}
                  className="btn btn-success"
                  style={{ fontWeight: 700 }}
                  disabled={loading}
                >
                  <Check size={16} />
                  <span>{loading ? 'Grading...' : 'Submit Assessment'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: TEST RESULT & DETAILED REVIEW */}
      {activeTab === 'result' && resultData && (
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          {/* Result Summary Card */}
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem', marginBottom: '2rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: resultData.accuracy >= 70 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: resultData.accuracy >= 70 ? '#10b981' : '#f43f5e',
              marginBottom: '1rem'
            }}>
              <Award size={36} />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              Test Assessment Complete
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Results analyzed and scored securely on server.
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2.5rem',
              padding: '1.25rem',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '480px',
              margin: '0 auto 1.5rem'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SCORE</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {resultData.score} / {resultData.total}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ACCURACY</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: resultData.accuracy >= 70 ? '#10b981' : '#f43f5e' }}>
                  {resultData.accuracy}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TIME SPENT</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>
                  {resultData.timeTakenSec}s
                </div>
              </div>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              <CheckCircle size={16} />
              <span>Daily Streak Updated in MongoDB: {resultData.streak?.current || 1} Days Active</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button onClick={() => setActiveTab('config')} className="btn btn-primary">
                <RotateCcw size={16} />
                <span>Practice Another Test</span>
              </button>
              <button onClick={() => setActiveTab('history')} className="btn btn-secondary">
                <History size={16} />
                <span>View All History</span>
              </button>
            </div>
          </div>

          {/* Detailed Question Review */}
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
            Detailed Solutions & Explanations ({resultData.results?.length} Questions)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {resultData.results?.map((q, idx) => (
              <div key={idx} className="card" style={{ borderLeft: `4px solid ${q.isCorrect ? '#10b981' : '#f43f5e'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700 }}>Q{idx + 1}.</span>
                    <span className="badge badge-medium">{q.category}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{q.topic}</span>
                  </div>
                  <span className={`badge ${q.isCorrect ? 'badge-done' : 'badge-hard'}`}>
                    {q.isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                  </span>
                </div>

                <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '1rem' }}>
                  {q.text}
                </p>

                {/* Options display with correct/user markers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                  {q.options.map((opt, optIdx) => {
                    const isUserChoice = q.selectedIndex === optIdx;
                    const isCorrectChoice = q.correctIndex === optIdx;

                    let bg = 'rgba(15, 23, 42, 0.4)';
                    let border = 'var(--border-color)';
                    let color = 'var(--text-secondary)';

                    if (isCorrectChoice) {
                      bg = 'rgba(16, 185, 129, 0.15)';
                      border = 'rgba(16, 185, 129, 0.5)';
                      color = '#10b981';
                    } else if (isUserChoice && !q.isCorrect) {
                      bg = 'rgba(244, 63, 94, 0.15)';
                      border = 'rgba(244, 63, 94, 0.5)';
                      color = '#f43f5e';
                    }

                    return (
                      <div
                        key={optIdx}
                        style={{
                          padding: '0.65rem 0.9rem',
                          borderRadius: 'var(--radius-md)',
                          background: bg,
                          border: `1px solid ${border}`,
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span style={{ color }}>
                          {String.fromCharCode(65 + optIdx)}. {opt}
                        </span>
                        {isCorrectChoice && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>CORRECT ANSWER</span>}
                        {isUserChoice && !isCorrectChoice && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f43f5e' }}>YOUR CHOICE</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ fontWeight: 700, color: '#818cf8', marginBottom: '0.2rem' }}>
                    💡 Explanation:
                  </div>
                  <div>{q.explanation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: TEST HISTORY */}
      {activeTab === 'history' && (
        <div>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Assessment History</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                MongoDB compound index (userId, createdAt: -1) ensures ultra-fast paginated history scans.
              </p>
            </div>
            <button onClick={() => setActiveTab('config')} className="btn btn-primary">
              <Play size={16} />
              <span>Take New Test</span>
            </button>
          </div>

          {historyLoading ? (
            <div className="spinner-container">
              <div className="spinner"></div>
              <p>Fetching test records from MongoDB...</p>
            </div>
          ) : historyAttempts.length > 0 ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {historyAttempts.map((attempt) => (
                  <div key={attempt._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span className="badge badge-medium">{attempt.category}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(attempt.createdAt).toLocaleDateString()} at {new Date(attempt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SCORE</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                            {attempt.score} / {attempt.total}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ACCURACY</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: attempt.accuracy >= 70 ? '#10b981' : '#f43f5e' }}>
                            {attempt.accuracy}%
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DURATION</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8' }}>
                            {attempt.timeTakenSec}s
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => viewAttemptDetail(attempt._id)}
                      className="btn btn-secondary"
                      style={{ width: '100%', fontSize: '0.8rem', marginTop: '0.5rem' }}
                    >
                      <Eye size={14} />
                      <span>Review Questions & Answers</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* History Pagination */}
              {historyTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  <button
                    disabled={historyPage <= 1}
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  >
                    Previous
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.8rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Page {historyPage} of {historyTotalPages}
                  </span>
                  <button
                    disabled={historyPage >= historyTotalPages}
                    onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <History size={40} className="empty-state-icon" />
              <div className="empty-state-title">No test history found</div>
              <p>Take your first practice test to generate historical review logs.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL: VIEW DETAILED ATTEMPT (POPULATE QUESTION REVIEW) */}
      {detailModalOpen && selectedAttemptDetail && (
        <div className="modal-overlay" onClick={() => setDetailModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Test Attempt Review</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  MongoDB Feature: .populate('answers.questionId')
                </p>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CATEGORY:</span>{' '}
                <strong>{selectedAttemptDetail.category}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SCORE:</span>{' '}
                <strong>{selectedAttemptDetail.score} / {selectedAttemptDetail.total} ({selectedAttemptDetail.accuracy}%)</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TIME:</span>{' '}
                <strong>{selectedAttemptDetail.timeTakenSec}s</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedAttemptDetail.answers?.map((ans, idx) => {
                const q = ans.questionId;
                if (!q) return null;
                return (
                  <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Question {idx + 1}</span>
                      <span className={`badge ${ans.isCorrect ? 'badge-done' : 'badge-hard'}`}>
                        {ans.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>{q.text}</p>

                    <div style={{ display: 'grid', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      {q.options?.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '4px',
                            background: oIdx === q.correctIndex ? 'rgba(16, 185, 129, 0.15)' : oIdx === ans.selectedIndex ? 'rgba(244, 63, 94, 0.15)' : 'transparent',
                            color: oIdx === q.correctIndex ? '#10b981' : oIdx === ans.selectedIndex ? '#f43f5e' : 'var(--text-secondary)'
                          }}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt}
                          {oIdx === q.correctIndex && ' (Correct Answer)'}
                          {oIdx === ans.selectedIndex && oIdx !== q.correctIndex && ' (Your Selected Answer)'}
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                      💡 {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Practice;
