/**
 * Proxy para API Pexels - busca de imagens
 * Uso: GET /api/pexels-proxy?query=termo&per_page=20&page=1
 */

export default async function handler(req, res) {
    console.log('[PEXELS-PROXY] Requisição recebida');
    
    // Adicionar headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Aceita apenas GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query, per_page = 20, page = 1 } = req.query || {};

        if (!query) {
            return res.status(400).json({ error: 'Missing query parameter' });
        }

        console.log('[PEXELS-PROXY] Buscando:', query, `per_page:${per_page} page:${page}`);

        // Chave da API (somente via variável de ambiente)
        const apiKey = process.env.PEXELS_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'PEXELS_API_KEY não configurada'
            });
        }

        const pexelsResponse = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${per_page}&page=${page}`,
            {
                method: 'GET',
                headers: { 'Authorization': apiKey }
            }
        );

        const text = await pexelsResponse.text();

        if (!pexelsResponse.ok) {
            console.error('[PEXELS-PROXY] Erro API:', pexelsResponse.status, text);
            return res.status(pexelsResponse.status).json({
                error: `Pexels API error: ${pexelsResponse.statusText}`,
                details: text
            });
        }

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(text);

    } catch (error) {
        console.error('[PEXELS-PROXY] Erro interno:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
