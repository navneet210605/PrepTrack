import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Flame, 
  LayoutDashboard, 
  Target, 
  BookOpenCheck, 
  Briefcase, 
  LogOut, 
  Sparkles,
  Bot,
  Palette,
  Check
} from 'lucide-react';

const THEMES = [
  { id: 'aurora', name: 'Electric Aurora', icon: '⚡', dot: '#4f46e5' },
  { id: 'cyber-dark', name: 'Midnight Cyber', icon: '🌌', dot: '#818cf8' },
  { id: 'sunset-coral', name: 'Sunset Coral', icon: '🌅', dot: '#f97316' },
  { id: 'emerald-nordic', name: 'Nordic Emerald', icon: '🍵', dot: '#10b981' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('preptrack-theme') || 'aurora';
  });
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    localStorage.setItem('preptrack-theme', activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const streakCount = user?.streak?.current || 0;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <div style={{
            background: 'var(--gradient-brand)',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sparkles size={19} />
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontWeight: 800 }}>PrepTrack</span>
            <span style={{
              fontSize: '0.7rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              background: 'var(--wc-blue-wash)',
              color: 'var(--wc-blue)',
              border: '1px solid var(--wc-blue-border)',
              fontWeight: 700
            }}>
              v2.0
            </span>
          </span>
        </NavLink>

        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/practice" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Target size={17} />
            <span>Practice</span>
          </NavLink>
          <NavLink to="/prep-tracker" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BookOpenCheck size={17} />
            <span>Prep Tracker</span>
          </NavLink>
          <NavLink to="/applications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Briefcase size={17} />
            <span>Applications</span>
          </NavLink>
          <NavLink to="/assistant" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Bot size={17} />
            <span>AI Assistant</span>
            <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '9999px', background: 'var(--gradient-brand)', color: '#fff', fontWeight: 800 }}>AI</span>
          </NavLink>
        </div>

        <div className="nav-user">
          {/* Theme Palette Switcher */}
          <div style={{ position: 'relative' }} ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="btn btn-secondary"
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderRadius: '9999px'
              }}
              title="Change Color Theme"
            >
              <Palette size={15} color="var(--accent-indigo)" />
              <span className="hide-mobile">
                {THEMES.find(t => t.id === activeTheme)?.name.split(' ')[0] || 'Theme'}
              </span>
              <span style={{ fontSize: '0.85rem' }}>
                {THEMES.find(t => t.id === activeTheme)?.icon}
              </span>
            </button>

            {showThemeMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '14px',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem',
                  minWidth: '200px',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem',
                  animation: 'modalIn 0.15s ease'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', padding: '0.25rem 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Select Color Theme
                </div>
                {THEMES.map((theme) => {
                  const isSel = activeTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setActiveTheme(theme.id);
                        setShowThemeMenu(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: isSel ? 'var(--wc-blue)' : 'var(--text-primary)',
                        background: isSel ? 'var(--wc-blue-wash)' : 'transparent',
                        border: isSel ? '1px solid var(--wc-blue-border)' : '1px solid transparent',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          width: '11px',
                          height: '11px',
                          borderRadius: '50%',
                          background: theme.dot,
                          boxShadow: `0 0 6px ${theme.dot}`
                        }} />
                        <span>{theme.name}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>{theme.icon}</span>
                        {isSel && <Check size={14} color="var(--wc-blue)" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="streak-badge" title="Daily Activity Streak (Updated on Test Submissions)">
            <Flame size={16} fill="#f59e0b" color="#f59e0b" />
            <span>{streakCount} {streakCount === 1 ? 'Day' : 'Days'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                background: 'var(--gradient-brand)',
                color: '#fff',
                boxShadow: 'var(--shadow-sm)',
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}>
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid var(--bg-card)'
              }} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }} className="hide-mobile">
              {user?.name || 'Student'}
            </span>
          </div>

          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }} title="Logout">
            <LogOut size={15} />
            <span className="hide-mobile">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
