// Nova API Groq para Lhama AI 1
class Lhama1GroqAPI {
    constructor() {
        this.estaProcessando = false;
        this.historico = [];
    }

    async obterResposta(pergunta, historicoConversa = []) {
        if (this.estaProcessando) {
            return "⏳ Por favor, aguarde a resposta anterior...";
        }
        this.estaProcessando = true;
        try {
            // Montar histórico no formato OpenAI
            let messages = [];
            if (historicoConversa && historicoConversa.length > 0) {
                historicoConversa.forEach(msg => {
                    messages.push({
                        role: msg.tipo === 'usuario' ? 'user' : 'assistant',
                        content: msg.texto
                    });
                });
            }
            messages.push({ role: 'user', content: pergunta });

            const payload = {
                model: LHAMA1_GROQ_CONFIG.MODEL,
                messages,
                temperature: LHAMA1_GROQ_CONFIG.REQUEST_CONFIG.temperature,
                max_tokens: LHAMA1_GROQ_CONFIG.REQUEST_CONFIG.max_tokens || 2048
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), LHAMA1_GROQ_CONFIG.TIMEOUT);
            const resposta = await fetch(LHAMA1_GROQ_CONFIG.API_PROXY, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
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
            const dados = await resposta.json();
            if (!dados.choices || dados.choices.length === 0) {
                return "Desculpe, não consegui gerar uma resposta. Tente novamente.";
            }
            const conteudoResposta = dados.choices[0]?.message?.content;
            if (!conteudoResposta) {
                return "Desculpe, a resposta veio vazia. Tente novamente.";
            }
            this.historico.push({ tipo: 'usuario', texto: pergunta });
            this.historico.push({ tipo: 'bot', texto: conteudoResposta });
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
    estaDisponivel() {
        // Sempre disponível se proxy está configurado
        return true;
    }
}

// Instância global da nova API
window.lhama1API = new Lhama1GroqAPI();
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
                        text: `Você é a Lhama AI 1, uma assistente EXTREMAMENTE INTELIGENTE, criativa e MUITO ÚTIL.

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

=== GERAÇÃO DE IMAGENS ===
QUANDO gerar imagens:
• Usuário pede: "gere uma imagem", "desenha", "cria uma foto"
• DESCREVA EM DETALHES o que vai gerar ANTES

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
✓ E muito mais!

=== NUNCA FAÇA ===
✗ Respostas genéricas
✗ Respostas vagas
✗ Ignorar contexto anterior
✗ Fingir que não sabe

LEMBRE-SE: Você é EXTREMAMENTE INTELIGENTE, CRIATIVA e MUITO ÚTIL!`
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
        return true;
    }
}

// Instância global da API

