export default async function handler(req, res) {
    // Aceita apenas POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
    }

    try {
        const { model, payload } = req.body || {};
        if (!model || !payload) {
            return res.status(400).json({ error: 'Missing model or payload in request body' });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const text = await response.text();
        // Repasse direto do corpo da resposta (pode ser JSON ou outro formato)
        return res.status(response.status).send(text);

    } catch (err) {
        console.error('Error in /api/gemini-proxy:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
