export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Optional local config fallback (for easy local dev): copy api/local-config.example.js → api/local-config.js and fill your keys. This file MUST be gitignored for security.
    let LOCAL_CONFIG = {};
    try {
        LOCAL_CONFIG = (await import('./local-config.js')).default || {};
    } catch (e) {
        // local config not present — that's fine
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY || LOCAL_CONFIG.GROQ_API_KEY;
    const GROQ_API_URL = process.env.GROQ_API_URL || LOCAL_CONFIG.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';

    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: 'GROQ_API_KEY not configured. Set GROQ_API_KEY in your environment variables or create api/local-config.js (local dev).' });
    }

    try {
        const { model, messages, temperature, max_tokens } = req.body || {};
        const body = {
            model: model || 'llama-3.3-70b-versatile',
            messages: messages || [],
            temperature: typeof temperature === 'number' ? temperature : 0.7,
            max_tokens: typeof max_tokens === 'number' ? max_tokens : 8192
        };

        const r = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
            const status = r.status || 500;
            return res.status(status).json({ error: data.error?.message || `Groq API error ${status}` });
        }

        return res.status(200).json({ content: data.choices?.[0]?.message?.content ?? '' });
    } catch (err) {
        console.error('Error proxying to Groq:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
}