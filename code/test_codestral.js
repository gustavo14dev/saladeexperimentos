// test_codestral.js
// Roda: node test_codestral.js <YOUR_API_KEY>
// Ou: set env GROQ_API_KEY and rodar: node test_codestral.js

const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function run() {
  const apiKey = process.argv[2] || process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('Uso: node test_codestral.js <SUA_API_KEY>  (ou export GROQ_API_KEY)');
    process.exit(1);
  }

  const body = {
    model: 'codestral-latest',
    messages: [
      { role: 'system', content: 'Você é o Lhama Code 1, um assistente de código inteligente. Seja claro e sucinto.' },
      { role: 'system', content: '---FILE: exemplo.txt---\nLinha 1 do arquivo de teste\nLinha 2 do arquivo de teste\n---END FILE---' },
      { role: 'user', content: 'Por favor, revise o arquivo anexado e me diga se há problemas de sintaxe ou sugestões de melhoria.' }
    ],
    temperature: 0.7,
    max_tokens: 1500
  };

  console.log('Enviando requisição para', API_URL);

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Erro HTTP', res.status, errText);
      process.exit(1);
    }

    const data = await res.json();
    console.log('\nResposta (parcial):\n');
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log(data.choices[0].message.content);
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Erro ao chamar API:', err);
    process.exit(1);
  }
}

run();
