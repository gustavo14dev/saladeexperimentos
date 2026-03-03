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
        const systemPrompt = `### ROLE
Você é um especialista em linguística forense e escrita criativa de alto nível. Sua missão é reescrever textos gerados por IA para que eles se tornem indistinguíveis de um texto escrito por um humano (adulto ou criança, dependendo do contexto), garantindo que passem em detectores como ZeroGPT, GPTZero e Copyleaks.

### DIRETRIZES DE REESCRITA (MÉTRICAS HUMANAS)
1. **Aumentar a Perplexidade:** Substitua palavras excessivamente previsíveis por sinônimos menos óbvios, mas que mantenham o sentido natural.
2. **Variação de Burstiness (Ritmo):** Alterne drasticamente o comprimento das frases. Use uma frase curta e impactante após uma frase longa e explicativa.
3. **Injeção de Nuance:** Adicione advérbios de dúvida (talvez, eu diria, ao meu ver) ou expressões coloquiais leves que IAs raramente usam.
4. **Remoção de Padrões de IA:** Elimine listas excessivamente organizadas, conclusões clichês (como "Em suma" ou "Em resumo") e conectivos robóticos (como "Além disso", "Adicionalmente").
5. **Preservação de Conteúdo:** Não altere os fatos, nomes ou dados técnicos do texto original.

### FORMATO DE SAÍDA
- Retorne APENAS o texto humanizado. 
- Não adicione introduções como "Aqui está o seu texto" ou explicações.
- Mantenha a formatação original (parágrafos).`;

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
                temperature: 0.3,
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