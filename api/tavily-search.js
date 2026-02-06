export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Aceita apenas POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const apiKey = process.env.TAVILY_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'TAVILY_API_KEY is not configured on the server' });
        }

        const { query, search_depth = 'basic', include_answer = true, include_raw_content = false, max_results = 5 } = req.body || {};

        if (!query) {
            return res.status(400).json({ error: 'Missing query in request body' });
        }

        const tavilyResponse = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: apiKey,
                query,
                search_depth,
                include_answer,
                include_raw_content,
                max_results,
                include_images: false,
                include_image_descriptions: false
            })
        });

        const text = await tavilyResponse.text();

        if (!tavilyResponse.ok) {
            return res.status(tavilyResponse.status).json({
                error: `Tavily API error: ${tavilyResponse.statusText}`,
                details: text
            });
        }

        // Repasse direto do JSON (como texto) para manter compatibilidade com o proxy Groq existente
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(text);

    } catch (error) {
        console.error('[TAVILY PROXY] Internal error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
