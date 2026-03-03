export default async function handler(req, res) {
    // permissive CORS
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
            console.error('[HUMANIZE] chave não configurada');
            return res.status(500).json({ error: 'Chave API não configurada' });
        }

        // system prompt described by user
        const systemPrompt = `Atue como um redator experiente. Reescreva o texto abaixo para torná-lo mais natural, fluido e humano. Use frases de tamanhos variados para criar ritmo (técnica de burstiness). Evite palavras excessivamente formais ou clichês de IA (como 'mergulhar', 'em constante evolução', 'desbloquear'). O tom deve ser amigável e informativo, como uma conversa entre duas pessoas que se respeitam. Mantenha a clareza, mas adicione personalidade.

    Não assuma que formalidade seja sinal de IA nem que gírias garantam escrita humana; varie o estilo conforme o contexto.

    ### FORMATO DE SAÍDA
    - Retorne APENAS o texto reescrito.
    - Preserve parágrafos e pontuação do original.`;

        const userPrompt = text;

        // send request
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 1500,
            })
        });

        const textBody = await response.text();
        if (!response.ok) {
            console.error('[HUMANIZE] erro groq:', textBody);
            return res.status(response.status).json({ error: 'Erro na API Groq', details: textBody });
        }

        // parse returned message
        let data;
        try {
            data = JSON.parse(textBody);
        } catch (e) {
            // maybe textBody already text
            data = { choices: [{ message: { content: textBody } }] };
        }

        const output = data.choices?.[0]?.message?.content || textBody;
        return res.status(200).json({ humanized: output.trim() });

    } catch (err) {
        console.error('[HUMANIZE] erro interno', err);
        return res.status(500).json({ error: 'Erro interno', details: err.message });
    }
}