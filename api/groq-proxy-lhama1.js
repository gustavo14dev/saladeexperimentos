// Proxy dedicado para Lhama AI 1 usando variável exclusiva GROQ_API_KEY_LHAMA1
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const apiKey = process.env.GROQ_API_KEY_LHAMA1;
    if (!apiKey) {
        return res.status(500).json({ error: 'GROQ_API_KEY_LHAMA1 is not configured in ENV' });
    }
    try {
        const { model, messages, temperature = 0.7, max_tokens = 2048, ...rest } = req.body || {};
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model || 'llama-3.1-8b-instant',
                messages,
                temperature,
                max_tokens,
                ...rest
            })
        });
        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({ error: data.error || 'Groq API error', details: data });
        }
        return res.status(200).json(data);
    } catch (e) {
        return res.status(500).json({ error: 'Proxy error', details: String(e) });
    }
}
