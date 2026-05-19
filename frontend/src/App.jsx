import React, { useEffect, useState } from 'react';

const API_URL = window.location.origin;

function App() {
  const [page, setPage] = useState('home');
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [demoStep, setDemoStep] = useState('industry'); // industry, name, email, done
  const [formData, setFormData] = useState({ industry: '', name: '', email: '', question: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (telegram) {
      telegram.ready();
      telegram.expand();
      telegram.MainButton.setParams({
        text: 'Continue',
        color: telegram.themeParams.button_color || '#2ea6ff',
        text_color: telegram.themeParams.button_text_color || '#ffffff',
      });
      
      // Get user data from Telegram
      const user = telegram.initDataUnsafe?.user;
      if (user) setUser(user);
      setTg(telegram);
      
      // Track open
      fetch(`${API_URL}/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: user?.id,
          event_type: 'mini_app_open',
          username: user?.username,
          first_name: user?.first_name,
        }),
      }).catch(() => {});
    }
  }, []);

  const navigate = (p) => {
    setPage(p);
    if (tg) tg.BackButton.hide();
  };

  const handleDemoClick = () => {
    setDemoStep('industry');
    setFormData(prev => ({ ...prev, industry: '', name: '', email: '' }));
    setPage('demo');
  };

  const handleIndustrySelect = (industry) => {
    setFormData(prev => ({ ...prev, industry }));
    setDemoStep('name');
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      setDemoStep('email');
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) return;

    setLoading(true);
    try {
      await fetch(`${API_URL}/api/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: user?.id,
          name: formData.name,
          industry: formData.industry,
          email: formData.email,
        }),
      });
      setDemoStep('done');
    } catch (err) {
      console.error('Failed to submit lead:', err);
    }
    setLoading(false);
  };

  const industries = [
    { icon: '🏠', label: 'Real Estate', key: 'Real Estate' },
    { icon: '⚖️', label: 'Law Firm', key: 'Law Firm' },
    { icon: '🛒', label: 'E-Commerce', key: 'E-Commerce' },
    { icon: '🏥', label: 'Healthcare', key: 'Healthcare' },
    { icon: '🔧', label: 'Home Services', key: 'Home Services' },
    { icon: '🚚', label: 'Logistics', key: 'Logistics' },
    { icon: '📋', label: 'Insurance', key: 'Insurance' },
    { icon: '💻', label: 'SaaS', key: 'SaaS' },
    { icon: '🦷', label: 'Dental', key: 'Dental' },
    { icon: '🏢', label: 'Property Mgmt', key: 'Property Mgmt' },
    { icon: '📝', label: 'Other', key: 'Other' },
  ];

  return (
    <div className="app">
      {page === 'home' && (
        <div className="page home">
          <div className="hero">
            <div className="hero-badge">AI-Powered Concierge</div>
            <h1>Never Miss a Lead Again</h1>
            <p>24/7 AI agents that handle calls, chats, and bookings so your business never sleeps.</p>
            <div className="stats-row">
              <div className="stat">
                <span className="stat-value">600ms</span>
                <span className="stat-label">Response Time</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-value">31+</span>
                <span className="stat-label">Languages</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-value">24/7</span>
                <span className="stat-label">Always On</span>
              </div>
            </div>
          </div>

          <div className="menu">
            <button className="menu-btn primary" onClick={handleDemoClick}>
              <span className="menu-btn-icon">🎯</span>
              <div className="menu-btn-text">
                <span className="menu-btn-title">See a Demo</span>
                <span className="menu-btn-sub">Personalized industry walkthrough</span>
              </div>
              <span className="menu-btn-arrow">→</span>
            </button>

            <button className="menu-btn" onClick={() => setPage('pricing')}>
              <span className="menu-btn-icon">💰</span>
              <div className="menu-btn-text">
                <span className="menu-btn-title">Pricing</span>
                <span className="menu-btn-sub">Plans built around your business</span>
              </div>
              <span className="menu-btn-arrow">→</span>
            </button>

            <button className="menu-btn" onClick={() => window.open('https://calendly.com/dombrovskakate/30min', '_blank')}>
              <span className="menu-btn-icon">📅</span>
              <div className="menu-btn-text">
                <span className="menu-btn-title">Book a Call</span>
                <span className="menu-btn-sub">30-min discovery with Kat</span>
              </div>
              <span className="menu-btn-arrow">→</span>
            </button>

            <button className="menu-btn" onClick={() => setPage('ask')}>
              <span className="menu-btn-icon">❓</span>
              <div className="menu-btn-text">
                <span className="menu-btn-title">Ask a Question</span>
                <span className="menu-btn-sub">Get a straight answer</span>
              </div>
              <span className="menu-btn-arrow">→</span>
            </button>
          </div>

          <div className="footer">
            <a href="https://eliteai.space" target="_blank" rel="noopener noreferrer">eliteai.space</a>
          </div>
        </div>
      )}

      {page === 'demo' && demoStep === 'industry' && (
        <div className="page demo">
          <div className="page-header">
            <button className="back-btn" onClick={() => navigate('home')}>←</button>
            <h2>What industry is your business in?</h2>
          </div>
          <p className="page-subtitle">We'll show you how Elite AI works for your specific use case.</p>
          <div className="industry-grid">
            {industries.map(ind => (
              <button
                key={ind.key}
                className="industry-card"
                onClick={() => handleIndustrySelect(ind.key)}
              >
                <span className="industry-icon">{ind.icon}</span>
                <span className="industry-label">{ind.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {page === 'demo' && demoStep === 'name' && (
        <div className="page demo">
          <div className="page-header">
            <button className="back-btn" onClick={() => setDemoStep('industry')}>←</button>
            <h2>What's your name?</h2>
          </div>
          <p className="page-subtitle">So we can personalize your demo experience.</p>
          <form onSubmit={handleNameSubmit} className="form-container">
            <input
              type="text"
              className="form-input"
              placeholder="Your name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              autoFocus
            />
            <button type="submit" className="form-btn" disabled={!formData.name.trim()}>
              Continue →
            </button>
          </form>
        </div>
      )}

      {page === 'demo' && demoStep === 'email' && (
        <div className="page demo">
          <div className="page-header">
            <button className="back-btn" onClick={() => setDemoStep('name')}>←</button>
            <h2>What's your email?</h2>
          </div>
          <p className="page-subtitle">We'll send your personalized breakdown there.</p>
          <form onSubmit={handleEmailSubmit} className="form-container">
            <input
              type="email"
              className="form-input"
              placeholder="you@company.com"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              autoFocus
            />
            <button type="submit" className="form-btn" disabled={!formData.email.trim() || loading}>
              {loading ? 'Sending...' : 'Get My Breakdown →'}
            </button>
          </form>
        </div>
      )}

      {page === 'demo' && demoStep === 'done' && (
        <div className="page demo success">
          <div className="success-icon">✓</div>
          <h2>You're all set!</h2>
          <p>
            We're sending your personalized breakdown to <strong>{formData.email}</strong>
          </p>
          <p className="success-note">
            Kat (our founder) will reach out to discuss your setup.
          </p>
          <div className="success-actions">
            <button className="success-btn primary" onClick={() => window.open('https://calendly.com/dombrovskakate/30min', '_blank')}>
              📅 Book a Call Now
            </button>
            <button className="success-btn" onClick={() => navigate('home')}>
              Back to Menu
            </button>
          </div>
        </div>
      )}

      {page === 'pricing' && (
        <div className="page pricing">
          <div className="page-header">
            <button className="back-btn" onClick={() => navigate('home')}>←</button>
            <h2>Built Around Your Business</h2>
          </div>
          <p className="page-subtitle">Every business handles calls differently. We price around the volume that matches your stage.</p>

          <div className="pricing-cards">
            <div className="pricing-card">
              <div className="pricing-icon">🎙</div>
              <h3>Voice Agent</h3>
              <div className="pricing-price">From $499<span>/mo</span></div>
              <p className="pricing-sub">+ one-time setup fee</p>
              <ul className="pricing-features">
                <li>Inbound & outbound voice agent</li>
                <li>Keep your existing phone number</li>
                <li>Lead qualification & live booking</li>
                <li>CRM + calendar integration</li>
                <li>Transcripts, summaries & SMS follow-ups</li>
                <li>Auto QA + weekly performance tuning</li>
              </ul>
              <button className="pricing-btn" onClick={() => window.open('https://calendly.com/dombrovskakate/30min', '_blank')}>
                Get a Quote →
              </button>
            </div>

            <div className="pricing-card popular">
              <div className="popular-badge">⭐ Most Popular</div>
              <div className="pricing-icon">💬</div>
              <h3>Chat Agent</h3>
              <div className="pricing-price">From $249<span>/mo</span></div>
              <p className="pricing-sub">Web chat + SMS + WhatsApp</p>
              <ul className="pricing-features">
                <li>Web chat + SMS + WhatsApp agent</li>
                <li>Knowledge base auto-trained on your site</li>
                <li>Lead capture, scoring & CRM sync</li>
                <li>Calendar booking in chat</li>
                <li>31+ languages</li>
                <li>Smart human handoff</li>
              </ul>
              <button className="pricing-btn primary" onClick={() => window.open('https://calendly.com/dombrovskakate/30min', '_blank')}>
                Get Started →
              </button>
            </div>

            <div className="pricing-card">
              <div className="pricing-icon">🚀</div>
              <h3>Full Suite</h3>
              <div className="pricing-price">From $999<span>/mo</span></div>
              <p className="pricing-sub">Voice + chat, one shared brain</p>
              <ul className="pricing-features">
                <li>Everything in Voice & Chat</li>
                <li>Unified conversation history</li>
                <li>Smart warm transfer to humans</li>
                <li>Dedicated success engineer</li>
                <li>Sentiment analysis & escalation rules</li>
              </ul>
              <button className="pricing-btn" onClick={() => window.open('https://calendly.com/dombrovskakate/30min', '_blank')}>
                Get a Quote →
              </button>
            </div>
          </div>
        </div>
      )}

      {page === 'ask' && (
        <div className="page ask">
          <div className="page-header">
            <button className="back-btn" onClick={() => navigate('home')}>←</button>
            <h2>Ask Me Anything</h2>
          </div>
          <p className="page-subtitle">About features, pricing, setup, integrations. I'll give you a straight answer.</p>

          <div className="quick-questions">
            <button className="quick-q" onClick={() => setFormData(prev => ({ ...prev, question: 'How does pricing work?' }))}>
              💰 How does pricing work?
            </button>
            <button className="quick-q" onClick={() => setFormData(prev => ({ ...prev, question: 'What CRM do you integrate with?' }))}>
              🔗 What CRM integrations?
            </button>
            <button className="quick-q" onClick={() => setFormData(prev => ({ ...prev, question: 'How long does setup take?' }))}>
              ⏱ How long is setup?
            </button>
            <button className="quick-q" onClick={() => setFormData(prev => ({ ...prev, question: 'Is it HIPAA compliant?' }))}>
              🔒 Security & compliance?
            </button>
          </div>

          <form
            className="form-container"
            onSubmit={(e) => {
              e.preventDefault();
              if (formData.question.trim()) {
                // Send question to bot or track it
                fetch(`${API_URL}/api/question`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    telegram_id: user?.id,
                    question: formData.question,
                  }),
                }).catch(() => {});
                setFormData(prev => ({ ...prev, question: '' }));
                // Could add AI response here later
              }
            }}
          >
            <textarea
              className="form-textarea"
              placeholder="Type your question..."
              value={formData.question}
              onChange={e => setFormData(prev => ({ ...prev, question: e.target.value }))}
              rows={3}
            />
            <button type="submit" className="form-btn" disabled={!formData.question.trim()}>
              Send Question →
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
