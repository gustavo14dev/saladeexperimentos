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

    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || LOCAL_CONFIG.MISTRAL_API_KEY;
    const MISTRAL_API_URL = process.env.MISTRAL_API_URL || LOCAL_CONFIG.MISTRAL_API_URL || 'https://api.mistral.ai/v1/chat/completions';

    if (!MISTRAL_API_KEY) {
        return res.status(500).json({ error: 'MISTRAL_API_KEY not configured. Set MISTRAL_API_KEY in your environment variables or create api/local-config.js (local dev).' });
    }

    try {
        const { model, messages, temperature, max_tokens } = req.body || {};
        const body = {
            model: model || 'codestral-latest',
            messages: messages || [],
            temperature: typeof temperature === 'number' ? temperature : 0.7,
            max_tokens: typeof max_tokens === 'number' ? max_tokens : 2048
        };

        const r = await fetch(MISTRAL_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MISTRAL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
            const status = r.status || 500;
            return res.status(status).json({ error: data.error?.message || `Mistral API error ${status}` });
        }

        return res.status(200).json({ content: data.choices?.[0]?.message?.content ?? '' });
    } catch (err) {
        console.error('Error proxying to Mistral:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
}