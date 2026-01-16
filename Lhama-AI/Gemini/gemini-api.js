/**
 * Handler da API Gemini
 * Gerencia chamadas à API do Gemini com tratamento de erros e requisições
 */

class GeminiAPI {
    constructor() {
        this.estaProcessando = false;
        this.ultimaRequisicao = null;
        this.historico = [];  // Mantém histórico de conversa
    }

    /**
     * Faz uma requisição à API Gemini
     * @param {string} pergunta - A pergunta do usuário
     * @param {Array} historicoConversa - Histórico de conversa anterior
     * @returns {Promise<string>} - A resposta da IA
     */
    async obterResposta(pergunta, historicoConversa = []) {
        // Validar se há chave API disponível
        if (!temChaveAPI()) {
            return "⚠️ Desculpe, a integração com API está configurada. Por favor, contacte o administrador.";
        }

        // Evitar requisições simultâneas
        if (this.estaProcessando) {
            return "⏳ Por favor, aguarde a resposta anterior...";
        }

        this.estaProcessando = true;

        try {
            const chave = GEMINI_CONFIG.API_KEY();
            const url = construirURLAPI(chave);

            // Preparar histórico para context
            let conteudo = [];

            // Se há histórico, adicionar como contexto
            if (historicoConversa && historicoConversa.length > 0) {
                historicoConversa.forEach(msg => {
                    conteudo.push({
                        role: msg.tipo === 'usuario' ? 'user' : 'model',
                        parts: [{ text: msg.texto }]
                    });
                });
            }

            // Adicionar pergunta atual
            conteudo.push({
                role: 'user',
                parts: [{ text: pergunta }]
            });

            // Preparar o payload com system prompt em português
            const payload = {
                systemInstruction: {
                    parts: [{
                        text: `Você é a Lhama AI 1, uma assistente de IA amigável e inteligente. 
                    
INSTRUÇÕES IMPORTANTES:
1. Sempre responda em PORTUGUÊS BRASILEIRO, a menos que o usuário peça explicitamente outra língua
2. Respostas devem ser completas, sem truncar
3. Você pode usar: negrito, itálico, listas, tabelas, formatação Markdown
4. Seja amigável, educado e sempre ajude
5. Se não souber algo, seja honesto
6. Mantenha consistência nas respostas anteriores nesta conversa
7. Se pedir imagem, você pode gerar (mas isso é tratado no frontend)
8. Responda de forma natural e conversacional`
                    }]
                },
                contents: conteudo,
                generationConfig: {
                    temperature: GEMINI_CONFIG.REQUEST_CONFIG.temperature,
                    topK: GEMINI_CONFIG.REQUEST_CONFIG.topK,
                    topP: GEMINI_CONFIG.REQUEST_CONFIG.topP,
                    maxOutputTokens: GEMINI_CONFIG.REQUEST_CONFIG.maxOutputTokens,
                }
            };

            // Criar AbortController para timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), GEMINI_CONFIG.TIMEOUT);

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
                const erro = await resposta.json().catch(() => ({}));
                
                if (resposta.status === 401) {
                    return "🔐 Chave API inválida ou expirada.";
                } else if (resposta.status === 403) {
                    return "❌ Sem permissão para usar a API. Verifique a chave.";
                } else if (resposta.status === 429) {
                    return "⏱️ Muitas requisições. Tente novamente em alguns segundos.";
                } else if (resposta.status === 500) {
                    return "🔧 Servidor da API indisponível. Tente novamente.";
                } else {
                    return `Erro na API: ${erro.error?.message || resposta.statusText}`;
                }
            }

            // Extrair resposta
            const dados = await resposta.json();
            
            // Validar estrutura da resposta
            if (!dados.candidates || dados.candidates.length === 0) {
                return "Desculpe, não consegui gerar uma resposta. Tente novamente.";
            }

            const conteudoResposta = dados.candidates[0]?.content?.parts?.[0]?.text;
            
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
            console.error('Erro ao chamar API Gemini:', erro);

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
        return temChaveAPI();
    }
}

// Instância global da API
const geminiAPI = new GeminiAPI();
