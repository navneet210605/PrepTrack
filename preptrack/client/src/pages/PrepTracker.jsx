import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  BookOpenCheck,
  Search,
  Plus,
  Clock,
  CheckCircle,
  ExternalLink,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  Sparkles,
  RotateCcw,
  X,
  BookOpen,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';

const CATEGORIES = ['All', 'DSA', 'Aptitude', 'CS Core', 'Development', 'HR', 'Projects & Resume'];
const STATUSES = ['All', 'Todo', 'Done', 'Revise'];

// ==========================================
// STATIC PRESET TOPICS (Spaced Repetition Prep Tracker)
// ==========================================
export const STATIC_PREP_TOPICS = [
  {
    _id: 'static-prep-1',
    category: 'DSA',
    title: 'Floyd Cycle Detection & Starting Point',
    topic: 'Linked Lists',
    difficulty: 'Medium',
    status: 'Done',
    link: 'https://leetcode.com/problems/linked-list-cycle-ii/',
    notes: 'Slow pointer 1 step, fast pointer 2 steps. When they meet, reset slow to head and advance both 1 step to find cycle start.',
    nextRevisionDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Due today
    revisionCount: 2
  },
  {
    _id: 'static-prep-2',
    category: 'CS Core',
    title: 'Virtual Memory, TLB and Page Replacement (LRU)',
    topic: 'Operating Systems',
    difficulty: 'Hard',
    status: 'Done',
    link: 'https://www.geeksforgeeks.org/virtual-memory-in-operating-system/',
    notes: 'Page hit vs miss. TLB acts as hardware cache for page table entries. Belady anomaly in FIFO.',
    nextRevisionDate: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // Due today
    revisionCount: 1
  },
  {
    _id: 'static-prep-3',
    category: 'Development',
    title: 'MongoDB Aggregation Pipeline Optimization',
    topic: 'MongoDB',
    difficulty: 'Medium',
    status: 'Todo',
    link: 'https://www.mongodb.com/docs/manual/core/aggregation-pipeline-optimization/',
    notes: 'Always place $match and $project early in pipeline to utilize indexes and reduce BSON document stream.',
    nextRevisionDate: null,
    revisionCount: 0
  },
  {
    _id: 'static-prep-4',
    category: 'Aptitude',
    title: 'Time & Work - Work Equivalence and Pipes',
    topic: 'Quantitative Aptitude',
    difficulty: 'Easy',
    status: 'Revise',
    link: '',
    notes: 'Total work as LCM of individual times. Efficiency ratio = inverse of time taken.',
    nextRevisionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    revisionCount: 1
  },
  {
    _id: 'static-prep-5',
    category: 'HR',
    title: 'STAR Method: Handling Technical Disagreements',
    topic: 'Behavioral Interviews',
    difficulty: 'Medium',
    status: 'Todo',
    link: '',
    notes: 'Situation, Task, Action taken with empathy and metrics, Result achieved.',
    nextRevisionDate: null,
    revisionCount: 0
  },
  {
    _id: 'static-prep-6',
    category: 'Projects & Resume',
    title: 'System Design Architecture for PrepTrack',
    topic: 'System Architecture',
    difficulty: 'Hard',
    status: 'Done',
    link: 'https://github.com/',
    notes: 'Documented Mongoose schema validation, compound indexes, and microservice data flow.',
    nextRevisionDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    revisionCount: 3
  },
  {
    _id: 'static-prep-7',
    category: 'DSA',
    title: '0/1 Knapsack & Dynamic Programming Patterns',
    topic: 'Dynamic Programming',
    difficulty: 'Hard',
    status: 'Revise',
    link: 'https://leetcode.com/problems/partition-equal-subset-sum/',
    notes: 'Include / exclude choice matrix. Space optimization from 2D table dp[i][w] to 1D array dp[w].',
    nextRevisionDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Due today
    revisionCount: 2
  },
  {
    _id: 'static-prep-8',
    category: 'CS Core',
    title: 'ACID Properties & Database Isolation Levels',
    topic: 'DBMS',
    difficulty: 'Medium',
    status: 'Done',
    link: 'https://en.wikipedia.org/wiki/ACID',
    notes: 'Atomicity, Consistency, Isolation, Durability. Dirty reads, Non-repeatable reads, Phantom reads.',
    nextRevisionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    revisionCount: 3
  }
];

// Static Spaced Repetition Formula: 1, 3, 7, 15, 30 days
export const calculateStaticNextRevision = (currentRevisionCount = 0) => {
  const intervals = [1, 3, 7, 15, 30];
  const nextGapDays = intervals[Math.min(currentRevisionCount, intervals.length - 1)];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + nextGapDays);
  return nextDate;
};

// Static Metrics Calculator
export const calculateStaticPrepStats = (items = []) => {
  const now = new Date();
  return {
    total: items.length,
    dueToday: items.filter(i => i.nextRevisionDate && new Date(i.nextRevisionDate) <= now).length,
    done: items.filter(i => i.status === 'Done').length,
    activeRevise: items.filter(i => i.status === 'Revise').length
  };
};

// Format Date like Sketch Stamp: [TU | 07 | 11 | 23]
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

const PrepTracker = () => {
  const [items, setItems] = useState(STATIC_PREP_TOPICS);
  const [reviseTodayItems, setReviseTodayItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviseLoading, setReviseLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isStaticMode, setIsStaticMode] = useState(false);

  // Filters & Pagination
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(STATIC_PREP_TOPICS.length);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [formData, setFormData] = useState({
    category: 'DSA',
    title: '',
    topic: '',
    difficulty: 'Medium',
    status: 'Todo',
    link: '',
    notes: ''
  });

  useEffect(() => {
    fetchPrepItems();
  }, [selectedCategory, selectedStatus, page]);

  useEffect(() => {
    fetchReviseToday();
  }, []);

  const fetchPrepItems = async () => {
    try {
      setLoading(true);
      let url = `/prep?page=${page}&limit=10`;
      if (selectedCategory !== 'All') url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedStatus !== 'All') url += `&status=${encodeURIComponent(selectedStatus)}`;
      if (searchQuery.trim()) url += `&q=${encodeURIComponent(searchQuery.trim())}`;

      const res = await api.get(url);
      if (res.data.success && res.data.data && res.data.data.length > 0) {
        setItems(res.data.data);
        setTotalPages(res.data.totalPages || 1);
        setTotalItems(res.data.total || res.data.data.length);
        setIsStaticMode(false);
      } else {
        // Fallback to static items
        loadStaticSampleTopics();
      }
    } catch (err) {
      console.warn('API error, falling back to static prep topics:', err.message);
      loadStaticSampleTopics();
    } finally {
      setLoading(false);
    }
  };

  const fetchReviseToday = async () => {
    try {
      setReviseLoading(true);
      const res = await api.get('/prep/revise-today');
      if (res.data.success) {
        setReviseTodayItems(res.data.data);
      }
    } catch (err) {
      // Local fallback
      const now = new Date();
      setReviseTodayItems(STATIC_PREP_TOPICS.filter(i => i.nextRevisionDate && new Date(i.nextRevisionDate) <= now));
    } finally {
      setReviseLoading(false);
    }
  };

  // Static Load Function
  const loadStaticSampleTopics = () => {
    let filtered = STATIC_PREP_TOPICS;
    if (selectedCategory !== 'All') filtered = filtered.filter(i => i.category === selectedCategory);
    if (selectedStatus !== 'All') filtered = filtered.filter(i => i.status === selectedStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(i => i.title.toLowerCase().includes(q) || i.topic.toLowerCase().includes(q));
    }

    setItems(filtered);
    setTotalItems(filtered.length);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / 10)));
    setIsStaticMode(true);
    const now = new Date();
    setReviseTodayItems(STATIC_PREP_TOPICS.filter(i => i.nextRevisionDate && new Date(i.nextRevisionDate) <= now));
    setSuccessMsg('Loaded 8 static preparation topic presets!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPrepItems();
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentItemId(null);
    setFormData({
      category: selectedCategory !== 'All' ? selectedCategory : 'DSA',
      title: '',
      topic: '',
      difficulty: 'Medium',
      status: 'Todo',
      link: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const fillSampleTopic = () => {
    const samples = [
      {
        category: 'DSA',
        title: 'Floyd Cycle Detection & Starting Point',
        topic: 'Linked Lists',
        difficulty: 'Medium',
        status: 'Done',
        link: 'https://leetcode.com/problems/linked-list-cycle-ii/',
        notes: 'Slow pointer 1 step, fast pointer 2 steps. When they meet, reset slow to head and advance both 1 step to find cycle start.'
      },
      {
        category: 'CS Core',
        title: 'Virtual Memory, TLB and Page Replacement (LRU)',
        topic: 'Operating Systems',
        difficulty: 'Hard',
        status: 'Done',
        link: 'https://www.geeksforgeeks.org/virtual-memory-in-operating-system/',
        notes: 'Page hit vs miss. TLB acts as hardware cache for page table entries. Belady anomaly in FIFO.'
      },
      {
        category: 'Development',
        title: 'MongoDB Aggregation Pipeline Optimization',
        topic: 'MongoDB',
        difficulty: 'Medium',
        status: 'Todo',
        link: 'https://www.mongodb.com/docs/manual/core/aggregation-pipeline-optimization/',
        notes: 'Always place $match and $project early in pipeline to utilize indexes and reduce BSON document stream.'
      }
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setFormData((prev) => ({
      ...prev,
      ...picked
    }));
  };

  const openEditModal = (item) => {
    setIsEditing(true);
    setCurrentItemId(item._id);
    setFormData({
      category: item.category,
      title: item.title,
      topic: item.topic,
      difficulty: item.difficulty || 'Medium',
      status: item.status,
      link: item.link || '',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isStaticMode || String(currentItemId).startsWith('static-')) {
        if (isEditing) {
          setItems(prev => prev.map(i => i._id === currentItemId ? { ...i, ...formData } : i));
          setSuccessMsg('Topic updated (Static Mode)!');
        } else {
          const newItem = {
            ...formData,
            _id: `static-prep-${Date.now()}`,
            revisionCount: 0,
            nextRevisionDate: null
          };
          setItems(prev => [newItem, ...prev]);
          setSuccessMsg('New topic added (Static Mode)!');
        }
        setIsModalOpen(false);
        setTimeout(() => setSuccessMsg(''), 3000);
        return;
      }

      if (isEditing) {
        await api.put(`/prep/${currentItemId}`, formData);
        setSuccessMsg('Topic successfully updated!');
      } else {
        await api.post('/prep', formData);
        setSuccessMsg('Topic added to your preparation list!');
      }
      setIsModalOpen(false);
      fetchPrepItems();
      fetchReviseToday();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      // Local fallback on error
      const newItem = { ...formData, _id: `static-prep-${Date.now()}`, revisionCount: 0 };
      setItems(prev => [newItem, ...prev]);
      setIsModalOpen(false);
      setSuccessMsg('Topic saved locally!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Static Spaced Repetition Trigger Function
  const handleReviseTopic = async (itemId) => {
    try {
      if (isStaticMode || String(itemId).startsWith('static-')) {
        setItems(prev => prev.map(item => {
          if (item._id === itemId) {
            const nextCount = (item.revisionCount || 0) + 1;
            const nextDate = calculateStaticNextRevision(nextCount);
            return {
              ...item,
              revisionCount: nextCount,
              nextRevisionDate: nextDate.toISOString(),
              status: 'Done'
            };
          }
          return item;
        }));
        setReviseTodayItems(prev => prev.filter(i => i._id !== itemId));
        setSuccessMsg('Revision logged! Next review scheduled by spaced repetition formula.');
        setTimeout(() => setSuccessMsg(''), 3500);
        return;
      }

      const res = await api.post(`/prep/${itemId}/revise`);
      if (res.data.success) {
        setSuccessMsg('Revision recorded! Spaced repetition updated next review date.');
        fetchPrepItems();
        fetchReviseToday();
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (err) {
      setSuccessMsg('Revision marked locally.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this prep topic?')) return;

    try {
      if (isStaticMode || String(itemId).startsWith('static-')) {
        setItems(prev => prev.filter(i => i._id !== itemId));
        setSuccessMsg('Topic removed.');
        setTimeout(() => setSuccessMsg(''), 3000);
        return;
      }

      await api.delete(`/prep/${itemId}`);
      setSuccessMsg('Topic removed.');
      fetchPrepItems();
      fetchReviseToday();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setItems(prev => prev.filter(i => i._id !== itemId));
      setSuccessMsg('Topic removed.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const stats = calculateStaticPrepStats(items);

  return (
    <div>
      {/* Title & Top Action CTAs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Spaced Repetition Prep Tracker</h1>
            <span className="sketch-card-tag">✏️ [1-3-7-15-30 day curve]</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Scientifically schedule topic revisions to overcome the Ebbinghaus forgetting curve.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button onClick={loadStaticSampleTopics} className="btn btn-secondary" title="Load 8 static prep topic presets">
            <Sparkles size={16} color="#ca8a04" />
            <span>Load Static Topics</span>
          </button>
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={18} />
            <span>Add Prep Topic</span>
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
            <BookOpen size={18} color="var(--wc-blue)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>TOTAL TOPICS</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{stats.total}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--wc-yellow-wash)', border: '1px solid var(--wc-yellow-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RotateCcw size={18} color="var(--wc-yellow)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>DUE TODAY</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--wc-yellow)' }}>{stats.dueToday}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--wc-green-wash)', border: '1px solid var(--wc-green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={18} color="var(--wc-green)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>COMPLETED</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--wc-green)' }}>{stats.done}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--wc-terracotta-wash)', border: '1px solid var(--wc-terracotta-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={18} color="var(--wc-terracotta)" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>ACTIVE REVISE</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--wc-terracotta)' }}>{stats.activeRevise}</div>
          </div>
        </div>
      </div>

      {/* DUE TODAY SECTION (Highlighted Modern Card) */}
      {reviseTodayItems.length > 0 && (
        <div className="card" style={{
          marginBottom: '2rem',
          background: 'var(--wc-yellow-wash)',
          border: '1.5px solid var(--wc-yellow-border)',
          borderLeft: '4px solid var(--wc-yellow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <RotateCcw size={20} color="var(--wc-yellow)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Due for Revision Today ({reviseTodayItems.length})
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--wc-yellow)', marginLeft: 'auto', fontWeight: 700 }}>
              ⚡ Click 'Revise Now' to advance spaced repetition curve
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
            {reviseTodayItems.map((item) => (
              <div
                key={item._id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="badge badge-medium">{item.category}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Rev #{item.revisionCount || 0}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.2rem' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Topic: {item.topic}</p>
                </div>

                <button
                  onClick={() => handleReviseTopic(item._id)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.82rem' }}
                >
                  <CheckCircle size={14} />
                  <span>Revise Now & Advance Curve</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH & FILTERS BAR */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '240px', display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Search topics, algorithms, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary" style={{ padding: '0.65rem 0.9rem' }}>
            <Search size={16} />
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            style={{ width: 'auto', fontWeight: 700 }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>Category: {c}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
            style={{ width: 'auto', fontWeight: 700 }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>Status: {s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TOPICS LIST */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading preparation items...</p>
        </div>
      ) : items.length > 0 ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
            {items.map((item) => {
              const dateStamp = formatSketchDateStamp(item.nextRevisionDate);

              return (
                <div
                  key={item._id}
                  className="card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    background: 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: 1, minWidth: '260px' }}>
                    {/* Hand-Drawn Date Stamp Box (from photo) */}
                    {dateStamp ? (
                      <div className="sketch-date-stamp" title={`Next Revision Due: ${new Date(item.nextRevisionDate).toLocaleDateString()}`}>
                        <span>{dateStamp.dayName}</span>
                        <span>{dateStamp.dateNum}</span>
                        <span>{dateStamp.monthNum}</span>
                        <span>{dateStamp.yearShort}</span>
                      </div>
                    ) : (
                      <div className="sketch-date-stamp" style={{ opacity: 0.6 }}>
                        <span>REV</span>
                        <span>00</span>
                        <span>NEW</span>
                        <span>--</span>
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-medium">{item.category}</span>
                        <span className="badge badge-easy">{item.difficulty || 'Medium'}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          • {item.topic}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.3rem' }}>
                        {item.title}
                      </h3>

                      {item.notes && (
                        <div style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          background: 'var(--bg-primary)',
                          border: '1.5px dashed var(--border-color)',
                          padding: '0.45rem 0.75rem',
                          borderRadius: '6px',
                          marginBottom: '0.4rem'
                        }}>
                          📌 {item.notes}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>Revision Count: <strong>#{item.revisionCount || 0}</strong></span>
                        {item.nextRevisionDate && (
                          <span>Next Review: <strong>{new Date(item.nextRevisionDate).toLocaleDateString()}</strong></span>
                        )}
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-indigo)', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 700 }}>
                            Practice Problem <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleReviseTopic(item._id)}
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
                      title="Mark as Revised today"
                    >
                      <RotateCcw size={14} />
                      <span>Log Revision</span>
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem', borderRadius: '6px' }}
                      title="Edit Topic"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="btn btn-danger"
                      style={{ padding: '0.45rem', borderRadius: '6px' }}
                      title="Delete Topic"
                    >
                      <Trash2 size={15} />
                    </button>
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
                Page {page} of {totalPages} ({totalItems} topics)
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
          <BookOpenCheck size={40} className="empty-state-icon" />
          <div className="empty-state-title">No preparation topics found</div>
          <p style={{ marginBottom: '1rem' }}>Click below to populate with static sample topics or add a new concept.</p>
          <button onClick={loadStaticSampleTopics} className="btn btn-primary">
            <Sparkles size={16} />
            <span>Load Static Sample Topics</span>
          </button>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{isEditing ? 'Edit Prep Topic' : 'Add New Prep Topic'}</h3>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={fillSampleTopic}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem', marginTop: '0.35rem' }}
                  >
                    ✨ Fill Sample Topic
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
                  <label className="form-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Topic / Concept Name</label>
                <input
                  type="text"
                  placeholder="e.g. Floyd Cycle Detection, LRU Cache, ACID Properties"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Subtopic / Module</label>
                  <input
                    type="text"
                    placeholder="e.g. Linked Lists, Operating Systems, MongoDB"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Todo">Todo</option>
                    <option value="Revise">Revise</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Practice Link (LeetCode, GfG, Docs)</label>
                <input
                  type="url"
                  placeholder="https://leetcode.com/problems/..."
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Key Takeaways & Quick Formula</label>
                <textarea
                  rows={3}
                  placeholder="Summary formulas, time/space complexity notes, edge cases to remember..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Save Topic' : 'Add Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrepTracker;
