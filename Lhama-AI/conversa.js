let treinamentos = [];
let historicoConversa = [];
let bancoImagens = {}; // Inicializada como objeto vazio para ser carregada via fetch.

// Modos de funcionalidade
let modoImagemAtivo = false;

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
        if (btnImagem) {
            btnImagem.classList.remove('active');
            btnImagem.innerHTML = '<span class="material-icons-outlined">image</span>';
        }
        input.placeholder = 'Olá! Pergunte-me qualquer coisa...';
    } else {
        modoImagemAtivo = true;
        if (btnImagem) {
            btnImagem.classList.add('active');
            btnImagem.innerHTML = '<span class="material-icons-outlined">close</span>';
        }
        input.placeholder = 'Descreva a imagem que você quer gerar...';
        input.value = '';
        input.focus();
    }
}

function mostrarGerandoImagem() {
    const chatBox = document.getElementById('chat-box');
    const divMensagem = document.createElement('div');
    divMensagem.className = 'mensagem bot';
    divMensagem.id = 'gerando-imagem-msg';
    
    divMensagem.innerHTML = `
        <div class="message-content">
            <div class="gerando-imagem-card">
                <div class="gerando-imagem-container">
                    <div class="gerando-imagem-icon">
                        <div class="icon-spinner">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" 
                                      stroke="url(#gradient)" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 4">
                                    <animate attributeName="stroke-dashoffset" values="0;8" dur="1s" repeatCount="indefinite"/>
                                </path>
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
                                        <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                    <div class="gerando-imagem-content">
                        <div class="gerando-imagem-titulo">Gerando Imagem</div>
                        <div class="gerando-imagem-texto">
                            Criando sua imagem<span class="pontos">...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    chatBox.appendChild(divMensagem);
    
    // Animação dos pontos
    const pontos = divMensagem.querySelector('.pontos');
    let contador = 0;
    const animacao = setInterval(() => {
        contador = (contador + 1) % 4;
        pontos.textContent = '.'.repeat(contador || 1);
    }, 500);
    // Salvar referência da animação para parar depois
    divMensagem.animacaoInterval = animacao;
    
    // Scroll para a mensagem
    const container = document.getElementById('chat-box-container');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

function removerGerandoImagem() {
    const msg = document.getElementById('gerando-imagem-msg');
    if (msg) {
        if (msg.animacaoInterval) {
            clearInterval(msg.animacaoInterval);
        }
        msg.remove();
    }
}

async function gerarImagem(prompt) {
    console.log('[IMAGEM] Gerando imagem com Pollinations AI:', prompt);
    
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
                return "🔐 Erro de autenticação com Pollinations AI.";
            } else if (response.status === 429) {
                return "⏱️ Muitas requisições. Tente novamente em alguns segundos.";
            } else if (response.status === 500) {
                return "🔧 Servidor Pollinations AI indisponível. Tente novamente.";
            } else {
                return `Erro na API Pollinations: ${errorText || response.statusText}`;
            }
        }

        const data = await response.json();
        console.log('[IMAGEM] Dados recebidos:', data);
        
        if (data.data && data.data.length > 0 && data.data[0].url) {
            const imageUrl = data.data[0].url;
            console.log('[IMAGEM] Imagem gerada com sucesso!');
            
            // Retornar HTML da imagem sem a assinatura
            return `<div class="imagem-gerada-container">
                <img src="${imageUrl}" alt="Imagem gerada" class="imagem-gerada" />
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

function enviarMensagem() {
    const input = document.getElementById('input-mensagem');
    const btnEnviar = document.getElementById('btn-send');
    const inputAreaContainer = document.querySelector('.input-area-container');

    let mensagem = input.value.trim();

    if (!mensagem) return;

    // Inicia animação de onda colorida
    if (inputAreaContainer) {
        // efeito sutil de destaque ao enviar (pode ser removido)
        inputAreaContainer.classList.add('wave-animation');
        setTimeout(() => { inputAreaContainer.classList.remove('wave-animation'); }, 600);
    }

    input.disabled = true;
    if (btnEnviar) {
        btnEnviar.disabled = true;
        btnEnviar.classList.add('sending');
    }

    historicoConversa.push({ tipo: 'usuario', texto: mensagem });
    adicionarMensagem(mensagem, 'usuario');
    
    input.value = '';
    input.style.height = '';
    input.classList.remove('scrolling');
    atualizarBotaoAudioEnviar();

    // Fazer requisição sem setTimeout para evitar delay visual
    (async () => {
        let resposta;
        
        // Se está em modo de imagem, gera imagem
        if (modoImagemAtivo) {
            mostrarGerandoImagem(); // Mostrar card de carregamento
            resposta = await gerarImagem(mensagem);
            removerGerandoImagem(); // Remover card de carregamento
            
            // Adiciona a imagem gerada
            historicoConversa.push({ tipo: 'bot', texto: 'Imagem gerada' });
            adicionarMensagem(resposta, 'bot', null);
        } else {
            mostrarDigitando(true);  // MANTÉM o indicador
            // Senão, usa resposta normal da API
            resposta = await gerarResposta(mensagem, historicoConversa);
            mostrarDigitando(false);  // REMOVE o indicador quando resposta chegar
            
            let imagemAssociada = null;
            
            // imagemAssociada = encontrarImagem(mensagem); // Função removida
            imagemAssociada = null;
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
        // Verificar se é uma imagem gerada (contém HTML de imagem)
        if (texto.includes('imagem-gerada-container')) {
            // Adicionar mensagem de imagem diretamente sem animação
            divContent.innerHTML = texto;
            divMensagem.appendChild(divContent);
            chatBox.appendChild(divMensagem);
            
            // Adicionar botões de ação para imagem
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'message-actions-container';
            
            const btnCopy = document.createElement('button');
            btnCopy.className = 'action-icon-btn';
            btnCopy.innerHTML = '<span class="material-icons-outlined" style="font-size: 14px;">content_copy</span> <span>Copiar URL</span>';
            btnCopy.onclick = () => {
                const imgElement = divContent.querySelector('.imagem-gerada');
                if (imgElement) {
                    navigator.clipboard.writeText(imgElement.src);
                }
            };
            actionsContainer.appendChild(btnCopy);
            
            const btnDownload = document.createElement('button');
            btnDownload.className = 'action-icon-btn';
            btnDownload.innerHTML = '<span class="material-icons-outlined" style="font-size: 14px;">download</span> <span>Download</span>';
            btnDownload.onclick = () => {
                const imgElement = divContent.querySelector('.imagem-gerada');
                if (imgElement) {
                    baixarImagem(imgElement.src);
                }
            };
            actionsContainer.appendChild(btnDownload);
            
            divMensagem.appendChild(actionsContainer);
        } else {
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
        }
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

// ===== FUNÇÃO MELHORADA COM RETRY AUTOMÁTICO - VIA PROXY OTIMIZADO =====
async function gerarImagemComRetry(prompt) {
    console.log('[IMAGEM] Gerando imagem com Pollinations AI (via proxy):', prompt);
    
    const maxRetries = 3;
    const retryDelay = 2000; // 2 segundos entre tentativas
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[IMAGEM] Tentativa ${attempt}/${maxRetries}`);
            
            // Usar proxy otimizado para evitar CORS
            const response = await fetch('/api/flux-proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt
                })
            });

            console.log('[IMAGEM] Status do proxy:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[IMAGEM] Erro no proxy:', response.status, errorText);
                
                // Se for erro 502/503 e ainda temos tentativas, tentar novamente
                if ((response.status === 502 || response.status === 503 || response.status === 429) && attempt < maxRetries) {
                    console.log(`[IMAGEM] Erro ${response.status} detectado, tentando novamente em ${retryDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    continue;
                }
                
                if (response.status === 401) {
                    return "🔐 Erro de autenticação com Pollinations AI.";
                } else if (response.status === 429) {
                    return "⏱️ Muitas requisições. Tente novamente em alguns segundos.";
                } else if (response.status === 500 || response.status === 502 || response.status === 503) {
                    return "⚠️ Serviço Pollinations AI temporariamente indisponível. Tente novamente em alguns minutos.";
                } else {
                    return `Erro na API Pollinations: ${errorText || response.statusText}`;
                }
            }

            const data = await response.json();
            console.log('[IMAGEM] Dados recebidos do proxy:', data);
            
            if (data.data && data.data.length > 0 && data.data[0].url) {
                const imageUrl = data.data[0].url;
                console.log('[IMAGEM] Imagem gerada com sucesso!');

                // Adicionar timestamp para evitar cache
                const timestampedImageUrl = `${imageUrl}?t=${Date.now()}`;

                return `<div class="imagem-gerada-container">
                    <img src="${timestampedImageUrl}" alt="Imagem gerada por Pollinations AI" class="imagem-gerada" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2NjY2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkVycm8gYW8gY2FycmVnYXIgaW1hZ2VtPC90ZXh0Pjwvc3ZnPg=='" />
                </div>`;
            } else {
                console.error('[IMAGEM] Estrutura de resposta inválida');
                return "Desculpe, não consegui gerar a imagem. Tente novamente.";
            }

        } catch (erro) {
            console.error(`[IMAGEM] Erro na tentativa ${attempt}:`, erro);
            
            // Se for erro de rede e ainda temos tentativas, tentar novamente
            if ((erro.message.includes('fetch') || erro.message.includes('network') || erro.message.includes('CORS')) && attempt < maxRetries) {
                console.log(`[IMAGEM] Erro de rede/CORS detectado, tentando novamente em ${retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                continue;
            }
            
            if (attempt === maxRetries) {
                return "❌ Erro na API Pollinations após várias tentativas. O serviço pode estar temporariamente indisponível. Tente novamente em alguns minutos.";
            }
        }
    }
    
    return "❌ Não foi possível gerar a imagem após várias tentativas. Tente novamente mais tarde.";
}

// Substituir a função original
async function gerarImagem(prompt) {
    return await gerarImagemComRetry(prompt);
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
            const nameLower = (v.name||'').toLowerCase();
            const langLower = (v.lang||'').toLowerCase();
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
    const input = document.getElementById('input-mensagem');
    input.value = '';
    input.placeholder = "Converse com a Dora AI...";
    input.focus();
}

function ajustarAlturaTextarea(textarea) {
    if (!textarea) return;
    textarea.style.height = textarea.scrollHeight + 'px';
    textarea.classList.remove('scrolling');
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

// ===== FUNÇÕES FALTANTES =====

async function gerarResposta(mensagemUsuario, historicoConversa = []) {
    const mensagemOriginal = mensagemUsuario;
    mensagemUsuario = mensagemUsuario.toLowerCase();
    const sentimento = detectarSentimento(mensagemUsuario);
    const palavrasUsuario = mensagemUsuario.split(/\W+/).filter(Boolean);

    let melhorResposta = null;

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

// ===== LOAD EVENT LISTENER =====
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
});