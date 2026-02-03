export default async function handler(req, res) {
    // Aceita apenas POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.LHAMA_GROQ_API_PROXY;
    if (!apiKey) {
        return res.status(500).json({ error: 'LHAMA_GROQ_API_PROXY is not configured on the server' });
    }

    try {
        const { model, messages, temperature = 0.7, max_tokens = 8192, top_p = 1, stream = false } = req.body || {};
        
        if (!model || !messages) {
            return res.status(400).json({ error: 'Missing model or messages in request body' });
        }

        const url = 'https://api.groq.com/openai/v1/chat/completions';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages,
                temperature,
                max_tokens,
                top_p,
                stream
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const text = await response.text();
        
        // Log para diagnóstico (sem expor a chave)
        console.log('[LHAMA GROQ PROXY] Status:', response.status, 'Model:', model);
        
        // Repasse direto do corpo da resposta
        return res.status(response.status).send(text);

    } catch (err) {
        console.error('Error in /api/lhama-groq-api-proxy:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
