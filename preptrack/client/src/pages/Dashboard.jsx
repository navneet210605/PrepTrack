import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Briefcase,
  BookOpen,
  Sparkles,
  Lock,
  ChevronRight,
  CheckCircle2,
  Zap,
  Bot,
  Award,
  CheckCircle,
  Compass
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [accuracyStats, setAccuracyStats] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [scoreTrend, setScoreTrend] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [planRes, accRes, weakRes, trendRes, funnelRes] = await Promise.all([
          api.get('/dashboard/plan'),
          api.get('/stats/accuracy-by-category'),
          api.get('/stats/weak-topics'),
          api.get('/stats/score-trend'),
          api.get('/stats/applications-funnel')
        ]);

        if (planRes.data.success) setPlan(planRes.data.data);
        if (accRes.data.success) setAccuracyStats(accRes.data.data);
        if (weakRes.data.success) setWeakTopics(weakRes.data.data);
        if (trendRes.data.success) setScoreTrend(trendRes.data.data);
        if (funnelRes.data.success) setFunnelData(funnelRes.data.data);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        setError('Could not load all dashboard analytics. Ensure MongoDB is active.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getAccuracyColor = (val) => {
    if (val >= 75) return '#10b981';
    if (val >= 50) return '#6366f1';
    return '#f43f5e';
  };

  const funnelColors = {
    Applied: '#6366f1',
    Test: '#06b6d4',
    Interview: '#f59e0b',
    Offer: '#10b981',
    Rejected: '#f43f5e'
  };

  // Dynamic Placement Readiness Calculation
  const avgAccuracy = accuracyStats.length > 0 
    ? Math.round(accuracyStats.reduce((acc, curr) => acc + curr.accuracy, 0) / accuracyStats.length)
    : 78;
  const streakBonus = Math.min((plan?.streak?.current || 0) * 3, 15);
  const readinessScore = Math.min(Math.max(avgAccuracy + streakBonus, 55), 98);

  if (loading) {
    return (
      <div className="spinner-container" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Crunching MongoDB aggregation pipelines & performance analytics...</p>
      </div>
    );
  }

  return (
    <div>
      {/* 🚀 HIGH-IMPACT HERO BANNER WITH PLACEMENT READINESS RING */}
      <div className="hero-banner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', position: 'relative', zIndex: 1 }}>
          {/* Left Column: Greeting & Quick CTA Row */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <div className="shimmer-pill">
                <span className="pulse-dot"></span>
                <span style={{ color: 'var(--wc-blue)', fontWeight: 800 }}>PrepTrack 2.0 Live</span>
              </div>
              <span className="shimmer-pill" style={{ color: 'var(--text-secondary)' }}>
                <Sparkles size={12} color="var(--accent-amber)" /> Gemini Gen AI Ready
              </span>
            </div>

            <h1 className="gradient-title" style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '0.5rem' }}>
              Welcome back, {user?.name || 'Prep Cadet'}!
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '540px', marginBottom: '1.5rem', lineHeight: 1.55 }}>
              Your intelligent placement accelerator is analyzing MongoDB aggregation metrics and fine-tuning your daily practice targets.
            </p>

            {/* Quick Actions Row */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/practice')}
                className="btn btn-primary btn-glow"
                style={{ padding: '0.65rem 1.25rem', borderRadius: '12px', fontSize: '0.9rem' }}
              >
                <Zap size={16} />
                <span>Start Practice Test</span>
              </button>

              <button
                onClick={() => navigate('/assistant')}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem', borderRadius: '12px', fontSize: '0.9rem' }}
              >
                <Bot size={16} color="var(--wc-blue)" />
                <span>Ask AI Mentor</span>
              </button>

              <button
                onClick={() => navigate('/applications')}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem', borderRadius: '12px', fontSize: '0.9rem' }}
              >
                <Briefcase size={16} color="var(--wc-terracotta)" />
                <span>Track Jobs</span>
              </button>
            </div>
          </div>

          {/* Right Column: Circular Placement Readiness Gauge */}
          <div style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '20px',
            padding: '1.5rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-md)',
            position: 'relative'
          }}>
            <div style={{ position: 'relative', width: '96px', height: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="96" height="96" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke="var(--border-color)"
                  strokeWidth="8"
                />
                {/* Gradient Progress Ring */}
                <defs>
                  <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke="url(#readinessGrad)"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * readinessScore) / 100}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {readinessScore}%
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Readiness Score
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {readinessScore >= 80 ? 'Tier-1 Candidate' : readinessScore >= 65 ? 'Placement Ready' : 'In Preparation'}
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--accent-emerald)',
                background: 'var(--wc-green-wash)',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: '1px solid var(--wc-green-border)'
              }}>
                <Award size={12} /> Top 12% in Batch
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 📊 TOP METRIC CARDS WITH AMBIENT GLOW */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Streak Card */}
        <div className="stat-card-glow" style={{ '--glow-color': 'rgba(245, 158, 11, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>ACTIVE STREAK</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b', background: 'var(--wc-yellow-wash)', padding: '2px 8px', borderRadius: '9999px' }}>
              🔥 Daily Heat
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))',
              border: '1.5px solid var(--wc-yellow-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--wc-yellow)'
            }}>
              <Flame size={24} fill="var(--wc-yellow)" color="var(--wc-yellow)" />
            </div>
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {plan?.streak?.current || 0} {plan?.streak?.current === 1 ? 'Day' : 'Days'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Keep submitting tests daily
              </div>
            </div>
          </div>
        </div>

        {/* Due For Revision Card */}
        <div className="stat-card-glow" style={{ '--glow-color': 'rgba(79, 70, 229, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>DUE TODAY</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--wc-blue)', background: 'var(--wc-blue-wash)', padding: '2px 8px', borderRadius: '9999px' }}>
              ⚡ Spaced Rep
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(79, 70, 229, 0.05))',
              border: '1.5px solid var(--wc-blue-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--wc-blue)'
            }}>
              <Calendar size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--wc-blue)', lineHeight: 1.1 }}>
                {plan?.reviseCount || 0} Topics
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Ready for memory recall
              </div>
            </div>
          </div>
        </div>

        {/* Weakest Area Card */}
        <div className="stat-card-glow" style={{ '--glow-color': 'rgba(244, 63, 94, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>WEAKEST AREA</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--wc-rose)', background: 'var(--wc-rose-wash)', padding: '2px 8px', borderRadius: '9999px' }}>
              ⚠️ High Priority
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(244, 63, 94, 0.05))',
              border: '1.5px solid var(--wc-rose-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--wc-rose)'
            }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--wc-rose)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                {plan?.weakestTopic ? plan.weakestTopic.topic : 'None detected!'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {plan?.weakestTopic ? `${plan.weakestTopic.category} (${plan.weakestTopic.accuracy}%)` : 'Top marks across topics'}
              </div>
            </div>
          </div>
        </div>

        {/* Next Deadline Card */}
        <div className="stat-card-glow" style={{ '--glow-color': 'rgba(139, 92, 246, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>UPCOMING DEADLINES</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--wc-terracotta)', background: 'var(--wc-terracotta-wash)', padding: '2px 8px', borderRadius: '9999px' }}>
              ⏰ 72h Window
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))',
              border: '1.5px solid var(--wc-terracotta-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--wc-terracotta)'
            }}>
              <Clock size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--wc-terracotta)', lineHeight: 1.1 }}>
                {plan?.upcomingDeadlines?.length || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Applications requiring action
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Action Plan Section */}
      <div className="card" style={{
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={20} color="var(--accent-indigo)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Today's Action Blueprint</h2>
          </div>
          <span className="badge badge-medium">Auto-Generated Plan</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Action 1: Spaced Repetition */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '1.2rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--wc-terracotta)' }}>Spaced Repetition</span>
              <span className="badge badge-revise">{plan?.reviseCount || 0} Pending</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {plan?.reviseCount
                ? `You have ${plan.reviseCount} prep items due for revision today to solidify memory retention.`
                : 'All caught up! No spaced revisions pending for today.'}
            </p>
            <Link to="/prep-tracker" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
              <span>Go to Revise Queue</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Action 2: Target Weak Topic */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '1.2rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--wc-rose)' }}>Weak Area Remediation</span>
              {plan?.weakestTopic && (
                <span className="badge badge-hard">{plan.weakestTopic.accuracy}% Accuracy</span>
              )}
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {plan?.weakestTopic
                ? `Low score detected in "${plan.weakestTopic.topic}" (${plan.weakestTopic.category}). Practice test recommended.`
                : 'Great performance! No topics currently fall below the 60% accuracy threshold.'}
            </p>
            <button
              onClick={() => navigate('/practice', { state: { category: plan?.weakestTopic?.category, topic: plan?.weakestTopic?.topic } })}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              <span>Practice This Topic</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Action 3: Urgent Deadlines */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '1.2rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--wc-blue)' }}>Application Alerts</span>
              <span className="badge badge-medium">Next 72 Hours</span>
            </div>
            <div style={{ minHeight: '60px', marginBottom: '0.75rem' }}>
              {plan?.upcomingDeadlines && plan.upcomingDeadlines.length > 0 ? (
                plan.upcomingDeadlines.map((app) => (
                  <div key={app._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.3rem 0' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.company}</span>
                    <span style={{ color: 'var(--wc-yellow)', fontSize: '0.8rem', fontWeight: 600 }}>
                      {new Date(app.deadline).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  No application deadlines within the next 3 days.
                </p>
              )}
            </div>
            <Link to="/applications" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
              <span>Manage Applications</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Score Trend Area Chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Test Score Trend</h3>
                <span className="shimmer-pill" style={{ color: 'var(--wc-blue)', fontSize: '0.68rem', padding: '1px 7px' }}>
                  <TrendingUp size={11} /> Aggregation
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Accuracy timeline calculated via MongoDB $sort & $dateToString
              </p>
            </div>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--wc-blue-wash)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--wc-blue)'
            }}>
              <TrendingUp size={19} />
            </div>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            {scoreTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreAreaGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--wc-blue)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--wc-blue)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderWidth: 1, borderRadius: '12px', boxShadow: 'var(--shadow-lg)', color: 'var(--text-primary)' }}
                    formatter={(val) => [`${val}%`, 'Accuracy']}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="var(--wc-blue)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreAreaGlow)"
                    dot={{ fill: 'var(--wc-blue)', stroke: 'var(--bg-card)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#fff', stroke: 'var(--wc-blue)', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Take your first practice test to render score trends!
              </div>
            )}
          </div>
        </div>

        {/* Category Accuracy Bar Chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Accuracy by Category</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                MongoDB Feature: $unwind answers &rarr; $lookup questions &rarr; $group
              </p>
            </div>
            <BarChart3 size={20} color="var(--wc-green)" />
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            {accuracyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
                  <XAxis dataKey="category" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderWidth: 1, borderRadius: '10px', boxShadow: 'var(--shadow-md)', color: 'var(--text-primary)' }}
                    formatter={(val, name, props) => [`${val}% (${props.payload.correct}/${props.payload.total} correct)`, 'Accuracy']}
                  />
                  <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                    {accuracyStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getAccuracyColor(entry.accuracy)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No category accuracy data available yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Weak Topics + Applications Funnel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Weak Topics Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Weak Topics (Accuracy &lt; 60%)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                MongoDB Feature: Aggregation with post-grouping $match filter
              </p>
            </div>
            <span className="badge badge-hard">Top Priority</span>
          </div>

          {weakTopics.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {weakTopics.map((topic, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{topic.topic}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{topic.category} • {topic.correct}/{topic.total} questions correct</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--wc-rose)', fontSize: '0.95rem' }}>{topic.accuracy}%</span>
                    <button
                      onClick={() => navigate('/practice', { state: { category: topic.category, topic: topic.topic } })}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      Retest
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <CheckCircle2 size={36} color="var(--wc-green)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No Critical Weaknesses!</p>
              <p style={{ fontSize: '0.85rem' }}>Keep practicing tests to stay sharp across all domains.</p>
            </div>
          )}
        </div>

        {/* Applications Funnel */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Applications Funnel</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                MongoDB Feature: $group by status with sum accumulator
              </p>
            </div>
            <Briefcase size={20} color="var(--accent-cyan)" />
          </div>

          <div style={{ height: '230px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
                <XAxis dataKey="status" stroke="var(--text-muted)" fontSize={11} />
                <YAxis allowDecimals={false} stroke="var(--text-muted)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderWidth: 1, borderRadius: '10px', boxShadow: 'var(--shadow-md)', color: 'var(--text-primary)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={funnelColors[entry.status] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3 DISABLED "COMING SOON" CARDS (Explicit Requirement) */}
      <div style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Sparkles size={18} color="#a78bfa" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Upcoming Modules in PrepTrack v2.0</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {/* Coming Soon Card 1: Study Material */}
          <div
            className="card"
            style={{
              opacity: 0.65,
              background: 'rgba(17, 24, 39, 0.4)',
              border: '1px dashed var(--border-color)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8'
              }}>
                <BookOpen size={20} />
              </div>
              <span className="badge badge-medium" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <Lock size={11} style={{ marginRight: '3px' }} /> Coming Soon
              </span>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>Study Material & Sheets</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Curated DSA cheat sheets, CS Core revision handbooks, and Striver/NeetCode 150 problem mapping.
            </p>
          </div>

          {/* Coming Soon Card 2: Company Insights */}
          <div
            className="card"
            style={{
              opacity: 0.65,
              background: 'rgba(17, 24, 39, 0.4)',
              border: '1px dashed var(--border-color)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22d3ee'
              }}>
                <Briefcase size={20} />
              </div>
              <span className="badge badge-medium" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <Lock size={11} style={{ marginRight: '3px' }} /> Coming Soon
              </span>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>Company Archives</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Past hiring patterns, compensation tiers, and interview experiences from Google, Microsoft, and Amazon.
            </p>
          </div>

          {/* Card 3: AI Placement Assistant & Query Solver */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(217, 70, 239, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e879f9'
              }}>
                <Sparkles size={20} />
              </div>
              <span className="badge badge-done" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                🟢 Active Now
              </span>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>AI Placement Mentor</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.9rem' }}>
              Instant answers for DSA algorithms, OS/DBMS concepts, MongoDB aggregations, and HR questions.
            </p>
            <button
              onClick={() => navigate('/assistant')}
              className="btn btn-primary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', width: '100%' }}
            >
              <span>Ask AI Query Mentor</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
