// test_mistral_codestral.js
// Uso: node code/test_mistral_codestral.js SUA_CHAVE_MISTRAL
// Docs: https://docs.mistral.ai/api/

const API_URL = 'https://api.mistral.ai/v1/chat/completions';

async function run() {
  const apiKey = process.argv[2] || process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.error('Uso: node code/test_mistral_codestral.js SUA_CHAVE_MISTRAL');
    process.exit(1);
  }

  const fileContent = 'def soma(a, b):\n    return a + b\n';
  const body = {
    model: 'codestral-latest',
    messages: [
      { role: 'system', content: 'Você é um assistente de código. Analise o arquivo fornecido.' },
      { role: 'system', content: '---FILE: exemplo.py---\n' + fileContent + '\n---END FILE---' },
      { role: 'user', content: 'Revise o arquivo anexado e sugira melhorias.' }
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
