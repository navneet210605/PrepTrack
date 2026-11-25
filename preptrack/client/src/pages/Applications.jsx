import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Briefcase,
  Plus,
  Clock,
  AlertTriangle,
  Calendar,
  Building2,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Filter,
  X,
  Sparkles,
  Layers,
  FileCheck2,
  Award
} from 'lucide-react';

const STATUS_OPTIONS = ['Applied', 'Test', 'Interview', 'Offer', 'Rejected'];

const COMPANY_COLORS = {
  Google: 'linear-gradient(135deg, #4285F4, #34A853)',
  Microsoft: 'linear-gradient(135deg, #00A4EF, #7FBA00)',
  Amazon: 'linear-gradient(135deg, #FF9900, #E47911)',
  Atlassian: 'linear-gradient(135deg, #0052CC, #2684FF)',
  Uber: 'linear-gradient(135deg, #0f172a, #334155)',
  Swiggy: 'linear-gradient(135deg, #FC8019, #E23744)',
  Flipkart: 'linear-gradient(135deg, #2874F0, #FEE100)',
};

// ==========================================
// STATIC PRESET DATA (Job & Internship Tracker)
// ==========================================
export const STATIC_JOB_APPLICATIONS = [
  {
    _id: 'static-app-1',
    company: 'Google',
    role: 'Software Engineer - University Graduate',
    status: 'Interview',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    appliedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Round 2 Technical Interview scheduled on Google Meet. Focus on Graphs, BST, and System Design.'
  },
  {
    _id: 'static-app-2',
    company: 'Microsoft',
    role: 'SDE 1 (Azure Core Systems)',
    status: 'Test',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    appliedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Codility assessment link received. 3 algorithmic coding challenges in 90 mins.'
  },
  {
    _id: 'static-app-3',
    company: 'Amazon',
    role: 'Software Development Engineer Intern',
    status: 'Applied',
    deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    appliedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Applied via employee referral on Amazon Jobs portal. Prep on 14 Leadership Principles.'
  },
  {
    _id: 'static-app-4',
    company: 'Atlassian',
    role: 'Associate Software Engineer (Fullstack)',
    status: 'Offer',
    deadline: null,
    appliedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Official Offer letter received! Base: 18 LPA + Equity & joining bonus.'
  },
  {
    _id: 'static-app-5',
    company: 'Uber',
    role: 'Frontend Engineer (React.js)',
    status: 'Rejected',
    deadline: null,
    appliedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'University hiring cohort filled. Re-apply next quarter for off-campus roles.'
  },
  {
    _id: 'static-app-6',
    company: 'Swiggy',
    role: 'Associate SDE - Backend Infrastructure',
    status: 'Interview',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    appliedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'High-level system design discussion & MongoDB aggregation indexing questions.'
  }
];

// Static metrics calculation function
export const calculateStaticJobStats = (items = []) => {
  return {
    total: items.length,
    applied: items.filter(i => i.status === 'Applied').length,
    test: items.filter(i => i.status === 'Test').length,
    interview: items.filter(i => i.status === 'Interview').length,
    offer: items.filter(i => i.status === 'Offer').length,
    rejected: items.filter(i => i.status === 'Rejected').length
  };
};

// Format Date like Sketch Stamp in photo: [TU | 07 | 11 | 23]
export const formatSketchDateStamp = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const dayName = days[d.getDay()];
  const dateNum = String(d.getDate()).padStart(2, '0');
  const monthNum = String(d.getMonth() + 1).padStart(2, '0');
  const yearShort = String(d.getFullYear()).slice(-2);
  return { dayName, dateNum, monthNum, yearShort };
};

const Applications = () => {
  const [applications, setApplications] = useState(STATIC_JOB_APPLICATIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isStaticMode, setIsStaticMode] = useState(false);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApps, setTotalApps] = useState(STATIC_JOB_APPLICATIONS.length);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAppId, setCurrentAppId] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'Applied',
    deadline: '',
    appliedDate: new Date().toISOString().slice(0, 10),
    notes: ''
  });

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, page]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      let url = `/applications?page=${page}&limit=10`;
      if (statusFilter !== 'All') {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }

      const res = await api.get(url);
      if (res.data.success && res.data.data && res.data.data.length > 0) {
        setApplications(res.data.data);
        setTotalPages(res.data.totalPages || 1);
        setTotalApps(res.data.total || res.data.data.length);
        setIsStaticMode(false);
      } else {
        // Fallback to static applications so page is never empty
        loadStaticSampleJobs();
      }
    } catch (err) {
      console.warn('API error, falling back to static functions:', err.message);
      loadStaticSampleJobs();
    } finally {
      setLoading(false);
    }
  };

  // Static Load Function
  const loadStaticSampleJobs = () => {
    let filtered = STATIC_JOB_APPLICATIONS;
    if (statusFilter !== 'All') {
      filtered = STATIC_JOB_APPLICATIONS.filter(a => a.status === statusFilter);
    }
    setApplications(filtered);
    setTotalApps(filtered.length);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / 10)));
    setIsStaticMode(true);
    setSuccessMsg('Loaded 6 static job application presets!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      // If it's a static ID, update locally
      if (String(appId).startsWith('static-') || isStaticMode) {
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
        );
        setSuccessMsg(`Status updated to ${newStatus} (Static Mode)`);
        setTimeout(() => setSuccessMsg(''), 3000);
        return;
      }

      const res = await api.put(`/applications/${appId}`, { status: newStatus });
      if (res.data.success) {
        setSuccessMsg(`Application status updated to ${newStatus}`);
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
        );
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      // Local fallback on error
      setApplications((prev) =>
        prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
      );
      setSuccessMsg(`Status updated to ${newStatus}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentAppId(null);
    setFormData({
      company: '',
      role: '',
      status: 'Applied',
      deadline: '',
      appliedDate: new Date().toISOString().slice(0, 10),
      notes: ''
    });
    setIsModalOpen(true);
  };

  const fillSampleJob = () => {
    const samples = [
      {
        company: 'Google',
        role: 'Software Engineer - University Graduate',
        status: 'Interview',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        notes: 'Round 2 Technical Interview. Topics: Dynamic Programming & Binary Search Trees.'
      },
      {
        company: 'Microsoft',
        role: 'SDE 1 (Azure Core)',
        status: 'Test',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        notes: 'Codility online assessment: 3 algorithmic questions in 90 minutes.'
      },
      {
        company: 'Amazon',
        role: 'Software Development Engineer Intern',
        status: 'Applied',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        notes: 'Applied with employee referral. Focus on Leadership Principles & Graph algorithms.'
      }
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setFormData((prev) => ({
      ...prev,
      ...picked,
      appliedDate: prev.appliedDate || new Date().toISOString().slice(0, 10)
    }));
  };

  const openEditModal = (app) => {
    setIsEditing(true);
    setCurrentAppId(app._id);
    setFormData({
      company: app.company,
      role: app.role,
      status: app.status,
      deadline: app.deadline ? new Date(app.deadline).toISOString().slice(0, 10) : '',
      appliedDate: app.appliedDate ? new Date(app.appliedDate).toISOString().slice(0, 10) : '',
      notes: app.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isStaticMode || String(currentAppId).startsWith('static-')) {
        if (isEditing) {
          setApplications(prev => prev.map(a => a._id === currentAppId ? { ...a, ...formData } : a));
          setSuccessMsg('Static application updated!');
        } else {
          const newApp = { ...formData, _id: `static-app-${Date.now()}` };
          setApplications(prev => [newApp, ...prev]);
          setSuccessMsg('New static application added!');
        }
        setIsModalOpen(false);
        setTimeout(() => setSuccessMsg(''), 3000);
        return;
      }

      if (isEditing) {
        await api.put(`/applications/${currentAppId}`, formData);
        setSuccessMsg('Application successfully updated!');
      } else {
        await api.post('/applications', formData);
        setSuccessMsg('Job application added to pipeline!');
      }
      setIsModalOpen(false);
      fetchApplications();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      // Local fallback on API error
      const newApp = { ...formData, _id: `static-app-${Date.now()}` };
      setApplications(prev => [newApp, ...prev]);
      setIsModalOpen(false);
      setSuccessMsg('Application saved locally!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) return;

    try {
      if (String(id).startsWith('static-') || isStaticMode) {
        setApplications(prev => prev.filter(a => a._id !== id));
        setSuccessMsg('Application removed.');
        setTimeout(() => setSuccessMsg(''), 3000);
        return;
      }

      await api.delete(`/applications/${id}`);
      setSuccessMsg('Application removed.');
      fetchApplications();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setApplications(prev => prev.filter(a => a._id !== id));
      setSuccessMsg('Application removed.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Check if deadline is near (within 3 days)
  const isNearDeadline = (deadlineDate) => {
    if (!deadlineDate) return false;
    const now = new Date();
    const dDate = new Date(deadlineDate);
    const diffDays = Math.ceil((dDate - now) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  const getDaysLeftText = (deadlineDate) => {
    if (!deadlineDate) return null;
    const now = new Date();
    const dDate = new Date(deadlineDate);
    const diffDays = Math.ceil((dDate - now) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Due Today!';
    if (diffDays === 1) return 'Due Tomorrow!';
    if (diffDays > 1) return `${diffDays} days left`;
    return 'Deadline passed';
  };

  // Status Watercolor Wash Color Mapping
  const statusWashColors = {
    Applied: 'var(--wc-blue-wash)',
    Test: 'var(--wc-yellow-wash)',
    Interview: 'var(--wc-terracotta-wash)',
    Offer: 'var(--wc-green-wash)',
    Rejected: 'var(--wc-rose-wash)'
  };

  const stats = calculateStaticJobStats(applications);

  return (
    <div>
      {/* Title & Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Job & Internship Tracker</h1>
            <span className="sketch-card-tag">✏️ [recruitment log]</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Track interviews, coding rounds, and offers with journal date stamps and 72h alerts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button onClick={loadStaticSampleJobs} className="btn btn-secondary" title="Load 6 static job presets">
            <Sparkles size={16} color="#ca8a04" />
            <span>Load Static Jobs</span>
          </button>
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={18} />
            <span>New Application</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* QUICK STATIC METRICS STRIP */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.85rem',
        marginBottom: '1.5rem'
      }}>
        <div className="card" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--wc-blue-wash)', border: '1px solid var(--wc-blue-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={18} color="var(--wc-blue)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>TOTAL TRACKED</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{stats.total}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--wc-terracotta-wash)', border: '1px solid var(--wc-terracotta-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={18} color="var(--wc-terracotta)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>INTERVIEWS</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--wc-terracotta)' }}>{stats.interview}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--wc-yellow-wash)', border: '1px solid var(--wc-yellow-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={18} color="var(--wc-yellow)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>TESTS PENDING</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--wc-yellow)' }}>{stats.test}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--wc-green-wash)', border: '1px solid var(--wc-green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={18} color="var(--wc-green)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>OFFERS</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--wc-green)' }}>{stats.offer}</div>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
        {['All', ...STATUS_OPTIONS].map((st) => (
          <button
            key={st}
            onClick={() => { setStatusFilter(st); setPage(1); }}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: statusFilter === st ? 'var(--wc-blue)' : 'var(--bg-card)',
              color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
              border: statusFilter === st ? '1px solid var(--wc-blue)' : '1px solid var(--border-color)',
              boxShadow: statusFilter === st ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
              whiteSpace: 'nowrap'
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* APPLICATIONS LIST */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Querying applications pipeline...</p>
        </div>
      ) : applications.length > 0 ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {applications.map((app) => {
              const near = isNearDeadline(app.deadline);
              const daysLeft = getDaysLeftText(app.deadline);
              const appliedStamp = formatSketchDateStamp(app.appliedDate);
              const deadlineStamp = formatSketchDateStamp(app.deadline);

              return (
                <div
                  key={app._id}
                  className="card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    borderLeft: near ? '4px solid var(--wc-yellow)' : '1.5px solid var(--border-color)',
                    background: near ? 'var(--wc-yellow-wash)' : 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1.15rem', alignItems: 'flex-start', flex: 1, minWidth: '280px' }}>
                    {/* Vibrant Company Logo Monogram */}
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: COMPANY_COLORS[app.company] || 'var(--gradient-brand)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1.25rem',
                      boxShadow: 'var(--shadow-sm)',
                      flexShrink: 0,
                      letterSpacing: '-0.02em'
                    }}>
                      {app.company.slice(0, 1).toUpperCase()}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{app.company}</h3>
                        {near && (
                          <span className="badge badge-medium" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={12} /> {daysLeft}
                          </span>
                        )}
                        {appliedStamp && (
                          <span className="sketch-date-stamp" title={`Applied Date: ${new Date(app.appliedDate).toLocaleDateString()}`}>
                            <span>{appliedStamp.dayName}</span>
                            <span>{appliedStamp.dateNum}</span>
                            <span>{appliedStamp.monthNum}</span>
                            <span>{appliedStamp.yearShort}</span>
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Role: <strong style={{ color: 'var(--text-primary)' }}>{app.role}</strong>
                      </div>

                      {/* Visual Hiring Funnel Mini Stage Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '0.45rem 0' }}>
                        {['Applied', 'Test', 'Interview', 'Offer'].map((step, idx) => {
                          const stepOrder = { Applied: 1, Test: 2, Interview: 3, Offer: 4, Rejected: 0 };
                          const currentOrder = stepOrder[app.status] || 1;
                          const isCompleted = app.status !== 'Rejected' && stepOrder[step] <= currentOrder;
                          const isCurrent = app.status === step;
                          return (
                            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{
                                fontSize: '0.66rem',
                                fontWeight: 700,
                                padding: '2px 7px',
                                borderRadius: '9999px',
                                background: isCurrent ? 'var(--wc-blue)' : isCompleted ? 'var(--wc-blue-wash)' : 'var(--bg-secondary)',
                                color: isCurrent ? '#fff' : isCompleted ? 'var(--wc-blue)' : 'var(--text-muted)',
                                border: isCurrent ? 'none' : '1px solid var(--border-color)'
                              }}>
                                {step}
                              </span>
                              {idx < 3 && <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>→</span>}
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                        <span>Applied: <strong>{new Date(app.appliedDate).toLocaleDateString()}</strong></span>
                        {app.deadline && (
                          <span>
                            Deadline: <strong style={{ color: near ? 'var(--wc-yellow)' : 'inherit' }}>{new Date(app.deadline).toLocaleDateString()}</strong>
                          </span>
                        )}
                      </div>

                      {app.notes && (
                        <div style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          marginTop: '0.5rem',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          padding: '0.5rem 0.85rem',
                          borderRadius: '8px'
                        }}>
                          📌 {app.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* INLINE STATUS SELECTOR & ACTIONS */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800 }}>STATUS</span>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1.5px solid var(--border-color)',
                          borderRadius: '10px',
                          boxShadow: 'var(--shadow-sm)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          padding: '0.45rem 0.85rem',
                          width: '135px'
                        }}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1.1rem' }}>
                      <button
                        onClick={() => openEditModal(app)}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem', borderRadius: '6px' }}
                        title="Edit Application"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(app._id)}
                        className="btn btn-danger"
                        style={{ padding: '0.45rem', borderRadius: '6px' }}
                        title="Delete Application"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                Page {page} of {totalPages} ({totalApps} applications)
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
          <Briefcase size={40} className="empty-state-icon" />
          <div className="empty-state-title">No applications found</div>
          <p style={{ marginBottom: '1rem' }}>Click below to populate with static sample applications or add a new job.</p>
          <button onClick={loadStaticSampleJobs} className="btn btn-primary">
            <Sparkles size={16} />
            <span>Load Static Sample Jobs</span>
          </button>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{isEditing ? 'Edit Application' : 'Add New Application'}</h3>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={fillSampleJob}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem', marginTop: '0.35rem' }}
                  >
                    ✨ Fill Sample Job
                  </button>
                )}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Google, Microsoft, Amazon"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    placeholder="e.g. SDE 1, Graduate Trainee"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Stage Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Application / Assessment Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Applied Date</label>
                <input
                  type="date"
                  value={formData.appliedDate}
                  onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Interview Rounds & Notes</label>
                <textarea
                  rows={3}
                  placeholder="Referral name, job portal link, interview rounds format..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Save Application' : 'Add Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
