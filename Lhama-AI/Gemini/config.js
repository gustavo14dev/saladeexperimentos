
// Configuração da API Groq para Lhama AI 1
const LHAMA1_GROQ_CONFIG = {
    // API Key nunca vai para o frontend, sempre via proxy
    API_PROXY: '/api/groq-proxy-lhama1',
    MODEL: 'llama-3.1-8b-instant',
    REQUEST_CONFIG: {
        temperature: 0.7,
        max_tokens: 2048,
    },
    TIMEOUT: 30000,
};
