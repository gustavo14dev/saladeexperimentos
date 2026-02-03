export default async function handler(req, res) {
    console.log('[FLUX PROXY] Requisição recebida - Método:', req.method);
    
    // Aceita apenas POST
    if (req.method !== 'POST') {
        console.log('[FLUX PROXY] Método não permitido:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verificar se a chave API está configurada
        const apiKey = process.env.OPENROUTER_API_KEY;
        console.log('[FLUX PROXY] Verificando variável OPENROUTER_API_KEY...');
        
        if (!apiKey) {
            console.error('[FLUX PROXY] OPENROUTER_API_KEY não configurada');
            return res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured on the server' });
        }
        
        console.log('[FLUX PROXY] Chave API encontrada, iniciando requisição para OpenRouter...');

        // Extrair dados da requisição
        const { prompt } = req.body || {};
        console.log('[FLUX PROXY] Prompt recebido:', prompt?.substring(0, 100) + '...');

        // Validar dados obrigatórios
        if (!prompt) {
            console.error('[FLUX PROXY] Prompt não fornecido');
            return res.status(400).json({ error: 'Missing prompt in request body' });
        }

        // Construir URL da API OpenRouter para geração de imagens
        const url = 'https://openrouter.ai/api/v1/chat/completions';
        console.log('[FLUX PROXY] URL da API OpenRouter:', url);

        // Preparar payload para a API OpenRouter com modelo FLUX válido
        const fluxPayload = {
            model: "black-forest-labs/flux-1.1-pro",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: {
                type: "image_url",
                image_url: {
                    detail: "auto"
                }
            },
            max_tokens: 1000
        };

        console.log('[FLUX PROXY] Enviando requisição para FLUX 1.1 Pro...');

        // Fazer requisição para a API OpenRouter
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout para imagem

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://saladeexperimentos.vercel.app',
                'X-Title': 'Lhama AI 1'
            },
            body: JSON.stringify(fluxPayload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('[FLUX PROXY] Resposta da API OpenRouter - Status:', response.status);

        // Verificar se a resposta foi bem-sucedida
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[FLUX PROXY] Erro na API OpenRouter:', response.status, errorText);
            
            return res.status(response.status).json({ 
                error: `OpenRouter API error: ${response.statusText}`,
                details: errorText
            });
        }

        // Extrair e retornar os dados
        const data = await response.json();
        console.log('[FLUX PROXY] Resposta recebida da OpenRouter:', JSON.stringify(data, null, 2));
        
        // Verificar se temos uma resposta válida
        if (data.choices && data.choices.length > 0) {
            const choice = data.choices[0];
            
            // Verificar se o conteúdo da mensagem contém uma imagem
            if (choice.message && choice.message.content) {
                console.log('[FLUX PROXY] Imagem gerada com sucesso via chat completion!');
                
                // Procurar por URL de imagem no conteúdo
                const imageMatch = choice.message.content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i);
                if (imageMatch) {
                    // Retornar no formato esperado pelo frontend
                    return res.status(200).json({
                        data: [{
                            url: imageMatch[0]
                        }]
                    });
                }
            }
        }
        
        console.error('[FLUX PROXY] Formato de resposta inesperado:', data);
        return res.status(500).json({ 
            error: 'Unexpected response format from OpenRouter',
            details: 'No image URL found in response'
        });

    } catch (error) {
        console.error('[FLUX PROXY] Erro interno:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
}
