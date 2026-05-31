import { useEffect, useState } from 'react'
import { trackPageView, trackCalendlyClick, trackEvent, submitLead } from './supabase'
import AdminDashboard from './AdminDashboard'

const CALENDLY_URL = 'https://calendly.com/dombrovskakate/30min'

function MainSite() {
  const [page, setPage] = useState('home')
  const [demoStep, setDemoStep] = useState('industry')
  const [formData, setFormData] = useState({ industry: '', name: '', email: '', question: '' })
  const [loading, setLoading] = useState(false)
  const [leadSubmitted, setLeadSubmitted] = useState(false)
  const [questionSent, setQuestionSent] = useState(false)

  useEffect(() => {
    trackPageView(window.location.pathname)
    trackEvent('page_view', { page: window.location.pathname })
  }, [])

  const handleCalendlyClick = (fromPage) => {
    trackCalendlyClick(fromPage)
    trackEvent('calendly_click', { page: fromPage })
    window.open(CALENDLY_URL, '_blank')
  }

  const handleDemoClick = () => {
    trackEvent('demo_start')
    setDemoStep('industry')
    setFormData({ industry: '', name: '', email: '', question: '' })
    setLeadSubmitted(false)
    setPage('demo')
  }

  const handleIndustrySelect = (industry) => {
    trackEvent('demo_industry_select', { industry })
    setFormData(prev => ({ ...prev, industry }))
    setDemoStep('name')
  }

  const handleNameSubmit = (e) => {
    e.preventDefault()
    if (formData.name.trim()) {
      trackEvent('demo_name_submit', { name: formData.name })
      setDemoStep('email')
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email.trim()) return
    setLoading(true)
    trackEvent('demo_lead_submit', { name: formData.name, industry: formData.industry, email: formData.email })
    try {
      await submitLead({ name: formData.name, industry: formData.industry, email: formData.email, source: 'website_demo' })
    } catch (err) {
      console.error('Lead submit error:', err)
    }
    setLeadSubmitted(true)
    setDemoStep('done')
    setLoading(false)
  }

  const handleQuestionSubmit = async (e) => {
    e.preventDefault()
    if (!formData.question.trim()) return
    trackEvent('question_submitted', { question: formData.question })
    setLoading(true)
    try {
      await submitLead({ name: null, email: null, industry: null, question: formData.question, source: 'website_question' })
    } catch (err) {
      console.error('Question submit error:', err)
    }
    setQuestionSent(true)
    setFormData(prev => ({ ...prev, question: '' }))
    setLoading(false)
  }

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
  ]

  return (
    <div className="app">
      {page === 'home' && (
        <div className="page home">
          <div className="hero">
            <div className="hero-badge">AI-Powered Concierge</div>
            <h1>Never Miss a Lead Again</h1>
            <p>24/7 AI agents that handle calls, chats, and bookings so your business never sleeps.</p>
            <div className="stats-row">
              <div className="stat"><span className="stat-value">600ms</span><span className="stat-label">Response Time</span></div>
              <div className="stat-divider" />
              <div className="stat"><span className="stat-value">31+</span><span className="stat-label">Languages</span></div>
              <div className="stat-divider" />
              <div className="stat"><span className="stat-value">24/7</span><span className="stat-label">Always On</span></div>
            </div>
          </div>
          <div className="menu">
            <button className="menu-btn primary" onClick={handleDemoClick}>
              <span className="menu-btn-icon">🎯</span>
              <div className="menu-btn-text"><span className="menu-btn-title">See a Demo</span><span className="menu-btn-sub">Personalized industry walkthrough</span></div>
              <span className="menu-btn-arrow">→</span>
            </button>
            <button className="menu-btn" onClick={() => setPage('pricing')}>
              <span className="menu-btn-icon">💰</span>
              <div className="menu-btn-text"><span className="menu-btn-title">Pricing</span><span className="menu-btn-sub">Plans built around your business</span></div>
              <span className="menu-btn-arrow">→</span>
            </button>
            <button className="menu-btn" onClick={() => handleCalendlyClick('home')}>
              <span className="menu-btn-icon">📅</span>
              <div className="menu-btn-text"><span className="menu-btn-title">Book a Call</span><span className="menu-btn-sub">30-min discovery with Kat</span></div>
              <span className="menu-btn-arrow">→</span>
            </button>
            <button className="menu-btn" onClick={() => setPage('ask')}>
              <span className="menu-btn-icon">❓</span>
              <div className="menu-btn-text"><span className="menu-btn-title">Ask a Question</span><span className="menu-btn-sub">Get a straight answer</span></div>
              <span className="menu-btn-arrow">→</span>
            </button>
          </div>
          <div className="footer"><a href="https://eliteai.space" target="_blank" rel="noopener noreferrer">eliteai.space</a></div>
        </div>
      )}

      {page === 'demo' && demoStep === 'industry' && (
        <div className="page demo">
          <div className="page-header">
            <button className="back-btn" onClick={() => setPage('home')}>←</button>
            <h2>What industry is your business in?</h2>
          </div>
          <p className="page-subtitle">We'll show you how Elite AI works for your specific use case.</p>
          <div className="industry-grid">
            {industries.map(ind => (
              <button key={ind.key} className="industry-card" onClick={() => handleIndustrySelect(ind.key)}>
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
            <input type="text" className="form-input" placeholder="Your name" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} autoFocus />
            <button type="submit" className="form-btn" disabled={!formData.name.trim()}>Continue →</button>
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
            <input type="email" className="form-input" placeholder="you@company.com" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} autoFocus />
            <button type="submit" className="form-btn" disabled={!formData.email.trim() || loading}>{loading ? 'Sending...' : 'Get My Breakdown →'}</button>
          </form>
        </div>
      )}

      {page === 'demo' && demoStep === 'done' && (
        <div className="page demo success">
          <div className="success-icon">✓</div>
          <h2>You're all set!</h2>
          <p>We're sending your personalized breakdown to <strong>{formData.email}</strong></p>
          <p className="success-note">Kat (our founder) will reach out to discuss your setup.</p>
          <div className="success-actions">
            <button className="success-btn primary" onClick={() => handleCalendlyClick('demo_success')}>📅 Book a Call Now</button>
            <button className="success-btn" onClick={() => setPage('home')}>Back to Menu</button>
          </div>
        </div>
      )}

      {page === 'pricing' && (
        <div className="page pricing">
          <div className="page-header">
            <button className="back-btn" onClick={() => setPage('home')}>←</button>
            <h2>Built Around Your Business</h2>
          </div>
          <p className="page-subtitle">Every business handles calls differently.</p>
          <div className="pricing-cards">
            <div className="pricing-card">
              <div className="pricing-icon">🎙</div><h3>Voice Agent</h3>
              <div className="pricing-price">From $499<span>/mo</span></div>
              <p className="pricing-sub">+ one-time setup fee</p>
              <ul className="pricing-features"><li>Inbound & outbound voice agent</li><li>Keep your existing phone number</li><li>Lead qualification & live booking</li><li>CRM + calendar integration</li></ul>
              <button className="pricing-btn" onClick={() => handleCalendlyClick('pricing_voice')}>Get a Quote →</button>
            </div>
            <div className="pricing-card popular">
              <div className="popular-badge">⭐ Most Popular</div>
              <div className="pricing-icon">💬</div><h3>Chat Agent</h3>
              <div className="pricing-price">From $249<span>/mo</span></div>
              <p className="pricing-sub">Web chat + SMS + WhatsApp</p>
              <ul className="pricing-features"><li>Web chat + SMS + WhatsApp agent</li><li>Knowledge base auto-trained on your site</li><li>Lead capture, scoring & CRM sync</li><li>31+ languages</li></ul>
              <button className="pricing-btn primary" onClick={() => handleCalendlyClick('pricing_chat')}>Get Started →</button>
            </div>
            <div className="pricing-card">
              <div className="pricing-icon">🚀</div><h3>Full Suite</h3>
              <div className="pricing-price">From $999<span>/mo</span></div>
              <p className="pricing-sub">Voice + chat, one shared brain</p>
              <ul className="pricing-features"><li>Everything in Voice & Chat</li><li>Unified conversation history</li><li>Smart warm transfer to humans</li><li>Dedicated success engineer</li></ul>
              <button className="pricing-btn" onClick={() => handleCalendlyClick('pricing_suite')}>Get a Quote →</button>
            </div>
          </div>
        </div>
      )}

      {page === 'ask' && (
        <div className="page ask">
          <div className="page-header">
            <button className="back-btn" onClick={() => setPage('home')}>←</button>
            <h2>Ask Me Anything</h2>
          </div>
          <p className="page-subtitle">About features, pricing, setup, integrations.</p>
          <div className="quick-questions">
            <button className="quick-q" onClick={() => setFormData(prev => ({ ...prev, question: 'How does pricing work?' }))}>💰 How does pricing work?</button>
            <button className="quick-q" onClick={() => setFormData(prev => ({ ...prev, question: 'What CRM integrations?' }))}>🔗 What CRM integrations?</button>
            <button className="quick-q" onClick={() => setFormData(prev => ({ ...prev, question: 'How long is setup?' }))}>⏱ How long is setup?</button>
            <button className="quick-q" onClick={() => setFormData(prev => ({ ...prev, question: 'Security & compliance?' }))}>🔒 Security & compliance?</button>
          </div>
          {questionSent ? (
            <div style={{ textAlign: 'center', padding: 20, color: '#22c55e' }}>✅ Question sent! We'll get back to you.</div>
          ) : (
            <form className="form-container" onSubmit={handleQuestionSubmit}>
              <textarea className="form-textarea" placeholder="Type your question..." value={formData.question} onChange={e => setFormData(prev => ({ ...prev, question: e.target.value }))} rows={3} />
              <button type="submit" className="form-btn" disabled={!formData.question.trim() || loading}>{loading ? 'Sending...' : 'Send Question →'}</button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

// Simple hash-based routing
function App() {
  const hash = window.location.hash.slice(1)
  const [path, setPath] = useState(hash || '/')

  useEffect(() => {
    const onHash = () => setPath(window.location.hash.slice(1) || '/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (path === '/admin') {
    return <AdminDashboard />
  }
  return <MainSite />
}

export default App
