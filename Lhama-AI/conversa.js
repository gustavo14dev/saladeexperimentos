let treinamentos = [];
let historicoConversa = [];
let redacoesData = [];
let correcoesData = [];
let bancoImagens = {}; // Inicializada como objeto vazio para ser carregada via fetch.

// Modos de funcionalidade
let modoImagemAtivo = false;
let modoRedacaoAtivo = false;
let modoResumoAtivo = false;
let modoCorrecaoAtivo = false;
// Estados do Image 2
let modoImage2Ativo = false;
let modoImage2DesativadoManualmente = false;
let modoImage2Tipo = null; // 'simples' ou 'pessoa'
let modoImage2AtivadoManualmente = false;

// Debug: Verificar se a API Groq está disponível
console.log('[CONVERSA] Inicializando conversa.js...');
console.log('[CONVERSA] Modo imagem:', modoImagemAtivo);

// Aguardar um pouco para garantir que a API foi carregada
setTimeout(() => {
    console.log('[CONVERSA] Verificação tardia - window.lhamaGroqAPI:', !!window.lhamaGroqAPI);
    if (window.lhamaGroqAPI) {
        console.log('[CONVERSA] API está disponível:', window.lhamaGroqAPI.estaDisponivel());
    }
}, 100);

// ===== SISTEMA DE SCROLL INTELIGENTE =====
let isUserScrolling = false;
let _scrollTimeout = null;
const SCROLL_DISTANCE_THRESHOLD = 300; // px - quando exceder, mostra botão

function initScrollSystem() {
    const container = document.getElementById('chat-box-container');
    const btn = document.getElementById('scrollToBottomBtn');
    if (!container) return;

    container.addEventListener('scroll', () => {
        isUserScrolling = true;
        checkScrollButtonVisibility();
        if (_scrollTimeout) clearTimeout(_scrollTimeout);
        _scrollTimeout = setTimeout(() => {
            isUserScrolling = false;
            checkScrollButtonVisibility();
        }, 1500);
    });

    if (btn) {
        btn.addEventListener('click', () => {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            btn.style.display = 'none';
            isUserScrolling = false;
            setTimeout(() => checkScrollButtonVisibility(), 300);
        });
    }
}

// Inicializar sistema de scroll ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    try { initScrollSystem(); } catch (e) { /* ignore */ }
    // Checar visibilidade do botão uma vez após carregamento
    setTimeout(() => { try { checkScrollButtonVisibility(); } catch(e){} }, 300);
});

function checkScrollButtonVisibility() {
    const container = document.getElementById('chat-box-container');
    const btn = document.getElementById('scrollToBottomBtn');
    if (!container || !btn) return;
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distance > SCROLL_DISTANCE_THRESHOLD) {
        btn.style.display = 'flex';
    } else {
        btn.style.display = 'none';
    }
}

// ===== ANÚNCIO =====
function mostrarAnuncio() {
    const overlay = document.createElement('div');
    overlay.id = 'anuncio-overlay';
    overlay.className = 'anuncio-overlay';
    overlay.innerHTML = `
        <div class="anuncio-container">
            <div class="titulo-com-badge">
                <h2 class="titulo-animado">Lhama AI 1</h2>
            </div>
            <div class="anuncio-texto">
                <ul>
                    <li>Mais inteligente</li>
                    <li>30.000 novos treinamentos</li>
                    <li>Design premium e mais suave</li>
                    <li>Interface aprimorada estilo moderno</li>
                    <li>Correção de erros de resposta</li>
                    <li>Image 2, o novo recurso de geração de imagens aprimorado</li>
                    <li>Ficando cada vez mais profissional</li>
                </ul>
            </div>
            <div class="anuncio-botoes">
                <button onclick="fecharAnuncio()">Fechar</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function fecharAnuncio() {
    const overlay = document.getElementById('anuncio-overlay');
    if (overlay) overlay.remove();
}

// ===== MENU MOBILE =====
function toggleToolsMenu() {
    const dropdown = document.getElementById('tools-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('tools-dropdown');
    const trigger = document.getElementById('menu-trigger');
    if (dropdown && trigger && !dropdown.contains(e.target) && !trigger.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});
function closeToolsMenuMobile() {
    const dropdown = document.getElementById('tools-dropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
}

// ===== FUNÇÕES DE IMAGEM =====
function alternarModoImagem() {
    const btnImagem = document.getElementById('btn-imagem');
    const input = document.getElementById('input-mensagem');
    
    if (modoImagemAtivo) {
        modoImagemAtivo = false;
        if (btnImagem) btnImagem.classList.remove('active');
        input.placeholder = 'Olá! Pergunte-me qualquer coisa...';
    } else {
        modoImagemAtivo = true;
        if (btnImagem) btnImagem.classList.add('active');
        input.placeholder = 'Descreva a imagem que você quer gerar...';
        input.value = '';
        input.focus();
    }
}

async function gerarImagem(prompt) {
    console.log('[IMAGEM] Gerando imagem com FLUX 2 FLEX:', prompt);
    
    try {
        const response = await fetch('/api/flux-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt
            })
        });

        console.log('[IMAGEM] Resposta do proxy FLUX:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[IMAGEM] Erro na API FLUX:', response.status, errorText);
            
            if (response.status === 401) {
                return "🔐 Chave API FLUX não configurada. Verifique a variável OPENROUTER_API_KEY na Vercel.";
            } else if (response.status === 429) {
                return "⏱️ Muitas requisições. Tente novamente em alguns segundos.";
            } else if (response.status === 500) {
                return "🔧 Servidor FLUX indisponível. Tente novamente.";
            } else {
                return `Erro na API FLUX: ${errorText || response.statusText}`;
            }
        }

        const data = await response.json();
        console.log('[IMAGEM] Dados recebidos:', data);
        
        if (data.data && data.data.length > 0 && data.data[0].url) {
            const imageUrl = data.data[0].url;
            console.log('[IMAGEM] Imagem gerada com sucesso!');
            
            // Retornar HTML da imagem
            return `<div class="imagem-gerada-container">
                <img src="${imageUrl}" alt="Imagem gerada por FLUX 2 FLEX" class="imagem-gerada" />
                <div class="imagem-info">
                    <small>🎨 Gerado por FLUX 2 FLEX</small>
                </div>
            </div>`;
        } else {
            console.error('[IMAGEM] Estrutura de resposta inválida');
            return "Desculpe, não consegui gerar a imagem. Tente novamente.";
        }

    } catch (erro) {
        console.error('[IMAGEM] Erro ao chamar API FLUX:', erro);
        return "❌ Erro na API FLUX: " + erro.message + ". Tente novamente.";
    }
}
function toggleModoImage2() {
    if (modoImage2Ativo) {
        desativarModoImage2();
    } else {
        abrirModalImage2();
    }
}

function abrirModalImage2() {
    const modal = document.getElementById('modal-image2');
    if (modal) {
        modal.classList.add('active');
        // Listener para fechar ao clicar fora (backdrop)
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                fecharModalImage2();
            }
        });
    }
}

function fecharModalImage2() {
    const modal = document.getElementById('modal-image2');
    if (modal) {
        modal.classList.remove('active');
    }
}

function ativarModoImage2Simples() {
    modoImage2Tipo = 'simples';
    modoImage2Ativo = true;
    modoImage2AtivadoManualmente = true;
    modoImage2DesativadoManualmente = false;
    
    // Desliga outros modos se estiverem ativos
    if (modoRedacaoAtivo) alternarModoRedacao();
    if (modoResumoAtivo) alternarModoResumo();
    if (modoCorrecaoAtivo) alternarModoCorrecao();
    
    const btnImage2 = document.getElementById('btn-image2');
    const btnImage2Mobile = document.getElementById('btn-image2-mobile');
    const input = document.getElementById('input-mensagem');
    if (btnImage2) btnImage2.classList.add('active');
    if (btnImage2Mobile) btnImage2Mobile.classList.add('active');
    
    fecharModalImage2();
    closeToolsMenuMobile();
    
    input.placeholder = 'Gere uma imagem:';
    input.value = '';
    input.focus();
    // Remove listener anterior para garantir não duplicar
    input.removeEventListener('input', atualizarAutocompleteImage2);
    input.removeEventListener('input', atualizarAutocompleteImage2Pessoa);
    // Adiciona listener correto
    input.addEventListener('input', atualizarAutocompleteImage2);
}

function ativarModoImage2Pessoa() {
    modoImage2Tipo = 'pessoa';
    modoImage2Ativo = true;
    modoImage2AtivadoManualmente = true;
    modoImage2DesativadoManualmente = false;

    // Desliga outros modos se estiverem ativos
    if (modoRedacaoAtivo) alternarModoRedacao();
    if (modoResumoAtivo) alternarModoResumo();
    if (modoCorrecaoAtivo) alternarModoCorrecao();
    
    const btnImage2 = document.getElementById('btn-image2');
    const btnImage2Mobile = document.getElementById('btn-image2-mobile');
    const input = document.getElementById('input-mensagem');
    if (btnImage2) btnImage2.classList.add('active');
    if (btnImage2Mobile) btnImage2Mobile.classList.add('active');
    
    fecharModalImage2();
    closeToolsMenuMobile();
    
    input.placeholder = 'Ex: uma pessoa em pé na praia';
    input.value = '';
    input.focus();
    
    // Remove listener anterior
    input.removeEventListener('input', atualizarAutocompleteImage2);
    input.removeEventListener('input', atualizarAutocompleteImage2Pessoa);
    // Adiciona listener correto
    input.addEventListener('input', atualizarAutocompleteImage2Pessoa);
}

function desativarModoImage2() {
    modoImage2Ativo = false;
    modoImage2AtivadoManualmente = false;
    modoImage2DesativadoManualmente = true;
    modoImage2Tipo = null;
    
    const btnImage2 = document.getElementById('btn-image2');
    const btnImage2Mobile = document.getElementById('btn-image2-mobile');
    const input = document.getElementById('input-mensagem');
    
    if (btnImage2) btnImage2.classList.remove('active');
    if (btnImage2Mobile) btnImage2Mobile.classList.remove('active');
    
    input.placeholder = 'Envie uma mensagem para Dora AI...';
    input.value = '';
    
    // Remove listeners de autocomplete
    input.removeEventListener('input', atualizarAutocompleteImage2);
    input.removeEventListener('input', atualizarAutocompleteImage2Pessoa);
    
    const cardAutocomplete = document.getElementById('card-image2-autocomplete');
    if (cardAutocomplete) {
        cardAutocomplete.classList.remove('active');
    }
}

// Autocomplete Image 2 Simples
function atualizarAutocompleteImage2(e) {
    const input = e.target;
    const valor = input.value.toLowerCase().trim();
    const cardAutocomplete = document.getElementById('card-image2-autocomplete');
    const cardContent = document.getElementById('card-image2-content');
    
    if (!modoImage2Ativo || !modoImage2AtivadoManualmente) {
        cardAutocomplete.classList.remove('active');
        return;
    }
    
    if (!valor) {
        cardAutocomplete.classList.remove('active');
        return;
    }
    
    const imagensEncontradas = [];
    for (const imagem in bancoImagens) {
        const tags = bancoImagens[imagem];
        for (const tag of tags) {
            if (tag.includes(valor)) {
                imagensEncontradas.push(tag);
                break;
            }
        }
    }
    
    if (imagensEncontradas.length === 0) {
        cardContent.innerHTML = '<div class="image2-no-result">Não é possível gerar essa imagem</div>';
        cardAutocomplete.classList.add('active');
    } else {
        cardContent.innerHTML = imagensEncontradas
            .map(img => `<div class="image2-item" onclick="inserirTagImage2('${img}')">${img}</div>`)
            .join('');
        cardAutocomplete.classList.add('active');
    }
}

function inserirTagImage2(tag) {
    const input = document.getElementById('input-mensagem');
    input.value = tag;
    
    const cardAutocomplete = document.getElementById('card-image2-autocomplete');
    if (cardAutocomplete) {
        cardAutocomplete.classList.remove('active');
    }
    input.focus();
}

// Autocomplete Image 2 Pessoa
function atualizarAutocompleteImage2Pessoa(e) {
    const input = e.target;
    const valor = input.value.toLowerCase().trim();
    const cardAutocomplete = document.getElementById('card-image2-autocomplete');
    const cardContent = document.getElementById('card-image2-content');

    if (!modoImage2Ativo || !modoImage2AtivadoManualmente) {
        cardAutocomplete.classList.remove('active');
        return;
    }

    if (!valor) {
        cardAutocomplete.classList.remove('active');
        return;
    }

    const imagensEncontradas = [];
    for (const imagem in bancoImagens) {
        const tags = bancoImagens[imagem];
        for (const tag of tags) {
            if (tag.includes(valor) || valor.includes(tag)) {
                imagensEncontradas.push({
                    nome: tag,
                    arquivo: imagem
                });
                break;
            }
        }
    }

    if (imagensEncontradas.length === 0) {
        cardContent.innerHTML = '<div class="image2-no-result">Nenhum fundo disponível para esta descrição</div>';
        cardAutocomplete.classList.add('active');
    } else {
        cardContent.innerHTML = '<div class="image2-section-title" style="font-size:11px; color:#666; margin-bottom:5px;">Fundos Disponíveis:</div>' + 
            imagensEncontradas
            .map(img => `<div class="image2-item" onclick="inserirTagImage2Pessoa('${img.nome}', '${img.arquivo}')">${img.nome}</div>`)
            .join('');
        cardAutocomplete.classList.add('active');
    }
}

function inserirTagImage2Pessoa(nomeFundo, arquivoFundo) {
    const input = document.getElementById('input-mensagem');
    const partes = input.value.split('em');
    const descricaoAtual = partes.length > 0 ? partes[0].trim() : 'uma pessoa';
    // Atualiza o input com o formato esperado para processamento
    input.value = `${descricaoAtual} em ${nomeFundo}|${arquivoFundo}`;
    const cardAutocomplete = document.getElementById('card-image2-autocomplete');
    if (cardAutocomplete) {
        cardAutocomplete.classList.remove('active');
    }

    input.focus();
}

// Fechar autocomplete ao clicar fora
document.addEventListener('click', (e) => {
    const cardAutocomplete = document.getElementById('card-image2-autocomplete');
    const input = document.getElementById('input-mensagem');
    
    if (cardAutocomplete && input && !cardAutocomplete.contains(e.target) && !input.contains(e.target)) {
        cardAutocomplete.classList.remove('active');
    }
});
// ===== MODOS DE TEXTO (REDAÇÃO, RESUMO, CORREÇÃO) =====

function alternarModoRedacao() {
    const input = document.getElementById('input-mensagem');
    const btnRedacao = document.getElementById('btn-redacao');
    const btnRedacaoMobile = document.getElementById('btn-redacao-mobile');
    const textoPrefixo = "Pode me ajudar a escrever uma redação sobre ";
    // Desliga outros modos (Correção, Resumo, IMAGE 2)
    if (modoResumoAtivo) alternarModoResumo();
    if (modoCorrecaoAtivo) alternarModoCorrecao();
    if (modoImage2Ativo) desativarModoImage2();
    // Importante: desliga Image 2 explicitamente

    if (modoRedacaoAtivo) {
        modoRedacaoAtivo = false;
        if (btnRedacao) btnRedacao.classList.remove('active');
        if (btnRedacaoMobile) btnRedacaoMobile.classList.remove('active');

        if (input.value.startsWith(textoPrefixo)) {
            input.value = input.value.replace(textoPrefixo, '');
        }
    } else {
        modoRedacaoAtivo = true;
        if (btnRedacao) btnRedacao.classList.add('active');
        if (btnRedacaoMobile) btnRedacaoMobile.classList.add('active');
        
        if (!input.value.startsWith(textoPrefixo)) {
            input.value = textoPrefixo + input.value;
        }
        
        input.focus();
        closeToolsMenuMobile();
    }
}

function alternarModoResumo() {
    const input = document.getElementById('input-mensagem');
    const btnResumo = document.getElementById('btn-resumo');
    const btnResumoMobile = document.getElementById('btn-resumo-mobile');
    const placeholderAtivo = "Cole o texto que você deseja resumir aqui...";
    const placeholderInativo = "Envie uma mensagem para Dora AI...";
    // Desliga outros modos
    if (modoRedacaoAtivo) alternarModoRedacao();
    if (modoCorrecaoAtivo) alternarModoCorrecao();
    if (modoImage2Ativo) desativarModoImage2();
    // Importante

    if (modoResumoAtivo) {
        modoResumoAtivo = false;
        if (btnResumo) btnResumo.classList.remove('active');
        if (btnResumoMobile) btnResumoMobile.classList.remove('active');
        input.placeholder = placeholderInativo;
        if (input.value.startsWith("resumir: ")) {
            input.value = '';
        }
    } else {
        modoResumoAtivo = true;
        if (btnResumo) btnResumo.classList.add('active');
        if (btnResumoMobile) btnResumoMobile.classList.add('active');
        input.placeholder = placeholderAtivo;
        input.value = 'resumir: ';
        input.focus();
        closeToolsMenuMobile();
    }
}

function alternarModoCorrecao() {
    const input = document.getElementById('input-mensagem');
    const btnCorrecao = document.getElementById('btn-correcao');
    const btnCorrecaoMobile = document.getElementById('btn-correcao-mobile');
    const placeholderAtivo = "Cole o texto que você deseja corrigir aqui...";
    const placeholderInativo = "Envie uma mensagem para Dora AI...";
    // Desliga outros modos
    if (modoRedacaoAtivo) alternarModoRedacao();
    if (modoResumoAtivo) alternarModoResumo();
    if (modoImage2Ativo) desativarModoImage2();
    // Importante

    if (modoCorrecaoAtivo) {
        modoCorrecaoAtivo = false;
        if (btnCorrecao) btnCorrecao.classList.remove('active');
        if (btnCorrecaoMobile) btnCorrecaoMobile.classList.remove('active');
        input.placeholder = placeholderInativo;
        input.value = '';
    } else {
        modoCorrecaoAtivo = true;
        if (btnCorrecao) btnCorrecao.classList.add('active');
        if (btnCorrecaoMobile) btnCorrecaoMobile.classList.add('active');
        input.placeholder = placeholderAtivo;
        input.value = '';
        input.focus();
        closeToolsMenuMobile();
    }
}

// ===== ENVIO E PROCESSAMENTO =====

function enviarMensagem() {
    const input = document.getElementById('input-mensagem');
    const btnEnviar = document.getElementById('btn-send');
    const btnRedacao = document.getElementById('btn-redacao');
    const btnResumo = document.getElementById('btn-resumo');
    const btnCorrecao = document.getElementById('btn-correcao');
    const inputAreaContainer = document.querySelector('.input-area-container');

    let mensagem = input.value.trim();
    const isModoResumoAtivo = modoResumoAtivo;
    const isModoCorrecaoAtivo = modoCorrecaoAtivo;
    const isModoImage2Ativo = modoImage2Ativo;
    // Captura estado
    const tipoImage2Atual = modoImage2Tipo; // Captura tipo

    if (!mensagem) return;

    // Inicia animação de onda colorida
    if (inputAreaContainer) {
        // efeito sutil de destaque ao enviar (pode ser removido)
        inputAreaContainer.classList.add('wave-animation');
        setTimeout(() => { inputAreaContainer.classList.remove('wave-animation'); }, 600);
    }
    if (isModoResumoAtivo && !mensagem.toLowerCase().startsWith("resumir: ")) {
        mensagem = "resumir: " + mensagem;
    }

    input.disabled = true;
    if (btnEnviar) {
        btnEnviar.disabled = true;
        btnEnviar.classList.add('sending');
    }
    // Desativa modos de "um uso só" (Redação, Resumo, Correção)
    // O Image 2 NÃO é desativado aqui para permitir uso contínuo
    if (modoRedacaoAtivo) {
        modoRedacaoAtivo = false;
        btnRedacao.classList.remove('active');
    }
    if (modoResumoAtivo) {
        modoResumoAtivo = false;
        btnResumo.classList.remove('active');
        input.placeholder = "Envie uma mensagem para Dora AI...";
    }
    if (modoCorrecaoAtivo) {
        modoCorrecaoAtivo = false;
        btnCorrecao.classList.remove('active');
        input.placeholder = "Envie uma mensagem para Dora AI...";
    }

    historicoConversa.push({ tipo: 'usuario', texto: mensagem });
    adicionarMensagem(mensagem, 'usuario');
    
    input.value = '';
    input.style.height = '';
    input.classList.remove('scrolling');
    atualizarBotaoAudioEnviar();

    mostrarDigitando(true);
    // 🆕 NOVO: Usa async/await para lidar com gerarResposta async
    mostrarDigitando(true);  // MANTÉM o indicador
    
    // Fazer requisição sem setTimeout para evitar delay visual
    (async () => {
        let resposta;
        
        // Se está em modo de imagem, gera imagem
        if (modoImagemAtivo) {
            resposta = await gerarImagem(mensagem);
            mostrarDigitando(false);  // REMOVE o indicador quando resposta chegar
            
            // Adiciona a imagem gerada
            historicoConversa.push({ tipo: 'bot', texto: 'Imagem gerada por FLUX 2 FLEX' });
            adicionarMensagem(resposta, 'bot', null);
        } else {
            // Senão, usa resposta normal da API
            resposta = isModoCorrecaoAtivo ? gerarCorrecao(mensagem) : await gerarResposta(mensagem, historicoConversa);
            
            mostrarDigitando(false);  // REMOVE o indicador quando resposta chegar
            
            let imagemAssociada = null;
            
            // Lógica normal para outros modos
            if (!isModoCorrecaoAtivo) {
                imagemAssociada = encontrarImagem(mensagem);
            }
            historicoConversa.push({ tipo: 'bot', texto: resposta });
            adicionarMensagem(resposta, 'bot', imagemAssociada);
        }

        input.disabled = false;
        input.focus();
        if (btnEnviar) {
            btnEnviar.disabled = false;
            btnEnviar.classList.remove('sending');
        }
    })();
}

// ===== LÓGICA DE GERAÇÃO (RESPOSTAS, RESUMOS, CORREÇÕES) =====

async function gerarResposta(mensagemUsuario, historicoConversa = []) {
    const mensagemOriginal = mensagemUsuario;
    mensagemUsuario = mensagemUsuario.toLowerCase();
    const sentimento = detectarSentimento(mensagemUsuario);
    const palavrasUsuario = mensagemUsuario.split(/\W+/).filter(Boolean);

    let melhorResposta = null;
    const textoPrefixoRedacao = "pode me ajudar a escrever uma redação sobre ";
    
    if (mensagemUsuario.startsWith("resumir: ")) {
        const textoParaResumir = mensagemOriginal.substring("resumir: ".length).trim();
        if (textoParaResumir.length < 50) { 
            return "Por favor, forneça um texto um pouco maior para que eu possa criar um resumo de qualidade! 😉";
        }
        return gerarResumo(textoParaResumir);
    }
    
    if (modoRedacaoAtivo || mensagemUsuario.startsWith(textoPrefixoRedacao)) {
        const temaSolicitado = mensagemUsuario.startsWith(textoPrefixoRedacao)
            ? mensagemUsuario.substring(textoPrefixoRedacao.length).trim()
            : mensagemUsuario.trim();
        const redacaoEncontrada = redacoesData.find(r => r.tema.toLowerCase() === temaSolicitado.toLowerCase());

        if (redacaoEncontrada) {
            let respostaRedacao = `Com certeza!
Aqui estão alguns tópicos e ideias para você começar sua redação sobre **${redacaoEncontrada.tema.toUpperCase()}**:\n\n`;
            
            respostaRedacao += `**Sugestões para a Introdução:**\n`;
            redacaoEncontrada.topicos.introducao.forEach(topico => { respostaRedacao += `• ${topico}\n`; });
            
            respostaRedacao += `\n**Sugestões para o Desenvolvimento:**\n`;
            redacaoEncontrada.topicos.desenvolvimento.forEach(topico => { respostaRedacao += `• ${topico}\n`; });
            
            respostaRedacao += `\n**Sugestões para a Conclusão:**\n`;
            redacaoEncontrada.topicos.conclusao.forEach(topico => { respostaRedacao += `• ${topico}\n`; });
            
            return formatarResposta(respostaRedacao);
        } else {
            const temasDisponiveis = redacoesData.map(r => r.tema).join(', ');
            return formatarResposta(`Desculpe, não encontrei tópicos sobre **${temaSolicitado}**. Os temas que eu conheço são: ${temasDisponiveis}.`);
        }
    }

    // Forçar chamada direta à API Groq sem dependência da classe
    console.log('[DEBUG] Forçando chamada direta à API Groq...');
    
    try {
        const response = await fetch('/api/lhama-groq-api-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: `Você é a Lhama AI 1, uma assistente EXTREMAMENTE INTELIGENTE, criativa e MUITO ÚTIL. Responda em português brasileiro de forma completa e detalhada.`
                    },
                    ...historicoConversa.map(msg => ({
                        role: msg.tipo === 'usuario' ? 'user' : 'assistant',
                        content: msg.texto
                    })),
                    {
                        role: 'user',
                        content: mensagemOriginal
                    }
                ],
                temperature: 0.7,
                max_tokens: 8192,
                top_p: 1,
                stream: false
            })
        });

        console.log('[DEBUG] Resposta do proxy:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[DEBUG] Erro na API:', response.status, errorText);
            
            if (response.status === 401) {
                return formatarResposta("🔐 Chave API não configurada. Verifique a variável LHAMA_GROQ_API_PROXY na Vercel.");
            } else if (response.status === 403) {
                return formatarResposta("❌ Sem permissão para usar a API. Verifique a variável LHAMA_GROQ_API_PROXY.");
            } else if (response.status === 429) {
                return formatarResposta("⏱️ Muitas requisições. Tente novamente em alguns segundos.");
            } else if (response.status === 500) {
                return formatarResposta("🔧 Servidor da API indisponível. Tente novamente.");
            } else {
                return formatarResposta(`Erro na API: ${errorText || response.statusText}`);
            }
        }

        const data = await response.json();
        console.log('[DEBUG] Dados recebidos:', data);
        
        if (!data.choices || data.choices.length === 0) {
            console.error('[DEBUG] Estrutura de resposta inválida');
            return formatarResposta("Desculpe, não consegui gerar uma resposta. Tente novamente.");
        }

        const conteudoResposta = data.choices[0]?.message?.content;
        
        if (!conteudoResposta) {
            console.error('[DEBUG] Resposta vazia');
            return formatarResposta("Desculpe, a resposta veio vazia. Tente novamente.");
        }

        console.log('[DEBUG] Resposta da API obtida com sucesso!');
        return formatarResposta(conteudoResposta);

    } catch (erro) {
        console.error('[DEBUG] Erro ao chamar API diretamente:', erro);
        return formatarResposta("❌ Erro na API Groq: " + erro.message + ". Tente novamente.");
    }
}

function gerarCorrecao(texto) {
    if (!correcoesData || !correcoesData.regras) {
        return "Desculpe, o módulo de correção não está carregado.";
    }

    let textoCorrigido = texto;
    let correcoesFeitas = 0;
    for (const regra of correcoesData.regras) {
        const regex = new RegExp(`\\b${regra.errado}\\b`, 'gi');
        if (regex.test(textoCorrigido)) {
            textoCorrigido = textoCorrigido.replace(regex, (match) => {
                correcoesFeitas++;
                return `<mark>${regra.correto}</mark>`;
            });
        }
    }

    if (correcoesFeitas === 0) {
        return "Não encontrei nenhum erro para corrigir. Parece que seu texto está ótimo! 👍";
    }

    let respostaFormatada = '<div class="resumo-card">';
    respostaFormatada += '<h3><span class="material-symbols-rounded">edit_note</span> Texto Corrigido</h3>';
    // Substitui quebras de linha por <br> dentro do cartão
    textoCorrigido = textoCorrigido.replace(/\n/g, '<br>');
    respostaFormatada += `<p>${textoCorrigido}</p>`;
    respostaFormatada += '</div>';

    return respostaFormatada;
}

function gerarResumo(texto) {
    // Stopwords simplificadas para o exemplo
    const stopWords = new Set(['de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser']);
    const sentencas = texto.match(/[^.!?]+[.!?]+/g) || [];
    
    if (sentencas.length < 2) return formatarResposta("Texto muito curto para resumir.");

    const frequenciaPalavras = {};
    const palavras = texto.toLowerCase().split(/[\s,.]+/).filter(Boolean);
    palavras.forEach(palavra => {
        if (!stopWords.has(palavra) && palavra.length > 2) {
            frequenciaPalavras[palavra] = (frequenciaPalavras[palavra] || 0) + 1;
        }
    });
    const pontuacaoSentencas = sentencas.map((sentenca, index) => {
        let pontuacao = 0;
        const palavrasSentenca = sentenca.toLowerCase().split(/[\s,.]+/).filter(Boolean);
        palavrasSentenca.forEach(palavra => {
            if (frequenciaPalavras[palavra]) pontuacao += frequenciaPalavras[palavra];
        });
        return { sentenca, pontuacao: pontuacao / (palavrasSentenca.length || 1), index };
    });
    pontuacaoSentencas.sort((a, b) => b.pontuacao - a.pontuacao);
    const numeroSentencas = Math.max(3, Math.floor(sentencas.length / 3));
    const melhoresSentencas = pontuacaoSentencas.slice(0, numeroSentencas).sort((a, b) => a.index - b.index);

    let respostaFormatada = '<div class="resumo-card">';
    respostaFormatada += '<h3><span class="material-symbols-rounded">insights</span> Pontos Principais</h3>';
    respostaFormatada += '<ul>';
    melhoresSentencas.forEach(item => {
        respostaFormatada += `<li>${item.sentenca.trim()}</li>`;
    });
    respostaFormatada += '</ul></div>';
    return respostaFormatada;
}

// ===== FUNÇÕES AUXILIARES DE IMAGEM =====

function encontrarImagem(mensagemUsuario) {
    // 🆕 DESABILIDADO: Imagens agora vêm da API Gemini, não do imagem.json
    // Mantém função para compatibilidade, mas retorna null
    return null;
}

function buscarImagemPorNome(nomeBuscado) {
    // 🆕 DESABILIDADO: Imagens agora vêm da API Gemini, não do imagem.json
    // Mantém função para compatibilidade, mas retorna null
    return null;
}

// Nova função separada para processar Image 2 Pessoa
function processarImage2Pessoa(entrada) {
    // Formato esperado: "descrição pessoa|arquivo_fundo" ou "descrição pessoa em fundo"
    let descricaoPessoa = entrada;
    let imagemFundo = null;

    if (entrada.includes('|')) {
        const partes = entrada.split('|');
        descricaoPessoa = partes[0].trim();
        imagemFundo = partes[1].trim();
    } else {
        // Busca por "em" para encontrar o fundo
        const palavras = entrada.toLowerCase().split(/\s+/);
        for (const imagem in bancoImagens) {
            const tags = bancoImagens[imagem];
            for (const tag of tags) {
                if (palavras.some(p => tag.includes(p) || p.includes(tag))) {
                    imagemFundo = imagem;
                    descricaoPessoa = entrada.split(tag)[0].trim();
                    break;
                }
            }
            if (imagemFundo) break;
        }
    }

    if (!imagemFundo) {
        adicionarMensagem('Nenhum fundo disponível para esta descrição. Tente novamente.', 'bot', null);
        return;
    }

    if (!descricaoPessoa || descricaoPessoa.length < 3) {
        adicionarMensagem('Descreva como a pessoa deve ser (ex: uma menina morena, um homem idoso).', 'bot', null);
        return;
    }

    const htmlComposicao = gerarComposicaoVisual(descricaoPessoa, imagemFundo);
    adicionarMensagem('', 'bot', null);
    
    const mensagensBot = document.querySelectorAll('.mensagem.bot');
    const ultimaMensagem = mensagensBot[mensagensBot.length - 1];
    if (ultimaMensagem) {
        const divContent = ultimaMensagem.querySelector('.message-content');
        if (divContent) divContent.innerHTML = htmlComposicao;
    }
}

function gerarComposicaoVisual(descricaoPessoa, imagemFundo) {
    const desc = descricaoPessoa.toLowerCase();
    let emoji = '👤';
    if (desc.includes('menina') || desc.includes('rapariga') || desc.includes('mulher')) emoji = '👧';
    if (desc.includes('menino') || desc.includes('rapaz') || desc.includes('homem')) emoji = '👦';
    if (desc.includes('idoso') || desc.includes('velho') || desc.includes('avó') || desc.includes('avô')) emoji = '👴';
    if (desc.includes('bebê') || desc.includes('criança')) emoji = '👶';
    if (desc.includes('morena') || desc.includes('negro')) emoji = '🧑‍🦱';
    if (desc.includes('loura') || desc.includes('loiro')) emoji = '👱';
    return `
        <div class="image2-composicao-container">
            <div class="image2-composicao-titulo">Composição Visual</div>
            <div class="image2-composicao-main">
                <div class="image2-composicao-fundo">
                    <img src="img-IA/${imagemFundo}" alt="Fundo" class="image2-composicao-img">
                    <div class="image2-composicao-pessoa">
                        <div class="image2-composicao-emoji">${emoji}</div>
                    </div>
                </div>
            </div>
            <div class="image2-composicao-desc">
                <strong>Pessoa:</strong> ${descricaoPessoa}<br>
                <strong>Fundo:</strong> ${imagemFundo.replace('.png', '').replace('_', ' ')}
            </div>
            <div class="image2-composicao-nota">💡 Composição gerada por IA</div>
        </div>
    `;
}

// ===== UTILITÁRIOS (SENTIMENTO, TEXTO, MARCA D'ÁGUA) =====

function detectarSentimento(mensagem) {
    const tristes = ['triste', 'chateado', 'deprimido', 'mal', 'sozinho', 'cansado', 'chorar'];
    const felizes = ['feliz', 'contente', 'animado', 'bem', 'ótimo', 'maravilhoso', 'alegre'];
    for (let p of tristes) if (mensagem.includes(p)) return 'triste';
    for (let p of felizes) if (mensagem.includes(p)) return 'feliz';
    return 'neutro';
}

/**
 * FUNÇÃO CORRIGIDA PARA TRATAR ESPAÇAMENTO DE PARÁGRAFOS
 */
function formatarResposta(texto) {
    // 1. Substitui negrito **texto** por <strong>$1</strong>
    texto = texto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Se o texto já contém um cartão de resumo/correção ou formatação de lista
    // complexa, apenas substitui newlines por <br> para manter o formato original
    // (A formatação de parágrafo é ignorada para estes casos).
    if (texto.includes('resumo-card')) {
        return texto;
    }
    
    // 2. Lógica para transformar quebras de linha em parágrafos (<p>)
    
    // Divide o texto em blocos de parágrafos usando duas ou mais quebras de linha.
    const paragrafos = texto.trim().split(/\n{2,}/);

    let textoFormatado = paragrafos.map(paragrafo => {
        if (paragrafo.trim() === '') return ''; // Ignora blocos vazios

        // Dentro de um parágrafo, quebras de linha simples viram <br>
        let conteudo = paragrafo.replace(/\n/g, '<br>');
        
        // Se o conteúdo já parece ser uma lista simples gerada pelo JS (com '•'),
        // não envolver em <p> para evitar margens desnecessárias.
        if (conteudo.startsWith('•')) {
            return conteudo; 
        }

        // Envolve o texto em <p> para ganhar espaçamento de parágrafo.
        return `<p>${conteudo}</p>`;
    }).join('');
    
    return textoFormatado;
}


function adicionarMarcaDagua(imgElement, caminhoMarca = 'img-IA/logo.png') {
    if (imgElement.dataset.comMarca === 'true') return;
    imgElement.dataset.comMarca = 'true';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    ctx.drawImage(imgElement, 0, 0);
    const marca = new Image();
    marca.src = caminhoMarca;
    marca.crossOrigin = 'Anonymous';
    marca.onload = () => {
        const larguraMarca = Math.min(120, canvas.width * 0.15);
        const alturaMarca = larguraMarca * (marca.height / marca.width);
        const padding = 12;
        const x = canvas.width - larguraMarca - padding;
        const y = canvas.height - alturaMarca - padding;
        
        ctx.globalAlpha = 0.7;
        ctx.drawImage(marca, x, y, larguraMarca, alturaMarca);
        ctx.globalAlpha = 1;
        imgElement.src = canvas.toDataURL('image/png');
    };
}

function adicionarMensagem(texto, tipo, imagemNome = null) {
    // Salvar no histórico
    if (typeof salvarMensagemHistorico !== 'undefined') {
        salvarMensagemHistorico(tipo, texto);
    }

    const chatBox = document.getElementById('chat-box');
    const divMensagem = document.createElement('div');
    divMensagem.className = `mensagem ${tipo}`;
    const divContent = document.createElement('div');
    divContent.className = 'message-content';
    if (tipo === 'bot') {
        // Processar o texto com o renderizador se disponível
        let textoProcessado = texto;
        if (typeof RespostaRenderer !== 'undefined' && RespostaRenderer && RespostaRenderer.processar) {
            textoProcessado = RespostaRenderer.processar(texto);
        }
        
        const textoSemHTML = texto.replace(/<[^>]*>/g, '');
        // Animação de digitação letra por letra
        let i = 0;
        divContent.innerHTML = '';
        divMensagem.appendChild(divContent); // Corrige bug: adiciona conteúdo antes da animação
        chatBox.appendChild(divMensagem);
        function escreverLetra() {
            if (i <= textoProcessado.length) {
                divContent.innerHTML = textoProcessado.slice(0, i);
                scrollParaBaixo();
                i++;
                setTimeout(escreverLetra, 8 + Math.random() * 18);
            } else {
                divContent.innerHTML = textoProcessado;
                // ...ações e imagem...
                if (imagemNome) {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'imagem-container-premium';
                    imgContainer.innerHTML = '<div class="skeleton-loader"></div>';
                    divContent.appendChild(imgContainer);
                    const img = new Image();
                    img.src = `img-IA/${imagemNome}`;
                    img.className = 'imagem-resposta-premium';
                    img.alt = "Imagem gerada por IA";
                    img.crossOrigin = 'Anonymous';
                    img.onload = () => {
                        setTimeout(() => {
                            adicionarMarcaDagua(img);
                            imgContainer.innerHTML = '';
                            imgContainer.appendChild(img);
                            scrollParaBaixo();
                        }, 1000);
                    };
                    img.onerror = () => {
                        imgContainer.innerHTML = '<span style="font-size:12px; color:#999;">Erro ao gerar imagem.</span>';
                    };
                }
                // Ações da Mensagem
                const actionsContainer = document.createElement('div');
                actionsContainer.className = 'message-actions-container';
                const btnCopy = document.createElement('button');
                btnCopy.className = 'action-icon-btn';
                btnCopy.innerHTML = '<span class="material-icons-outlined" style="font-size: 14px;">content_copy</span> <span>Copiar</span>';
                btnCopy.onclick = () => copiarTexto(textoSemHTML);
                actionsContainer.appendChild(btnCopy);
                const btnAudio = document.createElement('button');
                btnAudio.className = 'action-icon-btn audio-btn';
                btnAudio.innerHTML = '<span class="material-icons-outlined" style="font-size: 14px;">volume_up</span> <span>Ouvir</span>';
                btnAudio.onclick = () => lerTextoEmVoz(textoSemHTML);
                actionsContainer.appendChild(btnAudio);
                if (imagemNome && !texto.includes('image2-composicao-container')) {
                    const btnDownload = document.createElement('button');
                    btnDownload.className = 'action-icon-btn';
                    btnDownload.innerHTML = '<span class="material-icons-outlined" style="font-size: 14px;">download</span> <span>Download</span>';
                    btnDownload.onclick = () => baixarImagem(`img-IA/${imagemNome}`);
                    actionsContainer.appendChild(btnDownload);
                }
                divMensagem.appendChild(actionsContainer);
            }
        }
        escreverLetra();
    } else {
        divContent.innerHTML = texto;
        divMensagem.appendChild(divContent);
        chatBox.appendChild(divMensagem);
    }
    scrollParaBaixo();
}

function scrollParaBaixo() {
    const chatBoxContainer = document.getElementById('chat-box-container');
    if (!chatBoxContainer) return;
    chatBoxContainer.scrollTo({ top: chatBoxContainer.scrollHeight, behavior: 'smooth' });
    const btn = document.getElementById('scrollToBottomBtn');
    if (btn) btn.style.display = 'none';
}

function mostrarDigitando(mostrar) {
    const chatBox = document.getElementById('chat-box');
    const digitandoElement = document.getElementById('digitando');
    if (mostrar) {
        if (!digitandoElement) {
            const div = document.createElement('div');
            div.id = 'digitando';
            div.className = 'mensagem bot digitando';
            div.innerHTML = '<div class="message-content">Lhama AI está pensando...</div>';
            chatBox.appendChild(div);
        }
        scrollParaBaixo();
    } else {
        if (digitandoElement) digitandoElement.remove();
    }
}

// ===== DOWNLOAD/COPY/AUDIO =====
function baixarImagem(src) {
    const a = document.createElement('a');
    a.href = src;
    a.download = `DoraAI-${Date.now()}.png`;
    a.click();
}
function copiarTexto(txt) { navigator.clipboard.writeText(txt.replace(/<p>|<\/p>|<br>/g, '\n').replace(/<[^>]*>/g, '')); }
function lerTextoEmVoz(txt) {
    const txtLimpo = txt.replace(/<[^>]*>/g, '');
    const synth = window.speechSynthesis;
    if (synth.speaking) synth.cancel();
    const u = new SpeechSynthesisUtterance(txtLimpo);
    
    // Buscar vozes de português português (Portugal) primeiro
    const voices = synth.getVoices ? synth.getVoices() : [];
    let vozEscolhida = null;
    
    // Preferências: primeiro pt-PT (Portugal), depois Google Portuguese, depois qualquer português
    const preferenciaNomes = [
        'pt-pt',
        'portuguese (portugal)',
        'portuguese portugal',
        'português (portugal)',
        'português portugal',
        'google português',
        'portuguese',
        'pt-br',
        'portuguese (brazil)',
        'português (brasil)',
        'luciana',
        'daniel',
        'joão',
        'joao',
        'maria'
    ];
    
    // Tentar encontrar pela ordem de preferência
    for (const pref of preferenciaNomes) {
        const encontrada = voices.find(v => {
            const nameLower = (v.name || '').toLowerCase();
            const langLower = (v.lang || '').toLowerCase();
            return nameLower.includes(pref) || langLower.includes(pref);
        });
        if (encontrada) {
            vozEscolhida = encontrada;
            break;
        }
    }
    
    // Fallback: qualquer voz portuguesa
    if (!vozEscolhida) {
        for (const v of voices) {
            if (v.lang && v.lang.toLowerCase().startsWith('pt')) {
                vozEscolhida = v;
                break;
            }
        }
    }
    
    if (vozEscolhida) {
        u.voice = vozEscolhida;
        u.lang = vozEscolhida.lang;
    } else {
        u.lang = 'pt-PT'; // Preferir pt-PT por padrão
    }
    
    // Parâmetros para voz clara e natural
    u.rate = 0.9;      // Velocidade um pouco mais lenta para clareza
    u.pitch = 1.0;     // Tom natural
    u.volume = 1.0;    // Volume máximo
    
    console.log('TTS using voice:', (u.voice && u.voice.name) || u.lang);
    synth.speak(u);
    return u;
}

// ===== INICIALIZAÇÃO E RESETS =====

function iniciarNovaConversa() {
    historicoConversa = [];
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = `
        <div class="mensagem bot boas-vindas-inicial">
            <div class="message-content">Olá!
Sou a Dora AI. Como posso te ajudar hoje? ✨</div>
        </div>
    `;
    if (modoRedacaoAtivo) alternarModoRedacao();
    if (modoResumoAtivo) alternarModoResumo();
    if (modoCorrecaoAtivo) alternarModoCorrecao();
    if (modoImage2Ativo) desativarModoImage2();

    const input = document.getElementById('input-mensagem');
    input.value = '';
    input.placeholder = "Converse com a Dora AI...";
    input.focus();
}

function ajustarAlturaTextarea(textarea) {
    if (!textarea) return;
    textarea.style.height = 'auto';
    const maxHeight = window.innerHeight * 0.3;
    if (textarea.scrollHeight > maxHeight) {
        textarea.style.height = maxHeight + 'px';
        textarea.classList.add('scrolling');
    } else {
        textarea.style.height = textarea.scrollHeight + 'px';
        textarea.classList.remove('scrolling');
    }
}

function atualizarBotaoAudioEnviar() {
    const textarea = document.getElementById('input-mensagem');
    const btnSend = document.getElementById('btn-send');
    if (!textarea || !btnSend) return;
    const hasText = textarea.value.trim().length > 0;
    // manter o botão habilitado mesmo sem texto (ele abre o modo Live)
    btnSend.disabled = false;
    if (hasText) {
        btnSend.classList.remove('send-live');
    } else {
        btnSend.classList.add('send-live');
    }
}

function clicouBotaoAcao() {
    const textarea = document.getElementById('input-mensagem');
    if (textarea && textarea.value.trim().length > 0) enviarMensagem();
    else gravarAudio();
}

// Transcrição de Voz
let isListening = false;
let _tempTranscript = '';
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true; // mantem até o usuário parar
recognition.interimResults = true; // resultados parciais
recognition.lang = 'pt-BR';

recognition.onstart = () => {
    isListening = true;
    _tempTranscript = '';
    const mic = document.getElementById('btn-mic');
    if (mic) mic.classList.add('recording');
};

recognition.onend = () => {
    isListening = false;
    const mic = document.getElementById('btn-mic');
    if (mic) mic.classList.remove('recording');
    // auto-enviar se houver algo transcrito
    const val = (_tempTranscript || '').trim();
    if (val.length > 0) {
        const input = document.getElementById('input-mensagem');
        if (input) {
            input.value = val;
            atualizarBotaoAudioEnviar();
            enviarMensagem();
        }
    }
};

recognition.onresult = (e) => {
    let interim = '';
    let final = '';
    for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
    }
    // guarda em temp e atualiza o input para visualização ao usuário
    _tempTranscript = (final + ' ' + interim).trim();
    const input = document.getElementById('input-mensagem');
    if (input) {
        input.value = _tempTranscript;
        ajustarAlturaTextarea(input);
        atualizarBotaoAudioEnviar();
    }
};

function gravarAudio() {
    try {
        if (!isListening) {
            recognition.start();
        } else {
            recognition.stop();
        }
    } catch (err) {
        console.error(err);
    }
}

// LOAD
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('dora_announced_v1.4')) {
        mostrarAnuncio();
        localStorage.setItem('dora_announced_v1.4', '1');
    }

    const textarea = document.getElementById('input-mensagem');
    if (textarea) {
        ajustarAlturaTextarea(textarea);
        textarea.addEventListener('input', (e) => {
            ajustarAlturaTextarea(e.target);
            atualizarBotaoAudioEnviar();
        });
     
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviarMensagem();
            }
        });
    }
    // estado inicial do botão enviar
    atualizarBotaoAudioEnviar();

    // Carregamento dos dados
    fetch('training.json').then(r => r.json()).then(d => treinamentos = d).catch(e => console.log(e));
    fetch('redacoes.json').then(r => r.json()).then(d => redacoesData = d).catch(e => console.log(e));
    fetch('correcoes.json').then(r => r.json()).then(d => correcoesData = d).catch(e => console.log(e));
    
    // NOVO: Carregar o banco de imagens do arquivo JSON externo
    fetch('imagem.json')
        .then(r => r.json())
        .then(d => {
            bancoImagens = d; // Atribui os dados do JSON à variável global.
            console.log("Banco de Imagens carregado com sucesso.");
        })
        .catch(e => console.error("Erro ao carregar imagem.json:", e));

    // Conectar o toast (informativo) e ajustar o comportamento do botão enviar
    const voiceToast = document.getElementById('voice-toast');
    function showVoiceToast(msg, ms = 4000) {
        if (!voiceToast) return;
        voiceToast.textContent = msg;
        voiceToast.classList.add('show');
        if (ms > 0) setTimeout(() => voiceToast.classList.remove('show'), ms);
    }
    // não mostrar instrução automática no toast por padrão

    // botão enviar: se textarea vazio => ativa Live fullscreen; caso contrário envia texto
    const btnSend = document.getElementById('btn-send');
    function atualizarVisualBotaoSend() {
        const ta = document.getElementById('input-mensagem');
        if (!btnSend || !ta) return;
        if (ta.value.trim().length === 0) {
            btnSend.innerHTML = '<span class="material-symbols-rounded">graphic_eq</span>';
            btnSend.title = 'Ativar Lhama Live (voz)';
        } else {
            btnSend.innerHTML = '<span class="material-symbols-rounded">arrow_upward</span>';
            btnSend.title = 'Enviar mensagem';
        }
    }

    const ta = document.getElementById('input-mensagem');
    if (ta) ta.addEventListener('input', atualizarVisualBotaoSend);
    atualizarVisualBotaoSend();

    if (btnSend) {
        btnSend.addEventListener('click', async (e) => {
            const ta = document.getElementById('input-mensagem');
            if (ta && ta.value.trim().length > 0) {
                enviarMensagem();
                return;
            }

            // Se vazio: ativar Live em tela cheia
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                showVoiceToast('Microfone não suportado neste navegador', 3000);
                return;
            }

            try {
                showVoiceToast('Solicitando acesso ao microfone...', 2000);
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(t => t.stop());
                // abrir modal full-screen e iniciar sessão de reconhecimento contínuo
                showLiveModal();
                startLiveSession();
            } catch (err) {
                console.warn('Permissão de microfone negada ou erro:', err);
                showVoiceToast('Permissão de microfone negada', 3000);
            }
        });
    }

    // tenta detectar e fixar uma voz pt-BR preferida (padrão clássico). Alguns navegadores só retornam vozes após onvoiceschanged
    function pickPreferredVoice() {
        const synth = window.speechSynthesis;
        const voices = synth.getVoices ? synth.getVoices() : [];
        if (!voices || voices.length === 0) return;
        // preferir explicitamente a voz eSpeak PT-BR se disponível
        const exact = voices.find(v => (v.name||'').toLowerCase() === 'espeak portuguese (brazil)');
        if (exact) { window.__preferredVoiceName = exact.name; console.log('Preferred voice set to exact match', exact.name); return; }
        const preferenciaNomes = ['google português do brasil','português do brasil','pt-br','luciana','daniel','joão','joao','maria','brasil'];
        for (const pref of preferenciaNomes) {
            const found = voices.find(v => (v.name||'').toLowerCase().includes(pref) || (v.lang||'').toLowerCase().includes(pref));
            if (found) { window.__preferredVoiceName = found.name; console.log('Preferred voice set to', found.name); return; }
        }
        // fallback: primeira voz pt encontrada
        const pt = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('pt'));
        if (pt) { window.__preferredVoiceName = pt.name; console.log('Preferred voice fallback to', pt.name); }
    }
    if (window.speechSynthesis) {
        pickPreferredVoice();
        window.speechSynthesis.onvoiceschanged = pickPreferredVoice;
    }


/* ===== Lhama AI Live: hotword detection e sessão ao vivo (apenas áudio) ===== */
let hotwordRecognition = null;
let liveActive = false;
let liveRecognition = null;

function startHotwordListener() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    hotwordRecognition = new SR();
    hotwordRecognition.continuous = true;
    hotwordRecognition.interimResults = true;
    hotwordRecognition.lang = 'pt-BR';

    hotwordRecognition.onresult = (e) => {
        let transcript = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) transcript += e.results[i][0].transcript + ' ';
        transcript = transcript.toLowerCase();
        if (transcript.includes('hey lhama') || transcript.includes('ok lhama') || transcript.includes('oi lhama')) {
            // Hotword detectada
            triggerLiveMode();
        }
    };
    hotwordRecognition.onerror = (err) => {
        console.error('hotwordRecognition error:', err);
        const vt = document.getElementById('voice-toast');
        if (vt) { vt.textContent = 'Erro no reconhecimento de hotword'; vt.classList.add('show'); setTimeout(() => vt.classList.remove('show'), 3000); }
    };
    hotwordRecognition.onstart = () => { console.log('hotwordRecognition started'); };
    hotwordRecognition.onend = () => { console.log('hotwordRecognition ended'); if (!liveActive) setTimeout(() => hotwordRecognition && hotwordRecognition.start(), 400); };
    hotwordRecognition.start();
}

function stopHotwordListener() {
    if (hotwordRecognition) {
        try { hotwordRecognition.stop(); } catch(e){}
        try { hotwordRecognition.abort && hotwordRecognition.abort(); } catch(e){}
        hotwordRecognition = null;
    }
}

/**
 * Verifica se o SpeechRecognition está funcional (tenta iniciar uma instância curta).
 * Retorna Promise<boolean>.
 */
function verifySpeechRecognitionAvailable(timeout = 1500) {
    return new Promise((resolve) => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return resolve(false);
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        let tester = null;
        let finished = false;
        try {
            tester = new SR();
            tester.continuous = false;
            tester.interimResults = false;
            tester.lang = 'pt-BR';
            tester.onstart = () => { if (!finished) { finished = true; try { tester.stop(); } catch(e){}; resolve(true); } };
            tester.onerror = (e) => { if (!finished) { finished = true; resolve(false); } };
            tester.onend = () => { if (!finished) { finished = true; resolve(true); } };
            try { tester.start(); } catch (e) { finished = true; resolve(false); }
        } catch (err) {
            resolve(false);
        }
        // safety timeout
        setTimeout(() => { if (!finished) { finished = true; try { tester && tester.stop(); } catch(e){}; resolve(false); } }, timeout);
    });
}

// handler do botão de teste rápido (adicionado ao carregar)
// handler do botão de teste removido (debug removed)

function triggerLiveMode() {
    if (liveActive) return;
    liveActive = true;
    showLiveModal();
    // fala inicial de ativação
    lerTextoEmVoz('Lhama Live ativada. O que você deseja?');
    // start live recognition for conversation (only while modal open)
    startLiveRecognition();
}

function showLiveModal() {
    const modal = document.getElementById('live-modal');
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden','false');
    const closeBtn = document.getElementById('live-close');
    if (closeBtn) closeBtn.onclick = stopLiveMode;
}

function hideLiveModal() {
    const modal = document.getElementById('live-modal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden','true');
}

function stopLiveMode() {
    liveActive = false;
    hideLiveModal();
    stopLiveRecognition();
    // parar sessão full-screen também
    stopLiveSession();
}

function startLiveRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    liveRecognition = new SR();
    liveRecognition.continuous = false; // single query then respond
    liveRecognition.interimResults = false;
    liveRecognition.lang = 'pt-BR';

    liveRecognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        // adicionar mensagem do usuário no chat
        try { adicionarMensagem(text, 'usuario'); } catch (err) { console.warn('erro ao adicionar msg usuario:', err); }
        // processa por trás e responde (texto) baseado no treinamento
        const resposta = gerarResposta(text);
        // adiciona resposta como mensagem de bot no chat
        try { adicionarMensagem(resposta, 'bot'); } catch (err) { console.warn('erro ao adicionar msg bot:', err); }
        // fala a resposta
        lerTextoEmVoz(resposta);
        // após falar, escuta novamente enquanto modal aberto
        const onEnd = () => {
            if (liveActive) {
                setTimeout(() => { try { liveRecognition.start(); } catch(e){} }, 300);
            }
            liveRecognition.onend = null;
        };
        liveRecognition.onend = onEnd;
    };

    liveRecognition.onerror = (err) => { /* ignore */ };
    liveRecognition.onend = () => { if (liveActive) { try { liveRecognition.start(); } catch(e){} } };
    try { liveRecognition.start(); } catch(e) { console.warn(e); }
}

// Sessão Live full-screen: reconhecimento contínuo, sem mostrar transcrição na UI modal
let liveSessionRecognition = null;
function startLiveSession() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showVoiceToast && showVoiceToast('Reconhecimento de voz não disponível neste navegador', 3000);
        return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    liveSessionRecognition = new SR();
    liveSessionRecognition.continuous = true;
    liveSessionRecognition.interimResults = false; // não mostrar parciais
    liveSessionRecognition.lang = 'pt-BR';

    liveSessionRecognition.onresult = (e) => {
        try {
            const text = e.results[e.resultIndex][0].transcript;
            // adicionar ao chat como mensagem do usuário (por trás)
            adicionarMensagem(text, 'usuario');
            // gerar resposta com base em training.json
            const resp = gerarResposta(text);
            adicionarMensagem(resp, 'bot');
            // falar a resposta: pausar reconhecimento enquanto fala para evitar 'picote' e reiniciar depois
            try { liveSessionRecognition && liveSessionRecognition.stop(); } catch(e){}
            const utter = lerTextoEmVoz(resp);
            if (utter) {
                utter.onend = () => { try { if (liveSessionRecognition) liveSessionRecognition.start(); } catch(e){} };
            } else {
                try { if (liveSessionRecognition) liveSessionRecognition.start(); } catch(e){}
            }
        } catch (err) { console.error('Erro no liveSession onresult:', err); }
    };

    liveSessionRecognition.onerror = (err) => { console.error('liveSessionRecognition error:', err); };
    liveSessionRecognition.onend = () => { console.log('liveSessionRecognition ended'); if (liveSessionRecognition) { try { liveSessionRecognition.start(); } catch(e){} } };
    try { liveSessionRecognition.start(); } catch(e) { console.warn('Erro ao iniciar liveSessionRecognition:', e); }
}

function stopLiveSession() {
    if (liveSessionRecognition) {
        try { liveSessionRecognition.stop(); } catch(e){}
        liveSessionRecognition = null;
    }
}

function stopLiveRecognition() {
    if (liveRecognition) {
        try { liveRecognition.stop(); } catch(e){}
        liveRecognition = null;
    }
}
    // Iniciar uma nova conversa ao carregar (se você quiser)
    // iniciarNovaConversa();
});