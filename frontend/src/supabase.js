import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bupwdgouuosohiecfvji.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_X3rsehLc9uUbQ6XfGrDQSw_Egjv5eE0'
const SUPABASE_SERVICE_KEY = 'sb_secret_JUlezIQhwBFNLl7La9nYFg_Sld1mQPm'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export function getSessionId() {
  let sid = localStorage.getItem('elite_session_id')
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    localStorage.setItem('elite_session_id', sid)
  }
  return sid
}

export async function trackPageView(page) {
  try {
    await supabase.from('page_views').insert({
      page,
      session_id: getSessionId(),
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    })
  } catch (e) { console.error('trackPageView error:', e) }
}

export async function trackCalendlyClick(page) {
  try {
    await supabase.from('calendly_clicks').insert({
      page,
      session_id: getSessionId(),
    })
  } catch (e) { console.error('trackCalendlyClick error:', e) }
}

export async function trackEvent(eventType, data = {}) {
  try {
    await supabase.from('events').insert({
      event_type: eventType,
      event_data: data,
      session_id: getSessionId(),
    })
  } catch (e) { console.error('trackEvent error:', e) }
}

export async function submitLead(leadData) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: leadData.name,
        email: leadData.email,
        industry: leadData.industry,
        question: leadData.question || null,
        source: leadData.source || 'website_demo',
        telegram_id: leadData.telegram_id || null,
      })
      .select()
    if (error) throw error
    return data
  } catch (e) {
    console.error('submitLead error:', e)
    throw e
  }
}
