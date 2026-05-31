export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bupwdgouuosohiecfvji.supabase.co'
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'elite2026'

  // Simple auth check
  const auth = req.headers.authorization
  if (!auth || auth !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const fetchAll = async (table, limit = 1000) => {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?order=created_at.desc&limit=${limit}`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        }
      })
      if (!r.ok) throw new Error(`Failed to fetch ${table}: ${r.status}`)
      return r.json()
    }

    const [leads, pageViews, calendlyClicks, events] = await Promise.all([
      fetchAll('leads'),
      fetchAll('page_views', 1000),
      fetchAll('calendly_clicks', 1000),
      fetchAll('events', 500),
    ])

    return res.status(200).json({
      leads: leads || [],
      pageViews: pageViews || [],
      calendlyClicks: calendlyClicks || [],
      events: events || [],
    })
  } catch (err) {
    console.error('Admin API error:', err)
    return res.status(500).json({ error: err.message })
  }
}
