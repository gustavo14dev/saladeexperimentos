// Proxy para API da Pixels.com
// Este proxy busca imagens na API da Pixels.com de forma segura

export default async function handler(req, res) {
    // Configuração CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { query, per_page = 20, page = 1 } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Parâmetro "query" é obrigatório' });
        }

        // Obter API Key da variável de ambiente
        const apiKey = process.env.PIXELS_API_KEY;
        
        if (!apiKey) {
            console.error('[PIXELS] API Key não configurada');
            return res.status(500).json({ 
                error: 'API Key não configurada no servidor',
                message: 'Configure a variável de ambiente PIXELS_API_KEY na Vercel'
            });
        }

        console.log(`[PIXELS] Buscando imagens: "${query}" (página ${page}, ${per_page} resultados)`);

        // Fazer requisição para API da Pixels.com
        const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${per_page}&page=${page}`;
        
        const response = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json'
            }
        });

        console.log(`[PIXELS] Status da resposta: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[PIXELS] Erro na API: ${response.status} - ${errorText}`);
            
            if (response.status === 401) {
                return res.status(401).json({ 
                    error: 'API Key inválida',
                    message: 'Verifique sua API Key da Pixels.com'
                });
            } else if (response.status === 429) {
                return res.status(429).json({ 
                    error: 'Limite de requisições excedido',
                    message: 'Aguarde um momento e tente novamente'
                });
            } else if (response.status === 404) {
                return res.status(404).json({ 
                    error: 'Endpoint não encontrado',
                    message: 'Verifique a URL da API da Pixels.com'
                });
            } else {
                return res.status(response.status).json({ 
                    error: 'Erro na API da Pixels.com',
                    status: response.status,
                    message: errorText || response.statusText
                });
            }
        }

        const data = await response.json();
        console.log(`[PIXELS] Sucesso! Encontradas ${data.photos?.length || 0} imagens`);

        // Formatar resposta para o frontend
        const formattedData = {
            success: true,
            photos: data.photos?.map(photo => ({
                id: photo.id,
                url: photo.url,
                photographer: photo.photographer,
                photographer_url: photo.photographer_url,
                src: {
                    original: photo.src?.original,
                    large2x: photo.src?.large2x,
                    large: photo.src?.large,
                    medium: photo.src?.medium,
                    small: photo.src?.small,
                    portrait: photo.src?.portrait,
                    landscape: photo.src?.landscape,
                    tiny: photo.src?.tiny
                },
                alt: photo.alt || `Foto por ${photo.photographer}`,
                width: photo.width,
                height: photo.height,
                avg_color: photo.avg_color
            })) || [],
            total_results: data.total_results,
            page: data.page,
            per_page: data.per_page,
            next_page: data.next_page
        };

        return res.status(200).json(formattedData);

    } catch (error) {
        console.error('[PIXELS] Erro no proxy:', error);
        return res.status(500).json({ 
            error: 'Erro interno do servidor',
            message: error.message,
            details: 'Erro ao processar requisição para API da Pixels.com'
        });
    }
}
