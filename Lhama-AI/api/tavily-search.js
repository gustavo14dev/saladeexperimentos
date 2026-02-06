/**
 * API Proxy para Tavily Search API
 * Para uso com Vercel Serverless Functions
 */

export default async function handler(req, res) {
    // Apenas permitir método POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        // Obter a chave da API das variáveis de ambiente
        const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
        
        if (!TAVILY_API_KEY) {
            console.error('[TAVILY] Chave da API não configurada');
            return res.status(500).json({ 
                error: 'Chave da API Tavily não configurada no servidor' 
            });
        }

        // Obter dados do corpo da requisição
        const { query, search_depth = 'basic', include_answer = true, include_raw_content = false, max_results = 5 } = req.body;

        if (!query) {
            return res.status(400).json({ 
                error: 'Query é obrigatório' 
            });
        }

        console.log('[TAVILY] Buscando:', query);

        // Fazer requisição para a API Tavily
        const tavilyResponse = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TAVILY_API_KEY}`
            },
            body: JSON.stringify({
                api_key: TAVILY_API_KEY,
                query: query,
                search_depth: search_depth,
                include_answer: include_answer,
                include_raw_content: include_raw_content,
                max_results: max_results,
                include_images: false,
                include_image_descriptions: false
            })
        });

        if (!tavilyResponse.ok) {
            const errorText = await tavilyResponse.text();
            console.error('[TAVILY] Erro na API:', tavilyResponse.status, errorText);
            
            if (tavilyResponse.status === 401) {
                return res.status(401).json({ 
                    error: 'Chave da API Tavily inválida' 
                });
            } else if (tavilyResponse.status === 429) {
                return res.status(429).json({ 
                    error: 'Muitas requisições. Tente novamente em alguns segundos.' 
                });
            } else if (tavilyResponse.status === 500) {
                return res.status(500).json({ 
                    error: 'Servidor Tavily indisponível. Tente novamente.' 
                });
            } else {
                return res.status(tavilyResponse.status).json({ 
                    error: `Erro na API Tavily: ${errorText || tavilyResponse.statusText}` 
                });
            }
        }

        // Extrair dados da resposta
        const data = await tavilyResponse.json();
        console.log('[TAVILY] Resposta recebida com sucesso');

        // Retornar os dados para o frontend
        return res.status(200).json(data);

    } catch (error) {
        console.error('[TAVILY] Erro no proxy:', error);
        
        if (error.name === 'AbortError') {
            return res.status(408).json({ 
                error: 'Timeout na requisição' 
            });
        }

        if (error instanceof TypeError) {
            return res.status(500).json({ 
                error: 'Erro de conexão com a API Tavily' 
            });
        }

        return res.status(500).json({ 
            error: 'Erro interno no servidor ao processar busca' 
        });
    }
}
