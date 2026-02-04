export default async function handler(req, res) {
    console.log('[FLUX PROXY] Requisição recebida - Método:', req.method);
    
    // Aceita apenas POST
    if (req.method !== 'POST') {
        console.log('[FLUX PROXY] Método não permitido:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verificar se a chave API está configurada
        // const apiKey = process.env.OPENROUTER_API_KEY;
        // console.log('[FLUX PROXY] Verificando variável OPENROUTER_API_KEY...');
        
        // if (!apiKey) {
        //     console.error('[FLUX PROXY] OPENROUTER_API_KEY não configurada');
        //     return res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured on the server' });
        // }
        
        console.log('[FLUX PROXY] Iniciando requisição para Pollinations AI...');

        // Extrair dados da requisição
        const { prompt } = req.body || {};
        console.log('[FLUX PROXY] Prompt recebido:', prompt?.substring(0, 100) + '...');

        // Validar dados obrigatórios
        if (!prompt) {
            console.error('[FLUX PROXY] Prompt não fornecido');
            return res.status(400).json({ error: 'Missing prompt in request body' });
        }

        async function gerarImagemPollinations(prompt) {
            console.log('[POLLINATIONS] Gerando imagem com Pollinations AI:', prompt);

            try {
                // Construir URL da API Pollinations (não precisa de API key)
                const encodedPrompt = encodeURIComponent(prompt);
                const url = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
                console.log('[POLLINATIONS] URL da imagem:', url);

                // Fazer requisição para gerar imagem
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                console.log('[POLLINATIONS] Status da resposta:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('[POLLINATIONS] Erro na API:', response.status, errorText);
                    return res.status(response.status).json({ 
                        error: `Pollinations AI error: ${response.statusText}`,
                        details: errorText
                    });
                }

                // A resposta é a imagem diretamente - buscar como arraybuffer
                const imageBuffer = await response.arrayBuffer();
                const imageBase64 = Buffer.from(imageBuffer).toString('base64');
                const imageUrl = `data:image/png;base64,${imageBase64}`;
                console.log('[POLLINATIONS] Imagem gerada com sucesso!');

                // Retornar no formato esperado pelo frontend
                return res.status(200).json({
                    data: [{
                        url: imageUrl
                    }]
                });

            } catch (error) {
                console.error('[POLLINATIONS] Erro interno:', error);
                return res.status(500).json({ 
                    error: 'Internal server error',
                    details: error.message
                });
            }
        }

        // Chamar função de geração de imagem
        const result = await gerarImagemPollinations(prompt);
        return result;

    } catch (error) {
        console.error('[FLUX PROXY] Erro interno:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
}
