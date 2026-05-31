import { useState, useEffect } from 'react'

const ADMIN_PASSWORD = 'elite2026'

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false)
  const [passInput, setPassInput] = useState('')
  const [passWrong, setPassWrong] = useState(false)
  const [tab, setTab] = useState('overview')
  const [leads, setLeads] = useState([])
  const [pageViews, setPageViews] = useState([])
  const [calendly, setCalendly] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (sessionStorage.getItem('elite_admin') === '1') setAuthed(true)
  }, [])

  const login = (e) => {
    e.preventDefault()
    if (passInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('elite_admin', '1')
      setAuthed(true)
      setPassWrong(false)
    } else {
      setPassWrong(true)
    }
  }

  const logout = () => {
    sessionStorage.removeItem('elite_admin')
    setAuthed(false)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin-data', {
        headers: { 'Authorization': `Bearer ${ADMIN_PASSWORD}` }
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      setLeads(data.leads || [])
      setPageViews(data.pageViews || [])
      setCalendly(data.calendlyClicks || [])
      setEvents(data.events || [])
    } catch (e) {
      console.error('Dashboard fetch error:', e)
    }
    setLoading(false)
  }

  useEffect(() => { if (authed) fetchData() }, [authed])

  // KPIs
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const leadsThisWeek = leads.filter(l => new Date(l.created_at) >= weekAgo).length
  const viewsThisWeek = pageViews.filter(v => new Date(v.created_at) >= weekAgo).length
  const totalViews = pageViews.length
  const totalCalendly = calendly.length
  const conversionRate = totalViews > 0 ? ((leads.length / totalViews) * 100).toFixed(1) : '0'

  // Industry breakdown
  const industries = {}
  leads.forEach(l => { if (l.industry) industries[l.industry] = (industries[l.industry] || 0) + 1 })
  const industryData = Object.entries(industries).map(([name, value]) => ({ name, value }))

  // Pages breakdown
  const pages = {}
  pageViews.forEach(v => { pages[v.page] = (pages[v.page] || 0) + 1 })
  const pageData = Object.entries(pages).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  // Leads over time (last 14 days)
  const daysAgo = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    return d.toISOString().slice(0, 10)
  }).reverse()
  const maxLeads = Math.max(...daysAgo.map(day => leads.filter(l => l.created_at?.startsWith(day)).length), 1)
  const leadsOverTime = daysAgo.map(day => ({
    date: day.slice(5),
    leads: leads.filter(l => l.created_at?.startsWith(day)).length,
    views: pageViews.filter(v => v.created_at?.startsWith(day)).length,
  }))

  // Filtered leads
  const filteredLeads = leads.filter(l => {
    const s = searchTerm.toLowerCase()
    return !s || (l.name?.toLowerCase().includes(s)) || (l.email?.toLowerCase().includes(s)) || (l.industry?.toLowerCase().includes(s))
  })

  if (!authed) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginBox}>
          <div style={styles.loginLogo}>⚡</div>
          <h2 style={{ margin: '12px 0 6px', color: '#fff', fontSize: 20 }}>Elite AI Admin</h2>
          <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>Dashboard access</p>
          <form onSubmit={login}>
            <input type="password" placeholder="Password" value={passInput}
              onChange={e => { setPassInput(e.target.value); setPassWrong(false) }}
              style={{ ...styles.input, borderColor: passWrong ? '#ef4444' : '#374151' }} autoFocus />
            {passWrong && <p style={{ color: '#ef4444', fontSize: 12, margin: '6px 0 0' }}>Wrong password</p>}
            <button type="submit" style={styles.loginBtn}>Access Dashboard →</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, color: '#fff' }}>⚡ Elite AI Admin</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>eliteai.space — Dashboard</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={fetchData} style={styles.refreshBtn}>↻ Refresh</button>
          <button onClick={() => window.location.hash = ''} style={styles.siteBtn}>View Site →</button>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiRow}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>👥</div>
          <div style={styles.kpiValue}>{leads.length}</div>
          <div style={styles.kpiLabel}>Total Leads</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>📈</div>
          <div style={styles.kpiValue}>{leadsThisWeek}</div>
          <div style={styles.kpiLabel}>This Week</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>👁️</div>
          <div style={styles.kpiValue}>{totalViews}</div>
          <div style={styles.kpiLabel}>Page Views</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>📅</div>
          <div style={styles.kpiValue}>{totalCalendly}</div>
          <div style={styles.kpiLabel}>Calendly Clicks</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>🎯</div>
          <div style={styles.kpiValue}>{conversionRate}%</div>
          <div style={styles.kpiLabel}>Conversion Rate</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['overview', 'leads', 'analytics', 'events'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}>
            {t === 'overview' && '📊 Overview'}
            {t === 'leads' && '👥 Leads'}
            {t === 'analytics' && '📈 Analytics'}
            {t === 'events' && '⚡ Events'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Loading data...</div>
      ) : (
        <>
          {tab === 'overview' && (
            <div style={styles.twoCol}>
              {/* Leads Over Time */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Leads Over Time (14 days)</h3>
                <div style={styles.barChart}>
                  {leadsOverTime.map(d => (
                    <div key={d.date} style={styles.barRow}>
                      <span style={styles.barLabel}>{d.date}</span>
                      <div style={styles.barTrack}>
                        <div style={{
                          ...styles.bar,
                          width: `${(d.leads / maxLeads) * 100}%`,
                        }} />
                      </div>
                      <span style={styles.barNum}>{d.leads}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Industries */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Top Industries</h3>
                {industryData.length > 0 ? (
                  <div style={styles.industryList}>
                    {industryData.map((ind, i) => (
                      <div key={ind.name} style={styles.industryRow}>
                        <span style={styles.industryRank}>{i + 1}</span>
                        <span style={styles.industryName}>{ind.name}</span>
                        <span style={styles.industryCount}>{ind.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6b7280', fontSize: 13 }}>No leads yet</p>
                )}
              </div>

              {/* Recent Leads */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Recent Leads</h3>
                {leads.length > 0 ? (
                  <div style={styles.recentGrid}>
                    {leads.slice(0, 6).map(l => (
                      <div key={l.id} style={styles.recentItem}>
                        <div style={styles.recentName}>{l.name || 'Anonymous'}</div>
                        <div style={styles.recentEmail}>{l.email || 'No email'}</div>
                        <div style={styles.recentMeta}>
                          <span style={styles.badge}>{l.industry || 'N/A'}</span>
                          <span style={{ color: '#6b7280', fontSize: 11 }}>
                            {l.created_at ? new Date(l.created_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6b7280', fontSize: 13 }}>No leads yet</p>
                )}
              </div>
            </div>
          )}

          {tab === 'leads' && (
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={styles.cardTitle}>All Leads</h3>
                <input placeholder="Search name, email, industry..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={styles.searchInput} />
              </div>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Industry</th>
                      <th style={styles.th}>Question</th>
                      <th style={styles.th}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(l => (
                      <tr key={l.id} style={styles.tr}>
                        <td style={styles.td}>{l.name || '—'}</td>
                        <td style={styles.td}><a href={`mailto:${l.email}`} style={{ color: '#818cf8' }}>{l.email || '—'}</a></td>
                        <td style={styles.td}>{l.industry || '—'}</td>
                        <td style={styles.td}>{l.question ? l.question.substring(0, 60) : '—'}</td>
                        <td style={styles.td}>{l.created_at ? new Date(l.created_at).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredLeads.length === 0 && <p style={{ color: '#6b7280', textAlign: 'center', padding: 20 }}>No leads found</p>}
            </div>
          )}

          {tab === 'analytics' && (
            <div style={styles.twoCol}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Page Views by Page</h3>
                {pageData.length > 0 ? (
                  <div style={styles.industryList}>
                    {pageData.map(p => (
                      <div key={p.name} style={styles.industryRow}>
                        <span style={styles.industryName}>{p.name}</span>
                        <span style={styles.industryCount}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6b7280', fontSize: 13 }}>No data yet</p>
                )}
              </div>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Views This Week</h3>
                <div style={{ fontSize: 48, fontWeight: 700, color: '#818cf8' }}>{viewsThisWeek}</div>
                <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>{totalViews} total views all time</p>
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #1f2937' }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: '#f59e0b' }}>{totalCalendly}</div>
                  <p style={{ color: '#6b7280', fontSize: 13 }}>Total Calendly clicks</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'events' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Event Log</h3>
              {events.length > 0 ? (
                <div style={styles.eventList}>
                  {events.slice(0, 50).map(e => (
                    <div key={e.id} style={styles.eventItem}>
                      <div style={styles.eventBadge}>{e.event_type}</div>
                      <div style={styles.eventData}>
                        {typeof e.event_data === 'object' ? JSON.stringify(e.event_data) : String(e.event_data || '—')}
                      </div>
                      <div style={styles.eventTime}>
                        {e.created_at ? new Date(e.created_at).toLocaleString() : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6b7280', fontSize: 13 }}>No events yet</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0f', color: '#e5e7eb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: 20 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  refreshBtn: { background: '#1a1a2e', border: '1px solid #334155', color: '#94a3b8', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  siteBtn: { background: '#1e1b4b', border: '1px solid #312e81', color: '#a5b4fc', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, textDecoration: 'none' },
  logoutBtn: { background: '#7f1d1d', border: '1px solid #991b1b', color: '#fca5a5', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  kpiRow: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  kpiCard: { flex: '1 1 140px', background: '#1a1a2e', borderRadius: 12, padding: '16px', borderLeft: '3px solid #818cf8' },
  kpiIcon: { fontSize: 20, marginBottom: 6 },
  kpiValue: { fontSize: 26, fontWeight: 700, color: '#fff' },
  kpiLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  tabs: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  tab: { background: '#1a1a2e', border: '1px solid #334155', color: '#94a3b8', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  tabActive: { background: '#6366f1', color: '#fff', borderColor: '#6366f1' },
  twoCol: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  card: { flex: '1 1 300px', background: '#1a1a2e', borderRadius: 12, padding: 20, border: '1px solid #1f2937', marginBottom: 16 },
  cardTitle: { margin: '0 0 16px', fontSize: 14, color: '#d1d5db' },
  barChart: { display: 'flex', flexDirection: 'column', gap: 4 },
  barRow: { display: 'flex', alignItems: 'center', gap: 8 },
  barLabel: { width: 44, fontSize: 11, color: '#6b7280', textAlign: 'right' },
  barTrack: { flex: 1, height: 18, background: '#0a0a0f', borderRadius: 4, overflow: 'hidden' },
  bar: { height: '100%', background: 'linear-gradient(90deg, #6366f1, #818cf8)', borderRadius: 4, minWidth: 4 },
  barNum: { width: 20, fontSize: 11, color: '#d1d5db', textAlign: 'center' },
  industryList: { display: 'flex', flexDirection: 'column', gap: 6 },
  industryRow: { display: 'flex', alignItems: 'center', gap: 8, background: '#0a0a0f', borderRadius: 6, padding: '8px 12px' },
  industryRank: { width: 20, fontSize: 11, color: '#6b7280' },
  industryName: { flex: 1, fontSize: 13, color: '#d1d5db' },
  industryCount: { fontSize: 13, fontWeight: 600, color: '#818cf8' },
  recentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 },
  recentItem: { background: '#0a0a0f', borderRadius: 8, padding: 12, border: '1px solid #1f2937' },
  recentName: { fontWeight: 600, fontSize: 13, color: '#fff' },
  recentEmail: { fontSize: 12, color: '#818cf8', marginTop: 2 },
  recentMeta: { display: 'flex', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' },
  badge: { background: '#1e1b4b', color: '#a5b4fc', fontSize: 10, padding: '2px 6px', borderRadius: 4 },
  searchInput: { background: '#0a0a0f', border: '1px solid #334155', color: '#e5e7eb', padding: '6px 12px', borderRadius: 8, fontSize: 13, outline: 'none', width: 260 },
  tableWrap: { overflowX: 'auto', borderRadius: 8, border: '1px solid #1f2937' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 },
  th: { background: '#1a1a2e', color: '#6b7280', padding: '10px 12px', textAlign: 'left', fontWeight: 500, borderBottom: '1px solid #1f2937' },
  tr: { borderBottom: '1px solid #1f2937' },
  td: { padding: '8px 12px', color: '#e5e7eb' },
  eventList: { display: 'flex', flexDirection: 'column', gap: 6 },
  eventItem: { background: '#0a0a0f', borderRadius: 6, padding: 10, border: '1px solid #1f2937', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  eventBadge: { background: '#1e1b4b', color: '#a5b4fc', fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 500, whiteSpace: 'nowrap' },
  eventData: { flex: 1, fontSize: 11, color: '#6b7280', fontFamily: 'monospace', wordBreak: 'break-all', minWidth: 0 },
  eventTime: { fontSize: 10, color: '#4b5563', whiteSpace: 'nowrap' },
  loginContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' },
  loginBox: { background: '#1a1a2e', borderRadius: 16, padding: '36px 28px', width: 300, textAlign: 'center', border: '1px solid #1f2937' },
  loginLogo: { fontSize: 36 },
  input: { width: '100%', background: '#0a0a0f', border: '1px solid #334155', color: '#e5e7eb', padding: '10px 14px', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  loginBtn: { width: '100%', background: '#6366f1', color: '#fff', border: 'none', padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 12 },
}
