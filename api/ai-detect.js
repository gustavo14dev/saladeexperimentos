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

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GROQ_API_KEY não configurada' });
        }

        // Chamada para GROQ com prompt especializado em detecção de IA
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'mixtral-8x7b-32768',
                messages: [
                    {
                        role: 'system',
                        content: `Você é um especialista em detecção de textos gerados por IA. Analise o texto fornecido e determine:
1. A probabilidade percentual de o texto ter sido gerado por IA (0-100%)
2. Os trechos mais suspeitos que indicam possível geração por IA
3. Características observadas (estrutura, vocabulário, padrões que indicam IA)

Retorne APENAS um JSON válido, sem explicações adicionais, neste formato exato:
{
  "percentage": <número entre 0 e 100>,
  "suspicious_phrases": ["frase1", "frase2", "frase3"],
  "characteristics": [
    {"trait": "característica1", "evidence": "evidência1"},
    {"trait": "característica2", "evidence": "evidência2"}
  ]
}`
                    },
                    {
                        role: 'user',
                        content: `Analise este texto:\n\n"${text}"`
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000,
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('[AI-DETECT] Erro GROQ:', error);
            return res.status(500).json({ error: 'Erro ao chamar API GROQ' });
        }

        const data = await response.json();
        
        // Extrair a resposta
        const content = data.choices[0].message.content.trim();
        
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
        } catch (parseError) {
            console.error('[AI-DETECT] Erro ao parsear resposta:', content);
            // Fallback: retornar resposta como texto
            analysis = {
                percentage: 50,
                suspicious_phrases: [],
                characteristics: [],
                raw_analysis: content
            };
        }

        // Validar dados
        analysis.percentage = Math.max(0, Math.min(100, analysis.percentage || 0));
        analysis.suspicious_phrases = analysis.suspicious_phrases || [];
        analysis.characteristics = analysis.characteristics || [];

        return res.status(200).json(analysis);

    } catch (error) {
        console.error('[AI-DETECT] Erro interno:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
