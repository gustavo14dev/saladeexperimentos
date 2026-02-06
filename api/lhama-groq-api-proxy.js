export default async function handler(req, res) {
    console.log('[PROXY] Requisição recebida - Método:', req.method);
    
    // Aceita apenas POST
    if (req.method !== 'POST') {
        console.log('[PROXY] Método não permitido:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verificar se é modo Tavily Search
        const { mode } = req.body || {};
        
        if (mode === 'tavily_search') {
            return handleTavilySearch(req, res);
        }

        // Fluxo normal: Groq API
        return handleGroqRequest(req, res);

    } catch (error) {
        console.error('[PROXY] Erro interno:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
}

async function handleTavilySearch(req, res) {
    console.log('[TAVILY] Processando busca Tavily');
    
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'TAVILY_API_KEY is not configured on the server' });
    }

    const { query, search_depth = 'basic', include_answer = true, include_raw_content = false, max_results = 5 } = req.body || {};

    if (!query) {
        return res.status(400).json({ error: 'Missing query in request body' });
    }

    try {
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

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(text);

    } catch (error) {
        console.error('[TAVILY] Erro:', error);
        return res.status(500).json({ error: 'Tavily search failed', details: error.message });
    }
}

async function handleGroqRequest(req, res) {
    console.log('[PROXY] Processando requisição Groq');
    
    // Verificar se a chave API está configurada
    const apiKey = process.env.LHAMA_GROQ_API_PROXY;
    console.log('[PROXY] Verificando variável LHAMA_GROQ_API_PROXY...');
    
    if (!apiKey) {
        console.error('[PROXY] LHAMA_GROQ_API_PROXY não configurada');
        return res.status(500).json({ error: 'LHAMA_GROQ_API_PROXY is not configured on the server' });
    }
    
    console.log('[PROXY] Chave API encontrada, iniciando requisição para Groq...');

    // Extrair dados da requisição
    const { model, messages, temperature = 0.7, max_tokens = 8192, top_p = 1, stream = false } = req.body || {};
    console.log('[PROXY] Payload recebido:', { model, messages: messages?.length, temperature, max_tokens });

    // Validar dados obrigatórios
    if (!model || !messages) {
        console.error('[PROXY] Payload inválido:', { model, messages });
        return res.status(400).json({ error: 'Missing model or messages in request body' });
    }

    // Construir URL da API Groq
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    console.log('[PROXY] URL da API Groq:', url);

    // Preparar payload para a API Groq
    const groqPayload = {
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens,
        top_p: top_p,
        stream: stream
    };

    console.log('[PROXY] Enviando requisição para API Groq...');

    // Fazer requisição para a API Groq
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(groqPayload),
        signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('[PROXY] Resposta da API Groq - Status:', response.status);

    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
        const errorText = await response.text();
        console.error('[PROXY] Erro na API Groq:', response.status, errorText);
        
        return res.status(response.status).json({ 
            error: `Groq API error: ${response.statusText}`,
            details: errorText
        });
    }

    // Extrair e retornar os dados
    const text = await response.text();
    console.log('[PROXY] Resposta da API Groq recebida com sucesso');
    
    // Log para diagnóstico (sem expor a chave)
    console.log('[LHAMA GROQ PROXY] Status:', response.status, 'Model:', model);
    
    // Repasse direto do corpo da resposta
    return res.status(response.status).send(text);
}
