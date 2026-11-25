import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Send,
  Trash2,
  Bot,
  User,
  Lightbulb,
  CornerDownLeft,
  Terminal,
  Database,
  Code,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  { label: '👋 Say "Hi"', icon: Sparkles, query: 'Hi' },
  { label: '💼 Job Suggestions', icon: GraduationCap, query: 'Can you give me job suggestions and tips on how to get hired?' },
  { label: 'Explain $lookup in MongoDB', icon: Database, query: 'Explain $lookup in MongoDB with an aggregation example' },
  { label: 'Embedding vs Referencing', icon: Database, query: 'What is the difference between embedding and referencing in MongoDB?' },
  { label: 'Floyd Cycle Detection (DSA)', icon: Code, query: "Explain Floyd's cycle detection algorithm with time complexity" },
  { label: 'OS Deadlock & Coffman Rules', icon: ShieldAlert, query: 'What are the 4 Coffman conditions required for deadlock in OS?' },
  { label: 'STAR Method for HR', icon: GraduationCap, query: 'How to use the STAR method to answer behavioral interview questions?' }
];

const ChatAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchHistory = async () => {
    try {
      setFetchingHistory(true);
      const res = await api.get('/chat/history');
      if (res.data.success && res.data.data.length > 0) {
        setMessages(res.data.data);
      } else {
        // Welcome message if no chat history
        setMessages([
          {
            role: 'assistant',
            content: `### 👋 Hi ${user?.name || 'Student'}! Welcome to PrepTrack AI\n\nI am your dedicated placement mentor and technical interview assistant.\n\nAsk me anything about **DSA algorithms, Operating Systems, DBMS, Computer Networks, MongoDB queries, or HR interview questions**.\n\nYou can also click any of the prompt suggestions below to get started!`,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const sendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = {
      role: 'user',
      content: text.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await api.post('/chat/message', { message: text.trim() });
      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.data.content,
            createdAt: res.data.data.createdAt
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Sorry, I could not process your query at this moment. Please check server logs and try again.',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all conversation history?')) return;
    try {
      await api.delete('/chat/history');
      setMessages([
        {
          role: 'assistant',
          content: `### 🧹 Chat History Cleared\n\nHow can I help you today, **${user?.name || 'Student'}**? Ask any technical question or pick a suggested topic below!`,
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error('Error clearing chat history:', err);
    }
  };

  // Format inline bold and code snippets
  const formatInline = (text) => {
    if (!text) return '';
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code
            key={i}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              padding: '2px 6px',
              borderRadius: '5px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85em',
              fontWeight: 600,
              color: 'var(--wc-blue)'
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Simple Markdown renderer for chat bubbles
  const renderFormattedContent = (content) => {
    const lines = content.split('\n');
    let inCodeBlock = false;
    let codeBuffer = [];

    const elements = [];

    lines.forEach((line, idx) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // Closing code block
          elements.push(
            <pre
              key={`code-${idx}`}
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1.5px solid var(--border-color)',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                overflowX: 'auto',
                margin: '0.75rem 0',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={idx} style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0.75rem 0 0.35rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
            {formatInline(line.replace('### ', ''))}
          </h4>
        );
      } else if (line.startsWith('#### ')) {
        elements.push(
          <h5 key={idx} style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0.55rem 0 0.25rem', color: 'var(--wc-blue)' }}>
            {formatInline(line.replace('#### ', ''))}
          </h5>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(
          <div key={idx} style={{ fontWeight: 700, margin: '0.3rem 0', color: 'var(--text-primary)' }}>
            {line.replace(/\*\*/g, '')}
          </div>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <div key={idx} style={{ paddingLeft: '1.1rem', position: 'relative', margin: '0.2rem 0' }}>
            <span style={{ position: 'absolute', left: '0.2rem', color: 'var(--wc-blue)', fontWeight: 800 }}>•</span>
            <span>{formatInline(line.replace(/^[-*]\s+/, ''))}</span>
          </div>
        );
      } else if (/^\d+\.\s/.test(line)) {
        const num = line.match(/^(\d+\.)\s/)[1];
        const rest = line.replace(/^\d+\.\s/, '');
        elements.push(
          <div key={idx} style={{ paddingLeft: '1.3rem', position: 'relative', margin: '0.25rem 0' }}>
            <span style={{ position: 'absolute', left: '0', fontWeight: 800, color: 'var(--wc-blue)' }}>{num}</span>
            <span>{formatInline(rest)}</span>
          </div>
        );
      } else if (line.trim().length === 0) {
        elements.push(<div key={idx} style={{ height: '0.4rem' }} />);
      } else {
        elements.push(
          <p key={idx} style={{ margin: '0.25rem 0', lineHeight: '1.55' }}>
            {formatInline(line)}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Bot size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>PrepTrack AI Mentor</h1>
              <span style={{
                background: 'var(--wc-blue-wash)',
                color: 'var(--wc-blue)',
                border: '1px solid var(--wc-blue-border)',
                boxShadow: 'var(--shadow-sm)',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={11} /> Gemini Generative AI Live
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Real-time Placement & Technical Query Assistant (Persisted in MongoDB)
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="btn btn-secondary"
          style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
          title="Clear Conversation"
        >
          <Trash2 size={15} />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.6rem',
        marginBottom: '0.75rem',
        flexShrink: 0
      }}>
        {SUGGESTED_QUERIES.map((sq, i) => {
          const Icon = sq.icon;
          return (
            <button
              key={i}
              onClick={() => sendMessage(sq.query)}
              className="btn btn-secondary"
              style={{
                fontSize: '0.8rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '9999px',
                background: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
                whiteSpace: 'nowrap',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}
            >
              <Icon size={14} color="var(--accent-indigo)" />
              <span>{sq.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Area */}
      <div
        className="card"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        {fetchingHistory ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Loading conversation memory from MongoDB...</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '0.85rem',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: isUser ? '80%' : '90%',
                  flexDirection: isUser ? 'row-reverse' : 'row'
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: isUser ? 'var(--gradient-accent)' : 'var(--wc-blue-wash)',
                    border: isUser ? 'none' : '1px solid var(--wc-blue-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isUser ? '#fff' : 'var(--wc-blue)',
                    flexShrink: 0
                  }}
                >
                  {isUser ? <User size={16} /> : <Bot size={18} />}
                </div>

                {/* Bubble */}
                <div
                  style={{
                    padding: '0.9rem 1.15rem',
                    borderRadius: 'var(--radius-lg)',
                    borderTopRightRadius: isUser ? '4px' : 'var(--radius-lg)',
                    borderTopLeftRadius: !isUser ? '4px' : 'var(--radius-lg)',
                    background: isUser ? 'var(--gradient-accent)' : 'var(--bg-card)',
                    border: isUser ? 'none' : '1.5px solid var(--border-color)',
                    boxShadow: isUser ? '0 4px 14px rgba(79, 70, 229, 0.25)' : 'var(--shadow-sm)',
                    color: isUser ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '0.92rem'
                  }}
                >
                  {renderFormattedContent(msg.content)}
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: isUser ? 'rgba(255, 255, 255, 0.75)' : 'var(--text-muted)',
                      marginTop: '0.4rem',
                      textAlign: isUser ? 'right' : 'left',
                      fontWeight: 600
                    }}
                  >
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {loading && (
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'var(--wc-blue-wash)',
              border: '1px solid var(--wc-blue-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={18} color="var(--wc-blue)" />
            </div>
            <div style={{
              background: 'var(--wc-blue-wash)',
              border: '1px solid var(--wc-blue-border)',
              padding: '0.75rem 1.1rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--wc-blue)',
              fontSize: '0.85rem',
              fontWeight: 700
            }}>
              <Sparkles size={14} className="spin-slow" />
              <span>PrepBot is thinking & generating answer with Gemini AI...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div style={{ marginTop: '0.85rem', flexShrink: 0 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          style={{ display: 'flex', gap: '0.65rem' }}
        >
          <input
            type="text"
            placeholder="Ask about DSA algorithms, OS, DBMS, MongoDB aggregations, or HR questions..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            style={{
              padding: '0.85rem 1.15rem',
              fontSize: '0.95rem',
              borderRadius: 'var(--radius-md)'
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !inputMessage.trim()}
            style={{ padding: '0 1.5rem', borderRadius: 'var(--radius-md)' }}
          >
            <Send size={18} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatAssistant;
