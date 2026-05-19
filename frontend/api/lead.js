// Vercel Serverless Function — captures lead and notifies Kat via Telegram
const BOT_TOKEN = process.env.BOT_TOKEN || '8871744855:AAEE5TM8DTnPJ-HKlFfJTlE1pSczfQy070g';
const KAT_CHAT_ID = '5268028095';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { telegram_id, name, industry, email, username, first_name } = req.body;
  if (!telegram_id || !email) return res.status(400).json({ error: 'Missing required fields' });

  const message = `🎯 *New Lead from Mini App*\n\n` +
    `Name: ${name || 'Unknown'}\n` +
    `Industry: ${industry || 'Unknown'}\n` +
    `Email: ${email}\n` +
    `TG: ${telegram_id} (@${username || 'N/A'})`;

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
    console.error('Lead capture error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
