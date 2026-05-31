import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bupwdgouuosohiecfvji.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_X3rsehLc9uUbQ6XfGrDQSw_Egjv5eE0'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export function getSessionId() {
  let sid = localStorage.getItem('elite_session_id')
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    localStorage.setItem('elite_session_id', sid)
  }
  return sid
}

// Track page view
export async function trackPageView(page) {
  try {
    await supabase.from('page_views').insert({
      page,
      session_id: getSessionId(),
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    })
  } catch (e) { /* silent */ }
}

// Track Calendly click
export async function trackCalendlyClick(page) {
  try {
    await supabase.from('calendly_clicks').insert({
      page,
      session_id: getSessionId(),
    })
  } catch (e) {}
}

// Track any event
export async function trackEvent(eventType, data = {}) {
  try {
    await supabase.from('events').insert({
      event_type: eventType,
      event_data: data,
      session_id: getSessionId(),
    })
  } catch (e) {}
}

// Submit a lead
export async function submitLead(leadData) {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      name: leadData.name,
      email: leadData.email,
      industry: leadData.industry,
      question: leadData.question || null,
      source: leadData.source || 'website_demo',
    })
    .select()
  if (error) throw error
  return data
}
