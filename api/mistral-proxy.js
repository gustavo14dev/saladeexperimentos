export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'MISTRAL_API_KEY is not configured on the server' });
    }

    try {
        const { model, messages, temperature = 0.7, max_tokens = 2048 } = req.body || {};
        if (!model || !messages) {
            return res.status(400).json({ error: 'Missing model or messages in request body' });
        }

        const url = 'https://api.mistral.ai/v1/chat/completions';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ model, messages, temperature, max_tokens }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const text = await response.text();
        res.status(response.status).send(text);

    } catch (err) {
        console.error('Error in /api/mistral-proxy:', err);
        if (err.name === 'AbortError') return res.status(504).json({ error: 'Request timed out' });
        return res.status(500).json({ error: 'Internal server error' });
    }
}
