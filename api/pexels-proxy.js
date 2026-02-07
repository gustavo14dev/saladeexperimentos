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

        const apiKey = process.env.PEXELS_API_KEY;
        if (apiKey) {
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
        }

        const limit = Math.min(Number(per_page) || 20, 50);
        const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;

        const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=${limit}&gsroffset=${offset}&gsrnamespace=6&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1200`;
        const commonsResponse = await fetch(commonsUrl);

        if (!commonsResponse.ok) {
            const raw = await commonsResponse.text();
            return res.status(commonsResponse.status).json({
                error: `Wikimedia API error: ${commonsResponse.statusText}`,
                details: raw
            });
        }

        const commonsData = await commonsResponse.json();
        const pages = commonsData?.query?.pages ? Object.values(commonsData.query.pages) : [];

        const photos = pages
            .map((p) => {
                const info = Array.isArray(p?.imageinfo) ? p.imageinfo[0] : null;
                if (!info) return null;

                const src = {
                    large: info.thumburl || info.url,
                    original: info.url
                };

                const alt = (p?.title || '').replace(/^File:/, '');

                let photographer = 'Wikimedia Commons';
                const artist = info?.extmetadata?.Artist?.value;
                if (artist) {
                    photographer = String(artist).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || photographer;
                }

                return {
                    id: p?.pageid,
                    width: info?.width,
                    height: info?.height,
                    url: info?.descriptionurl || info?.url,
                    photographer,
                    alt,
                    src
                };
            })
            .filter(Boolean);

        return res.status(200).json({
            page: Number(page) || 1,
            per_page: limit,
            photos
        });

    } catch (error) {
        console.error('[PEXELS-PROXY] Erro interno:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
