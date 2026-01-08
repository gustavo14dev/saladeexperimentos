let treinamentos = [];
let historicoConversa = [];
let redacoesData = [];
let correcoesData = [];
let bancoImagens = {}; // Inicializada como objeto vazio para ser carregada via fetch.

// Estados dos Modos
let modoRedacaoAtivo = false;
let modoResumoAtivo = false;
let modoCorrecaoAtivo = false;
// Estados do Image 2
let modoImage2Ativo = false;
let modoImage2DesativadoManualmente = false;
let modoImage2Tipo = null; // 'simples' ou 'pessoa'
let modoImage2AtivadoManualmente = false;

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

// ===== FUNÇÕES IMAGE 2 =====
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
    const btnEnviar = document.getElementById('btn-enviar');
    const btnRedacao = document.getElementById('btn-redacao');
    const btnResumo = document.getElementById('btn-resumo');
    const btnCorrecao = document.getElementById('btn-correcao');

    let mensagem = input.value.trim();
    const isModoResumoAtivo = modoResumoAtivo;
    const isModoCorrecaoAtivo = modoCorrecaoAtivo;
    const isModoImage2Ativo = modoImage2Ativo;
    // Captura estado
    const tipoImage2Atual = modoImage2Tipo; // Captura tipo

    if (!mensagem) return;
    if (isModoResumoAtivo && !mensagem.toLowerCase().startsWith("resumir: ")) {
        mensagem = "resumir: " + mensagem;
    }

    input.disabled = true;
    if (btnEnviar) btnEnviar.disabled = true;
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
    setTimeout(() => {
        mostrarDigitando(false);
        const resposta = isModoCorrecaoAtivo ? gerarCorrecao(mensagem) : gerarResposta(mensagem);
        
        let imagemAssociada = null;
        
        // 1. Lógica IMAGE 2 (Prioridade)
        if (isModoImage2Ativo) {
            if (tipoImage2Atual === 'simples') {
                imagemAssociada = buscarImagemPorNome(mensagem);
                if (!imagemAssociada) {
                    adicionarMensagem('Não foi possível gerar essa imagem. Tente gerar outra coisa.', 'bot', null);
                    input.disabled = false;
                    
                    if (btnEnviar) btnEnviar.disabled = false;
                    input.focus();
                    return;
                }
                // Envia apenas a imagem no modo simples
                adicionarMensagem('', 'bot', imagemAssociada);
            } 
            else if (tipoImage2Atual === 'pessoa') {
                processarImage2Pessoa(mensagem);
                // processarImage2Pessoa já adiciona a mensagem, então retornamos
                input.disabled = false;
                if (btnEnviar) btnEnviar.disabled = false;
                input.focus();
                return;
            }
        } 
        // 2. Lógica de Resumo
        else if (isModoResumoAtivo) {
            const textoResumido = resposta.replace(/<[^>]*>/g, '');
            imagemAssociada = encontrarImagem(textoResumido);
            historicoConversa.push({ tipo: 'bot', texto: resposta });
            adicionarMensagem(resposta, 'bot', imagemAssociada);
        } 
        // 3. Lógica Padrão (busca imagem automática se não for correção)
        else {
            if (!isModoCorrecaoAtivo && !modoImage2DesativadoManualmente) {
                imagemAssociada = encontrarImagem(mensagem);
            }
            historicoConversa.push({ tipo: 'bot', texto: resposta });
            adicionarMensagem(resposta, 'bot', imagemAssociada);
        }

        input.disabled = false;
        input.focus();
        if (btnEnviar) btnEnviar.disabled = false;
    }, 1500);
}

// ===== LÓGICA DE GERAÇÃO (RESPOSTAS, RESUMOS, CORREÇÕES) =====

function gerarResposta(mensagemUsuario) {
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

    let maiorNumeroDePalavrasComuns = 0;
    treinamentos.forEach(t => {
        const palavrasTreinamento = t.pergunta.toLowerCase().split(/\W+/).filter(Boolean);
        const palavrasComuns = palavrasUsuario.filter(p => palavrasTreinamento.includes(p)).length;

        if (palavrasComuns > maiorNumeroDePalavrasComuns) {
            maiorNumeroDePalavrasComuns = palavrasComuns;
            melhorResposta = t.resposta;
        }
    });
    if (melhorResposta) {
        // Personalidade simples
        let personalidadeAtual = 'alegre';
        // Fixo ou variável global
        if (personalidadeAtual === 'alegre' && sentimento === 'triste') melhorResposta += ' 😊 Vai ficar tudo bem!';
        return formatarResposta(melhorResposta);
    } else {
        return formatarResposta(`Desculpe, ainda não fui treinada para isso 😬 Atualmente conheço mais de **${treinamentos.length}** tópicos. Tente me perguntar de outra forma!`);
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
    mensagemUsuario = mensagemUsuario.toLowerCase();
    const palavrasUsuario = new Set(mensagemUsuario.split(/\W+/).filter(Boolean));
    let melhorImagem = null;
    let maxPontos = 0;
    for (const imagem in bancoImagens) {
        const tags = bancoImagens[imagem];
        let pontos = 0;
        for (const tag of tags) {
            if (palavrasUsuario.has(tag)) pontos++;
        }
        if (pontos > maxPontos) {
            maxPontos = pontos;
            melhorImagem = imagem;
        }
    }
    return melhorImagem;
}

function buscarImagemPorNome(nomeBuscado) {
    nomeBuscado = nomeBuscado.toLowerCase().trim();
    for (const imagem in bancoImagens) {
        const tags = bancoImagens[imagem];
        for (const tag of tags) {
            if (tag.toLowerCase() === nomeBuscado || tag.toLowerCase().includes(nomeBuscado)) {
                return imagem;
            }
        }
    }
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
    const chatBox = document.getElementById('chat-box');
    const divMensagem = document.createElement('div');
    divMensagem.className = `mensagem ${tipo}`;
    const divContent = document.createElement('div');
    divContent.className = 'message-content';
    if (tipo === 'bot') {
        const textoSemHTML = texto.replace(/<[^>]*>/g, '');
        divContent.innerHTML = texto;
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

        divMensagem.appendChild(divContent);
        // Ações da Mensagem
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'message-actions-container';
        const btnCopy = document.createElement('button');
        btnCopy.className = 'action-icon-btn';
        btnCopy.innerHTML = '<span class="material-symbols-rounded">content_copy</span>';
        btnCopy.onclick = () => copiarTexto(textoSemHTML);
        actionsContainer.appendChild(btnCopy);
        const btnAudio = document.createElement('button');
        btnAudio.className = 'action-icon-btn audio-btn';
        btnAudio.innerHTML = '<span class="material-symbols-rounded">volume_up</span>';
        btnAudio.onclick = () => lerTextoEmVoz(textoSemHTML);
        actionsContainer.appendChild(btnAudio);
        if (imagemNome && !texto.includes('image2-composicao-container')) {
            const btnDownload = document.createElement('button');
            btnDownload.className = 'action-icon-btn';
            btnDownload.innerHTML = '<span class="material-symbols-rounded">download</span>';
            btnDownload.onclick = () => baixarImagem(`img-IA/${imagemNome}`);
            actionsContainer.appendChild(btnDownload);
        }
        divMensagem.appendChild(actionsContainer);

    } else {
        divContent.innerHTML = texto;
        divMensagem.appendChild(divContent);
    }
    
    chatBox.appendChild(divMensagem);
    scrollParaBaixo();
}

function scrollParaBaixo() {
    const chatBoxContainer = document.getElementById('chat-box-container');
    chatBoxContainer.scrollTo({ top: chatBoxContainer.scrollHeight, behavior: 'smooth' });
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
    u.lang = 'pt-BR';
    synth.speak(u);
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
    const btnAction = document.getElementById('btn-action');
    const iconAction = btnAction ?
    btnAction.querySelector('.icon-action') : null;
    if (!textarea || !btnAction || !iconAction) return;
    iconAction.textContent = textarea.value.trim().length > 0 ? 'arrow_upward' : 'mic';
}

function clicouBotaoAcao() {
    const textarea = document.getElementById('input-mensagem');
    if (textarea.value.trim().length > 0) enviarMensagem();
    else iniciarTranscricao();
}

// Transcrição de Voz
let isListening = false;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'pt-BR';

recognition.onstart = () => { isListening = true; document.getElementById('btn-action').classList.add('listening'); };
recognition.onend = () => { isListening = false; document.getElementById('btn-action').classList.remove('listening'); };
recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    document.getElementById('input-mensagem').value += text;
    atualizarBotaoAudioEnviar();
};
function iniciarTranscricao() {
    if (!isListening) recognition.start();
    else recognition.stop();
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

    // Iniciar uma nova conversa ao carregar (se você quiser)
    // iniciarNovaConversa();
});