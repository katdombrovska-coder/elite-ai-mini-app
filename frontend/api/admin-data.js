// Vercel Serverless API - Admin Dashboard Data Reader
// Secret key stored in Vercel env vars (never in code)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  // Simple password protection
  const authHeader = req.headers.authorization || ''
  const password = authHeader.replace('Bearer ', '')
  const ADMIN_PASSWORD = process.env.ELITE_ADMIN_PASSWORD || ''
  
  if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const SUPABASE_URL = process.env.ELITE_SUPABASE_URL || ''
  const SUPABASE_SERVICE_KEY = process.env.ELITE_SUPABASE_SERVICE_KEY || ''

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  try {
    const fetchTable = async (table, limit = 1000) => {
      const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&order=created_at.desc&limit=${limit}`
      const r = await fetch(url, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        }
      })
      if (!r.ok) throw new Error(`${table}: ${r.status}`)
      return r.json()
    }

    const [leads, pageViews, calendlyClicks, events] = await Promise.all([
      fetchTable('leads'),
      fetchTable('page_views', 1000),
      fetchTable('calendly_clicks', 1000),
      fetchTable('events', 500),
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
