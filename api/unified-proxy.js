export default async function handler(req, res) {
    console.log('[UNIFIED-PROXY] Requisição recebida - Método:', req.method);
    
    // Adicionar headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Aceita apenas POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { service, ...serviceData } = req.body || {};
        
        console.log('[UNIFIED-PROXY] Serviço solicitado:', service);

        switch (service) {
            case 'tavily_search':
                return await handleTavilySearch(serviceData, res);
            case 'pixels':
                return await handlePixels(serviceData, res);
            case 'mistral':
                return await handleMistral(serviceData, res);
            default:
                return res.status(400).json({ error: 'Serviço não especificado ou inválido' });
        }

    } catch (error) {
        console.error('[UNIFIED-PROXY] Erro interno:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}

// ===== HANDLERS ESPECÍFICOS =====

async function handleTavilySearch(data, res) {
    console.log('[TAVILY] Processando busca Tavily');
    
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'TAVILY_API_KEY is not configured on the server' });
    }

    const { query, search_depth = 'basic', include_answer = true, include_raw_content = false, max_results = 5 } = data;

    if (!query) {
        return res.status(400).json({ error: 'Missing query in request body' });
    }

    try {
        const tavilyResponse = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(text);

    } catch (error) {
        console.error('[TAVILY] Erro:', error);
        return res.status(500).json({ error: 'Tavily search failed', details: error.message });
    }
}

async function handlePixels(data, res) {
    console.log('[PIXELS] Processando busca Pexels');
    
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'PEXELS_API_KEY is not configured on the server' });
    }

    const { query, per_page = 20, page = 1 } = data;

    if (!query) {
        return res.status(400).json({ error: 'Missing query in request body' });
    }

    try {
        const pixelsResponse = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${per_page}&page=${page}`, {
            method: 'GET',
            headers: { 'Authorization': apiKey }
        });

        const text = await pixelsResponse.text();

        if (!pixelsResponse.ok) {
            return res.status(pixelsResponse.status).json({
                error: `Pexels API error: ${pixelsResponse.statusText}`,
                details: text
            });
        }

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(text);

    } catch (error) {
        console.error('[PIXELS] Erro:', error);
        return res.status(500).json({ error: 'Pexels search failed', details: error.message });
    }
}

async function handleMistral(data, res) {
    console.log('[MISTRAL] Processando requisição Mistral');
    
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'MISTRAL_API_KEY is not configured on the server' });
    }

    const { model = 'mistral-tiny', messages, temperature = 0.7, max_tokens = 1000 } = data;

    if (!messages) {
        return res.status(400).json({ error: 'Missing messages in request body' });
    }

    try {
        const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages,
                temperature,
                max_tokens
            })
        });

        const text = await mistralResponse.text();

        if (!mistralResponse.ok) {
            return res.status(mistralResponse.status).json({
                error: `Mistral API error: ${mistralResponse.statusText}`,
                details: text
            });
        }

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(text);

    } catch (error) {
        console.error('[MISTRAL] Erro:', error);
        return res.status(500).json({ error: 'Mistral generation failed', details: error.message });
    }
}

