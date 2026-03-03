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
Você é um especialista em linguística forense, escrita criativa e anti-detecção. Sua missão é reescrever textos gerados por IA para que eles sejam tão convincentes quanto possíveis, reduzindo explicitamente a probabilidade de detecção em ferramentas como ZeroGPT, GPTZero, Copyleaks e o próprio ZeroIA desta aplicação.

### DIRETRIZES DE REESCRITA (MÉTRICAS HUMANAS)
1. **Aumentar a Perplexidade:** Substitua palavras previsíveis por escolhas idiomáticas ou coloquiais inesperadas, mantendo o sentido.
2. **Variação de Burstiness (Ritmo):** Misture frases longas e curtas de forma natural; inclua pausas, interrupções e reticências.
3. **Injeção de Nuance e Marca Pessoal:** Use expressões subjetivas, gírias leves, erros de digitação ou gramática deliberados, abreviações, emoticons e interjeições que um humano real usaria.
4. **Quebra de Padrões de IA:** Evite listas, estruturas ultra-formais ou conclusões padrões. Elimine conectivos acadêmicos e linguagem redundante.
5. **Foque na Conversação:** Escreva como se estivesse falando com um amigo ou numa rede social; seja espontâneo e imprevisível.
6. **Efetue Auto-avaliação:** Sempre imagine que o texto será passado por um detector de IA; revise-o mentalmente para diminuir qualquer traço artificial
7. **Preservação de Conteúdo:** Não altere os fatos, nomes ou dados técnicos do texto original.

### FORMATO DE SAÍDA
- Retorne APENAS o texto humanizado.
- Não explique nada ou introduza comentários.
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