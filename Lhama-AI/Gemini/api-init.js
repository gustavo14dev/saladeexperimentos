/**
 * Middleware para injetar a chave API do Vercel no frontend
 * 
 * Em produção no Vercel: A chave vem como variável de ambiente
 * Localmente: Use sessionStorage ou variável global
 * 
 * NUNCA coloque a chave diretamente neste arquivo!
 */

// Inicializa a chave assim que a página carregar
document.addEventListener('DOMContentLoaded', async () => {
    // Tenta obter a chave de diferentes fontes
    let chaveAPI = null;

    // 1. Tenta de variável global do window (para injeção manual)
    function maskKey(k) {
        if (!k) return '';
        return k.length > 10 ? `${k.slice(0,6)}...${k.slice(-4)}` : k;
    }

    if (typeof window !== 'undefined' && window.GEMINI_API_KEY) {
        chaveAPI = window.GEMINI_API_KEY;
        console.log(`✓ Chave API encontrada em window.GEMINI_API_KEY (masked: ${maskKey(window.GEMINI_API_KEY)})`);
    }

    // Detectar outras chaves públicas (opcional)
    if (typeof window !== 'undefined' && window.MISTRAL_API_KEY) {
        sessionStorage.setItem('MISTRAL_API_KEY', window.MISTRAL_API_KEY);
        console.log(`✓ MISTRAL API key encontrada em window.MISTRAL_API_KEY (masked: ${maskKey(window.MISTRAL_API_KEY)})`);
    }

    if (typeof window !== 'undefined' && window.GROQ_API_KEY) {
        sessionStorage.setItem('GROQ_API_KEY', window.GROQ_API_KEY);
        console.log(`✓ GROQ API key encontrada em window.GROQ_API_KEY (masked: ${maskKey(window.GROQ_API_KEY)})`);
    }

    // 2. Tenta de sessionStorage (para testes locais)
    if (!chaveAPI && sessionStorage.getItem('GEMINI_API_KEY')) {
        chaveAPI = sessionStorage.getItem('GEMINI_API_KEY');
        console.log('✓ Chave API encontrada em sessionStorage');
    }
    // 3. Tenta de localStorage (persistente)
    else if (!chaveAPI && localStorage.getItem('GEMINI_API_KEY')) {
        chaveAPI = localStorage.getItem('GEMINI_API_KEY');
        console.log('✓ Chave API encontrada em localStorage');
    }
    // 4. Tenta buscar da API Vercel Function (Produção no Vercel)
    else if (!chaveAPI) {
        try {
            const resposta = await fetch('/api/config');
            if (resposta.ok) {
                const config = await resposta.json();
                if (config.GEMINI_API_KEY) {
                    chaveAPI = config.GEMINI_API_KEY;
                    console.log(`✓ Chave API obtida da Vercel Function (hasKey: ${!!config.GEMINI_API_KEY}, timestamp: ${config.timestamp})`);
                } else if (config.hasKey) {
                    console.warn('⚠️ /api/config indica que há chave no servidor, mas não retornou o valor (recommended).');
                }
            }
        } catch (e) {
            // Falha ao buscar, continua
            console.log('ℹ️ Vercel Function não disponível (esperado em localhost)');
        }
    }

    // Se encontrou a chave, armazena em sessionStorage para acesso
    if (chaveAPI) {
        sessionStorage.setItem('GEMINI_API_KEY', chaveAPI);
        console.log('✓ Sistema de API pronto para usar');
    } else {
        console.warn('⚠️ Chave API não encontrada. A API do Gemini não funcionará sem ela.');
        console.warn('Para testes locais, execute no console: sessionStorage.setItem("GEMINI_API_KEY", "sua-chave-aqui")');
        console.warn('Para produção no Vercel, certifique-se de que /api/config.js está presente e GEMINI_API_KEY está em Environment Variables');
    }
});

/**
 * Função auxiliar para definir chave manualmente (para testes)
 * Use no console do navegador assim: definirChaveAPI('sua-chave-aqui')
 */
function definirChaveAPI(chave) {
    if (!chave || chave.trim().length === 0) {
        console.error('❌ Chave vazia');
        return false;
    }
    
    sessionStorage.setItem('GEMINI_API_KEY', chave);
    console.log('✓ Chave definida com sucesso! Você já pode usar a API do Gemini.');
    return true;
}

/**
 * Verifica se há chave definida
 */
function temChaveDefinida() {
    const chave = sessionStorage.getItem('GEMINI_API_KEY');
    return chave && chave.trim().length > 0;
}

/**
 * Limpar chave (para logout/segurança)
 */
function limparChaveAPI() {
    sessionStorage.removeItem('GEMINI_API_KEY');
    console.log('✓ Chave API removida');
}
