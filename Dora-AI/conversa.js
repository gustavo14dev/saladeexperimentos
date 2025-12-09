let treinamentos = [];
let historicoConversa = [];
let temaAtual = 'amizade';
let personalidadeAtual = 'alegre';
let redacoesData = []; // Nova variável para armazenar os dados de redacoes.json
let correcoesData = []; // Nova variável para armazenar os dados de correcoes.json
let modoRedacaoAtivo = false; // Estado para controlar o botão visualmente
let modoResumoAtivo = false; // Novo estado para o modo Resumo
let modoCorrecaoAtivo = false; // Novo estado para o modo Correção

const bancoImagens = {
    'praia.png': ['praia', 'areia', 'litoral', 'verão', 'onda', 'baixada santista', 'msc', 'coqueiro', 'maré'],
    'mar.png': ['mar', 'oceano', 'água', 'azul', 'navegação', 'profundeza', 'salgado', 'atlântico'],
    'natureza.png': ['natureza', 'meio ambiente', 'ecossistema', 'biodiversidade', 'fauna', 'flora', 'bioma'],
    'floresta.png': ['floresta', 'mata', 'selva', 'árvore', 'amazônia', 'vegetação', 'desmatamento', 'madeira'],
    'clima.png': ['clima', 'tempo', 'meteorologia', 'chuva', 'tempestade', 'nuvem', 'furacão', 'aquecimento global', 'efeito estufa'],
    'universo.png': ['universo', 'espaço', 'galáxia', 'estrela', 'planeta', 'buraco negro', 'big bang', 'cosmo', 'astronomia'],
    'sol.png': ['sol', 'luz', 'calor', 'raio', 'nascer do sol', 'pôr do sol', 'dia'],
    'lua.png': ['lua', 'noite', 'fase', 'minguante', 'crescente', 'cheia', 'eclipse'],
    'cidade.png': ['cidade', 'urbano', 'metrópole', 'prédio', 'edifício', 'bairro', 'centro', 'asfalto'],
    'transito.png': ['trânsito', 'rua', 'avenida', 'semáforo', 'engarrafamento', 'transporte', 'mobilidade'],
    'carro.png': ['carro', 'automóvel', 'veículo', 'motor', 'rodas', 'combustível', 'estrada', 'dirigir'],
    'casa.png': ['casa', 'lar', 'moradia', 'abrigo', 'residência', 'quarto', 'sala', 'conforto', 'teto'],
    'escola.png': ['escola', 'sala de aula', 'ensino', 'educação', 'colégio', 'universidade', 'faculdade', 'curso', 'aluno'],
    'historia.png': ['história', 'passado', 'antiguidade', 'idade média', 'século', 'memória', 'civilização', 'museu'],
    'guerra.png': ['guerra', 'batalha', 'conflito', 'revolução', 'soldado', 'armas', 'exército', 'trincheira'],
    'politica.png': ['política', 'governo', 'estado', 'democracia', 'voto', 'eleição', 'presidente', 'poder', 'cidadão'],
    'direito.png': ['lei', 'justiça', 'direito', 'constituição', 'juiz', 'advogado', 'regra', 'norma', 'crime'],
    'filosofia.png': ['filosofia', 'pensamento', 'razão', 'ética', 'moral', 'sabedoria', 'sócrates', 'platão', 'ideia'],
    'religiao.png': ['religião', 'fé', 'deus', 'igreja', 'espiritualidade', 'sagrado', 'crença', 'oração', 'bíblia'],
    'matematica.png': ['matemática', 'número', 'cálculo', 'soma', 'divisão', 'lógica', 'equação', 'álgebra'],
    'geometria.png': ['geometria', 'triângulo', 'círculo', 'quadrado', 'ângulo', 'forma', 'polígono', 'pitágoras'],
    'fisica.png': ['física', 'energia', 'força', 'velocidade', 'inércia', 'movimento', 'newton', 'einstein', 'gravidade'],
    'quimica.png': ['química', 'reação', 'substância', 'mistura', 'tabela periódica', 'elemento', 'ácido', 'laboratório'],
    'atomo.png': ['átomo', 'molécula', 'elétron', 'próton', 'nêutron', 'partícula', 'nuclear', 'radioatividade'],
    'dna.png': ['dna', 'genética', 'gene', 'hereditariedade', 'cromossomo', 'clone', 'mutação'],
    'celula.png': ['célula', 'microscópio', 'núcleo', 'membrana', 'mitocôndria', 'biologia'],
    'anatomia.png': ['anatomia', 'corpo humano', 'órgão', 'ossos', 'esqueleto', 'pele', 'músculo', 'sangue'],
    'cerebro.png': ['cérebro', 'mente', 'neurônio', 'pensar', 'inteligência', 'memória', 'raciocínio', 'cabeça'],
    'coracao.png': ['coração', 'cardíaco', 'pulsação', 'veia', 'artéria', 'circulação', 'amor'],
    'virus.png': ['vírus', 'bactéria', 'microrganismo', 'infecção', 'gripe', 'contágio', 'epidemia', 'parasita'],
    'hospital.png': ['hospital', 'médico', 'enfermeira', 'clínica', 'cirurgia', 'uti', 'emergência', 'ambulância'],
    'remedio.png': ['remédio', 'medicamento', 'vacina', 'comprimido', 'farmácia', 'cura', 'tratamento', 'terapia'],
    'robo.png': ['robô', 'ia', 'inteligência artificial', 'bot', 'automação', 'futuro', 'máquina', 'ciborgue'],
    'computador.png': ['computador', 'pc', 'notebook', 'hardware', 'processador', 'mouse', 'teclado', 'tela'],
    'codigo.png': ['código', 'programação', 'software', 'algoritmo', 'python', 'java', 'dev', 'script', 'bug'],
    'internet.png': ['internet', 'rede', 'wifi', 'web', 'online', 'conexão', 'site', 'navegador', 'nuvem'],
    'celular.png': ['celular', 'smartphone', 'aplicativo', 'app', 'mensagem', 'notificação', 'touch'],
    'seguranca.png': ['segurança', 'hacker', 'senha', 'proteção', 'firewall', 'vírus de computador', 'cibersegurança'],
    'dinheiro.png': ['dinheiro', 'moeda', 'dólar', 'real', 'nota', 'banco', 'pagamento', 'pix', 'caixa'],
    'grafico.png': ['gráfico', 'estatística', 'porcentagem', 'crescimento', 'lucro', 'prejuízo', 'dados', 'análise'],
    'mercado.png': ['mercado', 'bolsa de valores', 'ações', 'investimento', 'empresa', 'negócio', 'comércio', 'venda'],
    'bitcoin.png': ['bitcoin', 'criptomoeda', 'blockchain', 'digital', 'token', 'nft', 'carteira digital'],
    'trabalho.png': ['trabalho', 'emprego', 'profissão', 'carreira', 'escritório', 'chefe', 'funcionário', 'rh'],
    'livro.png': ['livro', 'leitura', 'página', 'capítulo', 'texto', 'escrita', 'autor', 'biblioteca', 'literatura'],
    'musica.png': ['música', 'canção', 'som', 'ritmo', 'melodia', 'instrumento', 'cantor', 'banda', 'show'],
    'arte.png': ['arte', 'pintura', 'quadro', 'escultura', 'desenho', 'artista', 'cor', 'criatividade'],
    'filme.png': ['filme', 'cinema', 'vídeo', 'série', 'ator', 'atriz', 'hollywood', 'pipoca', 'tela'],
    'comida.png': ['comida', 'alimento', 'refeição', 'jantar', 'almoço', 'lanche', 'nutrição', 'fome', 'sabor'],
    'esporte.png': ['esporte', 'futebol', 'jogo', 'atleta', 'bola', 'competição', 'time', 'ginástica'],
    'emocao.png': ['feliz', 'triste', 'choro', 'riso', 'raiva', 'sentimento', 'emoção', 'ansiedade', 'depressão'],
    'dora.png': ['dora ai', 'amiga virtual', 'sou uma ia', 'ajudante', 'assistente', 'chatbot']
};

function mostrarAnuncio() {
    const overlay = document.createElement('div');
    overlay.id = 'anuncio-overlay';
    overlay.className = 'anuncio-overlay';
    overlay.innerHTML = `
        <div class="anuncio-container">
            <div class="titulo-com-badge">
                <h2 class="titulo-animado">Dora AI 1.4 Beta</h2>
            </div>

            <div class="anuncio-texto">
            <ul>
                    <li>Mais inteligente</li>
                    <li>1.600 novos treinamentos</li>
                    <li>Design premium, e mais suave</li>
                    <li>Modo de transcrição de áudio para texto, e texto para áudio</li>
                    <li>Interface aprimorada estilo moderno</li>
                    <li>Correção de erros de resposta</li>
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

// --- Função Nova para o botão de "Redação" (Toggle Ligar/Desligar) ---
function alternarModoRedacao() {
    const input = document.getElementById('input-mensagem');
    const btnRedacao = document.getElementById('btn-redacao');
    const textoPrefixo = "Pode me ajudar a escrever uma redação sobre ";
    
    // Desliga os outros modos se estiverem ativos
    if (modoResumoAtivo) alternarModoResumo();
    if (modoCorrecaoAtivo) alternarModoCorrecao();

    // Verifica se já está ativo para DESLIGAR
    if (modoRedacaoAtivo) {
        modoRedacaoAtivo = false;
        btnRedacao.classList.remove('active');

        // Remove o texto do input apenas se ele começar com o prefixo
        if (input.value.startsWith(textoPrefixo)) {
            // Remove o prefixo
            input.value = input.value.replace(textoPrefixo, '');
        }
    } 
    // Se não estiver ativo, LIGAR
    else {
        modoRedacaoAtivo = true;
        btnRedacao.classList.add('active');
        
        // Insere o texto se ainda não estiver lá
        if (!input.value.startsWith(textoPrefixo)) {
            input.value = textoPrefixo + input.value;
        }
        
        input.focus();
        // Move o cursor para o final
        const val = input.value;
        input.value = '';
        input.value = val;
    }
}

// --- Função Nova para o botão de "Resumo" ---
function alternarModoResumo() {
    const input = document.getElementById('input-mensagem');
    const btnResumo = document.getElementById('btn-resumo');
    const placeholderAtivo = "Cole o texto que você deseja resumir aqui...";
    const placeholderInativo = "Envie uma mensagem para Dora AI...";

    // Desliga os outros modos se estiverem ativos
    if (modoRedacaoAtivo) alternarModoRedacao();
    if (modoCorrecaoAtivo) alternarModoCorrecao();

    // Verifica se já está ativo para DESLIGAR
    if (modoResumoAtivo) {
        modoResumoAtivo = false;
        btnResumo.classList.remove('active');
        input.placeholder = placeholderInativo;
        if (input.value.startsWith("resumir: ")) {
            input.value = '';
        }
    } 
    // Se não estiver ativo, LIGAR
    else {
        modoResumoAtivo = true;
        btnResumo.classList.add('active');
        input.placeholder = placeholderAtivo;
        input.value = 'resumir: ';
        input.focus();
    }
}

// --- Função Nova para o botão de "Correção" ---
function alternarModoCorrecao() {
    const input = document.getElementById('input-mensagem');
    const btnCorrecao = document.getElementById('btn-correcao');
    const placeholderAtivo = "Cole o texto que você deseja corrigir aqui...";
    const placeholderInativo = "Envie uma mensagem para Dora AI...";

    // Desliga outros modos se estiverem ativos
    if (modoRedacaoAtivo) alternarModoRedacao();
    if (modoResumoAtivo) alternarModoResumo();

    if (modoCorrecaoAtivo) {
        modoCorrecaoAtivo = false;
        btnCorrecao.classList.remove('active');
        input.placeholder = placeholderInativo;
        input.value = '';
    } else {
        modoCorrecaoAtivo = true;
        btnCorrecao.classList.add('active');
        input.placeholder = placeholderAtivo;
        input.value = '';
        input.focus();
    }
}


function enviarMensagem() {
    const input = document.getElementById('input-mensagem');
    const btnEnviar = document.getElementById('btn-enviar');
    const btnRedacao = document.getElementById('btn-redacao');
    const btnResumo = document.getElementById('btn-resumo');
    const btnCorrecao = document.getElementById('btn-correcao');
    let mensagem = input.value.trim();
    const isModoResumoAtivo = modoResumoAtivo; // Captura o estado antes de resetar
    const isModoCorrecaoAtivo = modoCorrecaoAtivo; // Captura o estado da correção

    if (!mensagem) return;

    if (isModoResumoAtivo) {
        if (!mensagem.toLowerCase().startsWith("resumir: ")) {
            mensagem = "resumir: " + mensagem;
        }
    }

    input.disabled = true;
    if (btnEnviar) btnEnviar.disabled = true;

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
    // Reset altura do textarea ao enviar
    input.style.height = '';
    input.classList.remove('scrolling');
    
    // Atualizar botão de áudio/enviar (volta para mic já que a caixa está vazia)
    atualizarBotaoAudioEnviar();

    mostrarDigitando(true);

    setTimeout(() => {
        mostrarDigitando(false);
        const resposta = isModoCorrecaoAtivo ? gerarCorrecao(mensagem) : gerarResposta(mensagem);
        
        // Lógica de imagem aprimorada
        let imagemAssociada = null;
        if (isModoResumoAtivo) {
            // Se for um resumo, busca a imagem com base no CONTEÚDO do resumo
            const textoResumido = resposta.replace(/<[^>]*>/g, ''); // Limpa HTML para análise
            imagemAssociada = encontrarImagem(textoResumido);
        } else if (!isModoCorrecaoAtivo) { // Não gera imagem para correções
            // Comportamento normal
            imagemAssociada = encontrarImagem(mensagem);
        }

        historicoConversa.push({ tipo: 'bot', texto: resposta });
        adicionarMensagem(resposta, 'bot', imagemAssociada);

        input.disabled = false;
        input.focus();
        if (btnEnviar) btnEnviar.disabled = false;
    }, 1500);
}

// ====== Auto-resize do textarea (cresce até um limite, depois scroll interno) ======
function ajustarAlturaTextarea(textarea) {
    if (!textarea) return;
    // calcula o limite em pixels baseado na viewport (ajusta para mobile)
    const capPercent = window.innerWidth <= 480 ? 0.30 : 0.45; // 30% em celulares, 45% em telas maiores
    const maxHeight = Math.round(window.innerHeight * capPercent);
    // reset para calcular corretamente
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    if (scrollHeight > maxHeight) {
        textarea.style.height = maxHeight + 'px';
        textarea.classList.add('scrolling');
    } else {
        textarea.style.height = scrollHeight + 'px';
        textarea.classList.remove('scrolling');
    }
}

function mostrarDigitando(mostrar) {
    const chatBox = document.getElementById('chat-box');
    const digitandoElement = document.getElementById('digitando');
    
    if (mostrar) {
        if (!digitandoElement) {
            const div = document.createElement('div');
            div.id = 'digitando';
            div.className = 'mensagem bot digitando';
            div.innerHTML = '<div class="message-content">Dora AI está pensando...</div>';
            chatBox.appendChild(div);
        }
    } else {
        if (digitandoElement) digitandoElement.remove();
    }
    scrollParaBaixo();
}

function gerarResposta(mensagemUsuario) {
    const mensagemOriginal = mensagemUsuario; 
    mensagemUsuario = mensagemUsuario.toLowerCase();
    const sentimento = detectarSentimento(mensagemUsuario);
    const palavrasUsuario = mensagemUsuario.split(/\W+/).filter(Boolean);

    let melhorResposta = null;
    const textoPrefixoRedacao = "pode me ajudar a escrever uma redação sobre ";

    if (mensagemUsuario.startsWith("resumir: ")) {
        const textoParaResumir = mensagemOriginal.substring("resumir: ".length).trim();
        if (textoParaResumir.length < 150) { 
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
            let respostaRedacao = `Com certeza! Aqui estão alguns tópicos e ideias para você começar sua redação sobre **${redacaoEncontrada.tema.toUpperCase()}**:\n\n`;
            
            respostaRedacao += `**Sugestões para a Introdução:**\n`;
            redacaoEncontrada.topicos.introducao.forEach(topico => {
                respostaRedacao += `• ${topico}\n`;
            });
            respostaRedacao += `\n**Sugestões para o Desenvolvimento:**\n`;
            redacaoEncontrada.topicos.desenvolvimento.forEach(topico => {
                respostaRedacao += `• ${topico}\n`;
            });
            respostaRedacao += `\n**Sugestões para a Conclusão:**\n`;
            redacaoEncontrada.topicos.conclusao.forEach(topico => {
                respostaRedacao += `• ${topico}\n`;
            });
            
            return formatarResposta(respostaRedacao);
        } else {
            const temasDisponiveis = redacoesData.map(r => r.tema).join(', ');
            return `Desculpe, não encontrei tópicos sobre **${temaSolicitado}**. Os temas que eu conheço são: ${temasDisponiveis}.`;
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
        melhorResposta = adicionarTomPersonalidade(melhorResposta, sentimento);
        return formatarResposta(melhorResposta);
    } else {
        const numeroTreinamentos = treinamentos.length;
        return formatarResposta(`Desculpe, ainda não fui treinada para isso 😬 Atualmente conheço mais de **${numeroTreinamentos}** tópicos. Tente me perguntar de outra forma! 😁 Você também pode clicar no botão "Redação" para me pedir ajuda com temas específicos.`);
    }
}

// --- ALGORITMO DE CORREÇÃO ---
function gerarCorrecao(texto) {
    if (!correcoesData || !correcoesData.regras) {
        return "Desculpe, o módulo de correção não está carregado. Tente novamente em instantes.";
    }

    let textoCorrigido = texto;
    let correcoesFeitas = 0;

    for (const regra of correcoesData.regras) {
        // Cria uma RegExp para encontrar a palavra/frase errada, ignorando o caso e garantindo que seja uma palavra inteira
        const regex = new RegExp(`\\b${regra.errado}\\b`, 'gi');
        
        if (regex.test(textoCorrigido)) {
            // Conta apenas se a substituição realmente for acontecer
            textoCorrigido = textoCorrigido.replace(regex, (match) => {
                correcoesFeitas++;
                // Retorna a palavra correta envolta em <mark> para destaque
                return `<mark>${regra.correto}</mark>`;
            });
        }
    }

    if (correcoesFeitas === 0) {
        return "Não encontrei nenhum erro para corrigir. Parece que seu texto está ótimo! 👍";
    }

    let respostaFormatada = '<div class="resumo-card">';
    respostaFormatada += '<h3><span class="material-symbols-rounded">edit_note</span> Texto Corrigido</h3>';
    respostaFormatada += `<p>${textoCorrigido}</p>`;
    respostaFormatada += '</div>';

    return respostaFormatada;
}


// --- ALGORITMO DE RESUMO INTELIGENTE "GÊNIO DA SÍNTESE" ---
function gerarResumo(texto) {
    const stopWords = new Set(['de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'numa', 'pelos', 'elas', 'havia', 'seja', 'qual', 'será', 'nós', 'tenho', 'lhe', 'deles', 'essas', 'esses', 'pelas', 'este', 'fosse', 'dele', 'tu', 'te', 'vocês', 'vos', 'lhes', 'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas', 'nosso', 'nossa', 'nossos', 'nossas', 'dela', 'delas', 'esta', 'estes', 'estas', 'aquele', 'aquela', 'aqueles', 'aquelas', 'isto', 'aquilo', 'estou', 'está', 'estamos', 'estão', 'estive', 'esteve', 'estivemos', 'estiveram', 'estava', 'estávamos', 'estavam', 'estivera', 'estivéramos', 'esteja', 'estejamos', 'estejam', 'estivesse', 'estivéssemos', 'estivessem', 'estiver', 'estivermos', 'estiverem', 'hei', 'há', 'havemos', 'hão', 'houve', 'houvemos', 'houveram', 'houvera', 'houvéramos', 'haja', 'hajamos', 'hajam', 'houvesse', 'houvéssemos', 'houvessem', 'houver', 'houvermos', 'houverem', 'houverei', 'houverá', 'houveremos', 'houverão', 'houveria', 'houveríamos', 'houveriam', 'sou', 'somos', 'são', 'era', 'éramos', 'eram', 'fui', 'foi', 'fomos', 'foram', 'fora', 'fôramos', 'seja', 'sejamos', 'sejam', 'fosse', 'fôssemos', 'fossem', 'for', 'formos', 'forem', 'serei', 'será', 'seremos', 'serão', 'seria', 'seríamos', 'seriam', 'tenho', 'tem', 'temos', 'tém', 'tinha', 'tínhamos', 'tinham', 'tive', 'teve', 'tivemos', 'tiveram', 'tivera', 'tivéramos', 'tenha', 'tenhamos', 'tenham', 'tivesse', 'tivéssemos', 'tivessem', 'tiver', 'tivermos', 'tiverem', 'terei', 'terá', 'teremos', 'terão', 'teria', 'teríamos', 'teriam']);

    const sentencas = texto.match(/[^.!?]+[.!?]+/g) || [];
    if (sentencas.length < 5) { // Aumenta o requisito mínimo
        return "O texto é muito curto para um resumo de qualidade. Tente um texto com pelo menos 5 frases.";
    }

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
            if (frequenciaPalavras[palavra]) {
                pontuacao += frequenciaPalavras[palavra];
            }
        });

        if (index < 2 || index >= sentencas.length - 2) {
            pontuacao *= 1.2;
        }
        
        if (palavrasSentenca.length < 5 || palavrasSentenca.length > 35) { // Ajuste no tamanho
            pontuacao *= 0.8;
        }

        const pontuacaoNormalizada = palavrasSentenca.length > 0 ? pontuacao / palavrasSentenca.length : 0;

        return { sentenca, pontuacao: pontuacaoNormalizada, index };
    });

    pontuacaoSentencas.sort((a, b) => b.pontuacao - a.pontuacao);

    // Lógica dinâmica para o número de sentenças: ajustada para ser mais generosa.
    const numeroSentencasResumo = Math.max(5, Math.min(10, Math.floor(sentencas.length / 2.5)));
    
    const melhoresSentencas = pontuacaoSentencas.slice(0, numeroSentencasResumo);

    melhoresSentencas.sort((a, b) => a.index - b.index);

    let respostaFormatada = '<div class="resumo-card">';
    respostaFormatada += '<h3><span class="material-symbols-rounded">insights</span> Pontos Principais do Texto</h3>';
    respostaFormatada += '<ul>';
    melhoresSentencas.forEach(item => {
        respostaFormatada += `<li>${item.sentenca.trim()}</li>`;
    });
    respostaFormatada += '</ul></div>';

    return respostaFormatada;
}

function encontrarImagem(mensagemUsuario) {
    mensagemUsuario = mensagemUsuario.toLowerCase();
    const palavrasUsuario = new Set(mensagemUsuario.split(/\W+/).filter(Boolean)); // Usar Set para eficiência
    
    let melhorImagem = null;
    let maxPontos = 0;

    // Itera sobre cada imagem e suas tags no banco de imagens
    for (const imagem in bancoImagens) {
        const tags = bancoImagens[imagem];
        let pontos = 0;
        
        // Conta quantas palavras do usuário correspondem às tags da imagem
        for (const tag of tags) {
            if (palavrasUsuario.has(tag)) {
                pontos++;
            }
        }
        
        // Se a imagem atual tiver mais correspondências que a melhor até agora, atualiza
        if (pontos > maxPontos) {
            maxPontos = pontos;
            melhorImagem = imagem;
        }
    }
    
    // Retorna a imagem com a maior pontuação, ou null se nenhuma correspondência for encontrada
    return melhorImagem;
}

function detectarSentimento(mensagem) {
    const palavrasTristes = ['triste', 'chateado', 'deprimido', 'mal', 'sozinho', 'cansado', 'chorar'];
    const palavrasFelizes = ['feliz', 'contente', 'animado', 'bem', 'ótimo', 'maravilhoso', 'alegre'];
    
    for (let p of palavrasTristes) if (mensagem.includes(p)) return 'triste';
    for (let p of palavrasFelizes) if (mensagem.includes(p)) return 'feliz';
    return 'neutro';
}

function adicionarTomPersonalidade(resposta, sentimento) {
    if (personalidadeAtual === 'alegre' && sentimento === 'triste') return resposta + ' 😊 Vai ficar tudo bem!';
    if (personalidadeAtual === 'seria' && sentimento === 'feliz') return resposta + ' 😌 Fico contente.';
    if (personalidadeAtual === 'engracada' && sentimento === 'neutro') return resposta + ' 😄';
    return resposta;
}

function formatarResposta(texto) {
    texto = texto.replace(/\*\*(.*?)\*\*/g, '<strong></strong>');
    texto = texto.replace(/\n/g, '<br>'); // Converte quebras de linha em <br> para a formatação correta
    return texto;
}

// --- FUNÇÃO PRINCIPAL DE ADICIONAR MENSAGEM (REDESIGN TOTAL) ---
function adicionarMensagem(texto, tipo, imagemNome = null) {
    const chatBox = document.getElementById('chat-box');
    const divMensagem = document.createElement('div');
    divMensagem.className = `mensagem ${tipo}`;
    
    // Cria o container do conteúdo da mensagem (a bolha)
    const divContent = document.createElement('div');
    divContent.className = 'message-content';

    if (tipo === 'bot') {
        const textoSemHTML = texto.replace(/<[^>]*>/g, '');
        
        // 1. Adiciona o Texto
        divContent.innerHTML = texto;
        
        // 2. Se tiver imagem, adiciona o Skeleton Loader (Efeito Premium)
        if (imagemNome) {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'imagem-container-premium';
            imgContainer.innerHTML = '<div class="skeleton-loader"></div>'; // O efeito de brilho
            divContent.appendChild(imgContainer);
            
            // Carrega a imagem real em segundo plano
            const img = new Image();
            img.src = `img-IA/${imagemNome}`;
            img.className = 'imagem-resposta-premium';
            img.alt = "Imagem gerada por IA";
            
            img.onload = () => {
                // Quando carregar, substitui o skeleton pela imagem com fade-in
                 setTimeout(() => {
                    imgContainer.innerHTML = ''; // Limpa o skeleton
                    imgContainer.appendChild(img);
                    scrollParaBaixo();
                 }, 1000); // Pequeno delay dramático para o efeito skeleton aparecer
            };
             img.onerror = () => {
                 imgContainer.innerHTML = '<span style="font-size:12px; color:#999;">Erro ao gerar imagem.</span>';
             };
        }

        // 3. Adiciona a bolha de conteúdo ao container principal da mensagem
        divMensagem.appendChild(divContent);

        // 4. Cria o container de Ações (Ícones abaixo da bolha)
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'message-actions-container';

        // Botão Copiar (Ícone)
        const btnCopy = document.createElement('button');
        btnCopy.className = 'action-icon-btn';
        btnCopy.title = "Copiar resposta";
        btnCopy.innerHTML = '<span class="material-symbols-rounded">content_copy</span>';
        btnCopy.onclick = () => copiarTexto(textoSemHTML);
        actionsContainer.appendChild(btnCopy);

        // Botão Áudio (Ícone) - Text-to-Speech
        const btnAudio = document.createElement('button');
        btnAudio.className = 'action-icon-btn audio-btn';
        btnAudio.title = "Ouvir resposta";
        btnAudio.innerHTML = '<span class="material-symbols-rounded">volume_up</span>';
        btnAudio.onclick = () => lerTextoEmVoz(textoSemHTML);
        actionsContainer.appendChild(btnAudio);

        // Botão Baixar (Ícone) - Só se tiver imagem
        if (imagemNome) {
            const btnDownload = document.createElement('button');
            btnDownload.className = 'action-icon-btn';
            btnDownload.title = "Baixar imagem";
            btnDownload.innerHTML = '<span class="material-symbols-rounded">download</span>';
            btnDownload.onclick = () => baixarImagem(`img-IA/${imagemNome}`);
            actionsContainer.appendChild(btnDownload);
        }

        divMensagem.appendChild(actionsContainer);

    } else {
        // Mensagem do usuário (simples)
        divContent.innerHTML = texto;
        divMensagem.appendChild(divContent);
    }
    
    chatBox.appendChild(divMensagem);
    scrollParaBaixo();
}

function scrollParaBaixo() {
     const chatBoxContainer = document.getElementById('chat-box-container');
     chatBoxContainer.scrollTo({
        top: chatBoxContainer.scrollHeight,
        behavior: 'smooth'
    });
}


// Funções auxiliares (Baixar/Copiar) mantidas, apenas sem os alertas nativos feios
function baixarImagem(srcImagem) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = srcImagem;
    
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const marca = new Image();
        marca.src = 'img-IA/marca-dagua.png';
        
        marca.onload = function() {
            // Lógica da marca d'água (mantida)
            const larguraMarca = Math.min(100, canvas.width * 0.2); // Máximo 100px ou 20% da largura
            const alturaMarca = larguraMarca * (marca.height / marca.width);
            ctx.globalAlpha = 0.6;
            ctx.drawImage(marca, canvas.width - larguraMarca - 20, canvas.height - alturaMarca - 20, larguraMarca, alturaMarca);
            
            const link = document.createElement('a');
            link.download = `DoraAI-Gerado-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        marca.onerror = function() {
             // Se não tiver marca d'água, baixa sem
             const link = document.createElement('a');
             link.download = `DoraAI-Gerado-${Date.now()}.png`;
             link.href = canvas.toDataURL('image/png');
             link.click();
        }
    };
}

function copiarTexto(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        // Feedback sutil poderia ser implementado aqui, tipo um "toast"
        console.log('Texto copiado'); 
    }).catch(console.error);
}

// --- NOVA FUNÇÃO PARA LIMPAR O CHAT ---
function iniciarNovaConversa() {
    historicoConversa = [];
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = `
        <div class="mensagem bot boas-vindas-inicial">
            <div class="message-content">
                Olá! Sou a Dora AI. Como posso te ajudar hoje? ✨
            </div>
        </div>
    `;

    // Desativa os modos de Redação ou Resumo se estiverem ativos
    if (modoRedacaoAtivo) {
        alternarModoRedacao();
    }
    if (modoResumoAtivo) {
        alternarModoResumo();
    }
    if (modoCorrecaoAtivo) { // Adiciona a verificação para o modo correção
        alternarModoCorrecao();
    }

    // Limpa e reseta o campo de input
    const input = document.getElementById('input-mensagem');
    input.value = '';
    input.placeholder = "Converse com a Dora AI...";
    input.focus();
}


fetch('training.json')
    .then(response => response.json()) 
    .then(data => treinamentos = data)
    .catch(error => console.error('Erro ao carregar treinamentos:', error));

// Carrega o redacoes.json
fetch('redacoes.json')
    .then(response => response.json())
    .then(data => redacoesData = data)
    .catch(error => console.error('Erro ao carregar redações:', error));

// Carrega o correcoes.json
fetch('correcoes.json')
    .then(response => response.json())
    .then(data => correcoesData = data)
    .catch(error => console.error('Erro ao carregar correções:', error));

// ====== CONTROLE DE VISIBILIDADE DOS BOTÕES (Áudio vs Enviar) ======
function atualizarBotaoAudioEnviar() {
    const textarea = document.getElementById('input-mensagem');
    const btnAction = document.getElementById('btn-action');
    const iconAction = btnAction ? btnAction.querySelector('.icon-action') : null;
    
    if (!textarea || !btnAction || !iconAction) return;
    
    const temTexto = textarea.value.trim().length > 0;
    
    if (temTexto) {
        // Mostrar ícone de enviar
        iconAction.textContent = 'arrow_upward';
    } else {
        // Mostrar ícone de microfone
        iconAction.textContent = 'mic';
    }
}

function clicouBotaoAcao() {
    const textarea = document.getElementById('input-mensagem');
    const temTexto = textarea.value.trim().length > 0;
    
    if (temTexto) {
        // Se tem texto, enviar mensagem
        enviarMensagem();
    } else {
        // Se não tem texto, iniciar transcrição
        iniciarTranscricao();
    }
}

// --- INICIALIZAÇÃO QUANDO O DOCUMENTO ESTIVER PRONTO ---
document.addEventListener('DOMContentLoaded', () => {
    // Mostra o anúncio de novidades apenas uma vez (persistente via localStorage).
    // Se localStorage não estiver disponível, usa sessionStorage como fallback.
    try {
        const already = localStorage.getItem('dora_announced');
        if (!already || already !== '1') {
            mostrarAnuncio();
            localStorage.setItem('dora_announced', '1');
        }
    } catch (e) {
        if (sessionStorage.getItem('dora_announced') !== '1') {
            mostrarAnuncio();
            sessionStorage.setItem('dora_announced', '1');
        }
    }

    // Adiciona o listener para o botão de nova conversa
    const newChatButton = document.getElementById('new-chat-btn');
    if (newChatButton) {
        newChatButton.addEventListener('click', iniciarNovaConversa);
    }
    
    // Setup: autoresize do textarea e atalho Enter (Enter = enviar, Shift+Enter = nova linha)
    const textarea = document.getElementById('input-mensagem');
    if (textarea) {
        // ajustar altura ao carregar (caso haja valor pré-carregado)
        ajustarAlturaTextarea(textarea);

        textarea.addEventListener('input', (e) => {
            ajustarAlturaTextarea(e.target);
            atualizarBotaoAudioEnviar(); // Atualizar visibilidade dos botões ao digitar
        });

        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                // envia mensagem
                enviarMensagem();
            }
        });
    }
});

// ====== WEB SPEECH API - TRANSCRIÇÃO DE ÁUDIO (SPEECH-TO-TEXT) ======
let isListening = false;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// Configurar o reconhecimento de fala
recognition.continuous = false;
recognition.interimResults = true;
recognition.lang = 'pt-BR';

recognition.onstart = () => {
    isListening = true;
    const btnMic = document.getElementById('btn-microphone');
    if (btnMic) {
        btnMic.classList.add('listening');
    }
};

recognition.onend = () => {
    isListening = false;
    const btnMic = document.getElementById('btn-microphone');
    if (btnMic) {
        btnMic.classList.remove('listening');
    }
};

recognition.onerror = (event) => {
    console.error('Erro no reconhecimento de fala:', event.error);
    isListening = false;
    const btnMic = document.getElementById('btn-microphone');
    if (btnMic) {
        btnMic.classList.remove('listening');
    }
};

recognition.onresult = (event) => {
    let isFinal = false;
    let transcript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        transcript += transcriptSegment;
        if (event.results[i].isFinal) {
            isFinal = true;
        }
    }

    const textarea = document.getElementById('input-mensagem');
    if (textarea && isFinal) {
        // Adiciona o texto transcrito ao input
        textarea.value += (textarea.value ? ' ' : '') + transcript;
        ajustarAlturaTextarea(textarea);
        textarea.focus();
    }
};

function iniciarTranscricao() {
    if (!isListening) {
        recognition.start();
    } else {
        recognition.stop();
    }
}

// ====== WEB SPEECH API - SÍNTESE DE ÁUDIO (TEXT-TO-SPEECH) ======
const synthesis = window.speechSynthesis;

function lerTextoEmVoz(texto, messageElement = null) {
    // Se houver áudio sendo tocado, para
    if (synthesis.speaking) {
        synthesis.cancel();
    }

    // Remove HTML tags do texto
    const textoLimpo = texto.replace(/<[^>]*>/g, '').trim();

    if (!textoLimpo) return;

    const utterance = new SpeechSynthesisUtterance(textoLimpo);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    synthesis.speak(utterance);
}