// Vercel Serverless Function — tracks Mini App events
const BOT_TOKEN = process.env.BOT_TOKEN || '8871744855:AAEE5TM8DTnPJ-HKlFfJTlE1pSczfQy070g';
const KAT_CHAT_ID = '5268028095';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { telegram_id, event_type, event_data, username, first_name } = req.body;

  if (!telegram_id) return res.status(400).json({ error: 'Missing telegram_id' });

  const message = `📊 *Mini App Event*\n\n` +
    `User: ${first_name || 'Unknown'} (@${username || 'N/A'})\n` +
    `ID: ${telegram_id}\n` +
    `Event: ${event_type || 'mini_app_event'}\n` +
    `Data: ${event_data || 'N/A'}`;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: KAT_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Track error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
