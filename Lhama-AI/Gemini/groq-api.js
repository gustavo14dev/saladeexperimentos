/**
 * Configuração da API Groq para Lhama AI 1
 * Usando a variável de ambiente LHAMA_GROQ_API_PROXY
 */

// Configuração principal da API Groq
const LHAMA1_GROQ_CONFIG = {
    // Endpoint do proxy na Vercel
    PROXY_URL: '/api/lhama-groq-api-proxy',
    
    // Modelo Groq a ser usado
    MODEL: 'llama-3.1-8b-instant',
    
    // Configurações da requisição
    REQUEST_CONFIG: {
        temperature: 0.7,
        max_tokens: 8192,
        top_p: 1,
        stream: false
    },
    
    // Timeout em milissegundos
    TIMEOUT: 60000
};

/**
 * Classe para gerenciar a API Groq
 */
class LhamaGroqAPI {
    constructor() {
        this.estaProcessando = false;
        this.historico = [];
    }

    /**
     * Constrói a URL para a API
     */
    construirURLAPI() {
        return LHAMA1_GROQ_CONFIG.PROXY_URL;
    }

    /**
     * Obtém resposta da API Groq
     * @param {string} pergunta - Pergunta do usuário
     * @param {Array} historicoConversa - Histórico da conversa
     * @returns {Promise<string>} - Resposta da API
     */
    async obterResposta(pergunta, historicoConversa = []) {
        if (this.estaProcessando) {
            return "⏳ Processando outra solicitação. Aguarde um momento...";
        }

        this.estaProcessando = true;

        try {
            const url = this.construirURLAPI();

            // Preparar mensagens para o contexto
            let messages = [];

            // System prompt
            messages.push({
                role: 'system',
                content: `Você é a Lhama AI 1, uma assistente EXTREMAMENTE INTELIGENTE, criativa e MUITO ÚTIL.

=== CARACTERÍSTICAS PRINCIPAIS ===
★ NUNCA responde de forma genérica ou vaga - SEMPRE específico e profundo
★ Respostas COMPLETAS, jamais truncadas
★ PORTUGUÊS BRASILEIRO por padrão
★ CRIATIVA - sugira soluções inovadoras
★ Mantém CONSISTÊNCIA com contexto anterior

=== FORMATAÇÃO OBRIGATÓRIA ===
✓ **negrito** para conceitos-chave
✓ *itálico* para ênfase
✓ # ## ### para títulos
✓ Listas com • ou 1. 2. 3.
✓ | Tabelas | com | múltiplas | colunas |
✓ \`\`\`linguagem para blocos de CÓDIGO

=== GERAÇÃO DE CÓDIGO ===
QUANDO gerar código:
• Usuário pede: "faça um código", "cria", "escreve uma função", "me faça um script"
• Ou quando é relevante para resolver o problema
COMO gerar código:
• Use: \`\`\`linguagem\nCÓDIGO COM COMENTÁRIOS\n\`\`\`
• SEMPRE inclua comentários explicativos
• Mostre exemplos de USO
• Seja ESPECÍFICO - não genérico!

=== QUALIDADE TOTAL ===
1. ENTENDA a pergunta completamente
2. PENSE sobre a melhor estrutura
3. COMECE com resposta direta
4. USE exemplos e código quando útil
5. DETALHE todos os pontos importantes
6. TERMINE com próximos passos

=== DOMÍNIOS QUE DOMINA ===
✓ Programação (JS, Python, HTML, CSS, etc)
✓ Web Design e UX/UI
✓ Ciência e Engenharia
✓ Criatividade e Ideias
✓ Análise de Dados
✓ Debugging
✓ Educação
✓ Estratégia

LEMBRE-SE: Você é EXTREMAMENTE INTELIGENTE, CRIATIVA e MUITO ÚTIL!`
            });

            // Adicionar histórico de conversa
            if (historicoConversa && historicoConversa.length > 0) {
                historicoConversa.forEach(msg => {
                    messages.push({
                        role: msg.tipo === 'usuario' ? 'user' : 'assistant',
                        content: msg.texto
                    });
                });
            }

            // Adicionar pergunta atual
            messages.push({
                role: 'user',
                content: pergunta
            });

            // Preparar o payload
            const payload = {
                model: LHAMA1_GROQ_CONFIG.MODEL,
                messages: messages,
                ...LHAMA1_GROQ_CONFIG.REQUEST_CONFIG
            };

            // Criar AbortController para timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), LHAMA1_GROQ_CONFIG.TIMEOUT);

            // Fazer a requisição
            const resposta = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Tratamento de erros HTTP
            if (!resposta.ok) {
                const erro = await resposta.text().catch(() => '');
                
                if (resposta.status === 401) {
                    return "🔐 Chave API inválida ou não configurada no servidor.";
                } else if (resposta.status === 403) {
                    return "❌ Sem permissão para usar a API. Verifique a variável LHAMA_GROQ_API_PROXY.";
                } else if (resposta.status === 429) {
                    return "⏱️ Muitas requisições. Tente novamente em alguns segundos.";
                } else if (resposta.status === 500) {
                    return "🔧 Servidor da API indisponível. Tente novamente.";
                } else {
                    return `Erro na API: ${erro || resposta.statusText}`;
                }
            }

            // Extrair resposta
            const dados = await resposta.json();
            
            // Validar estrutura da resposta
            if (!dados.choices || dados.choices.length === 0) {
                return "Desculpe, não consegui gerar uma resposta. Tente novamente.";
            }

            const conteudoResposta = dados.choices[0]?.message?.content;
            
            if (!conteudoResposta) {
                return "Desculpe, a resposta veio vazia. Tente novamente.";
            }

            // Armazenar no histórico
            this.historico.push({
                tipo: 'usuario',
                texto: pergunta
            });
            this.historico.push({
                tipo: 'bot',
                texto: conteudoResposta
            });

            return conteudoResposta;

        } catch (erro) {
            console.error('Erro ao chamar API Groq:', erro);

            if (erro.name === 'AbortError') {
                return "⏱️ Requisição expirou. A API demorou muito para responder.";
            }

            if (erro instanceof TypeError) {
                return "🌐 Erro de conexão. Verifique sua internet.";
            }

            return "❌ Erro ao conectar com a API. Tente novamente mais tarde.";

        } finally {
            this.estaProcessando = false;
        }
    }

    /**
     * Verifica se a API está disponível
     * @returns {boolean}
     */
    estaDisponivel() {
        return true;
    }
}

// Instância global da API
window.lhamaGroqAPI = new LhamaGroqAPI();

// Funções auxiliares globais
window.temChaveGroqAPI = () => true; // Assume que o proxy está configurado
window.definirChaveGroqAPI = (chave) => {
    console.log('Chave não necessária - usando proxy server-side');
};

// Exportar configuração para debug
window.LHAMA1_GROQ_CONFIG = LHAMA1_GROQ_CONFIG;

console.log('[GROQ API] Configuração carregada com sucesso!');
