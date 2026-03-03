export default async function handler(req, res) {
    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { text } = req.body;
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Texto é obrigatório' });
        }

        const apiKey = process.env.LHAMA_GROQ_API_PROXY;
        if (!apiKey) {
            console.error('[AI-DETECT] LHAMA_GROQ_API_PROXY não configurada');
            return res.status(500).json({ error: 'API Key não configurada no servidor' });
        }

        console.log('[AI-DETECT] Iniciando análise com Groq');

        // Prompt simples e direto para detecção de IA
        const systemPrompt = `Você é um detector de textos gerados por IA. Analise o texto e retorne APENAS um JSON VÁLIDO sem explicações:

{
  "percentage": <número 0-100>,
  "suspicious_phrases": ["frase1", "frase2", "frase3"],
  "characteristics": [
    {"trait": "trait1", "evidence": "evidence1"}
  ]
}`;

        const userPrompt = `Analise: ${text}`;

        console.log('[AI-DETECT] Payload:', { model: 'llama-3.1-70b-versatile', textLength: text.length });

        // Chamada para GROQ
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                temperature: 0.2,
                max_tokens: 500,
            })
        });

        const responseText = await groqResponse.text();
        console.log('[AI-DETECT] Status Groq:', groqResponse.status);

        if (!groqResponse.ok) {
            console.error('[AI-DETECT] Erro Groq:', responseText);
            return res.status(groqResponse.status).json({ 
                error: 'Erro ao chamar API Groq',
                details: responseText,
                status: groqResponse.status
            });
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('[AI-DETECT] Erro ao parsear resposta Groq:', responseText);
            return res.status(500).json({
                error: 'Erro ao processar resposta da API',
                details: responseText
            });
        }

        console.log('[AI-DETECT] Resposta Groq recebida');
        
        // Extrair a resposta
        const content = data.choices?.[0]?.message?.content?.trim();
        
        if (!content) {
            console.error('[AI-DETECT] Conteúdo vazio na resposta:', data);
            return res.status(500).json({
                error: 'Resposta vazia da API',
                details: JSON.stringify(data)
            });
        }

        // Tentar parsear o JSON da resposta
        let analysis;
        try {
            // Limpar possível markdown code block
            let jsonString = content;
            if (jsonString.includes('```json')) {
                jsonString = jsonString.split('```json')[1].split('```')[0];
            } else if (jsonString.includes('```')) {
                jsonString = jsonString.split('```')[1].split('```')[0];
            }
            
            analysis = JSON.parse(jsonString.trim());
            console.log('[AI-DETECT] JSON parseado com sucesso');
        } catch (parseError) {
            console.error('[AI-DETECT] Não foi JSON puro, tentando fallback:', content);
            
            // Fallback: extrair dados do texto
            const percentageMatch = content.match(/(\d+)\s*%/);
            analysis = {
                percentage: percentageMatch ? parseInt(percentageMatch[1]) : 50,
                suspicious_phrases: [],
                characteristics: [
                    {
                        trait: 'Análise',
                        evidence: content.substring(0, 200)
                    }
                ]
            };
        }

        // Validar dados
        analysis.percentage = Math.max(0, Math.min(100, analysis.percentage || 0));
        analysis.suspicious_phrases = Array.isArray(analysis.suspicious_phrases) 
            ? analysis.suspicious_phrases.slice(0, 5) 
            : [];
        analysis.characteristics = Array.isArray(analysis.characteristics) 
            ? analysis.characteristics.slice(0, 4) 
            : [];

        console.log('[AI-DETECT] Análise concluída:', { percentage: analysis.percentage });

        return res.status(200).json(analysis);

    } catch (error) {
        console.error('[AI-DETECT] Erro interno:', error.message, error.stack);
        return res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: error.message 
        });
    }
}
