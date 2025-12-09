// 1. Banco de Dados dos Animais (20 opções)
// IMPORTANTE: Os nomes das imagens devem ser exatamente: id + .png (ex: golfinho.png)
const animals = [
    { id: 'golfinho', name: 'Golfinho', desc: 'Você é sociável, inteligente e adora brincar. Sabe se comunicar bem e protege seus amigos.' },
    { id: 'tubarao', name: 'Tubarão', desc: 'Determinado e focado. Você sabe o que quer e não tem medo de perseguir seus objetivos, às vezes intimidando os outros.' },
    { id: 'baleia', name: 'Baleia Azul', desc: 'Calmo, sábio e com um coração gigante. Você tem uma presença pacífica, mas poderosa.' },
    { id: 'polvo', name: 'Polvo', desc: 'Extremamente inteligente e adaptável. Você resolve problemas complexos e prefere trabalhar sozinho.' },
    { id: 'agua_viva', name: 'Água-viva', desc: 'Misterioso e transparente. Você segue o fluxo da vida, mas sabe "queimar" quem invade seu espaço.' },
    { id: 'tartaruga', name: 'Tartaruga Marinha', desc: 'Paciente e resiliente. Você leva a vida no seu próprio ritmo e adora viajar e explorar.' },
    { id: 'cavalo_marinho', name: 'Cavalo-marinho', desc: 'Romântico e único. Você valoriza a família e tem um estilo de vida calmo e singular.' },
    { id: 'orca', name: 'Orca', desc: 'Líder nato e estrategista. Você valoriza muito sua "matilha" e trabalha em equipe para vencer.' },
    { id: 'caranguejo', name: 'Caranguejo', desc: 'Duro por fora, macio por dentro. Você é protetor e caminha de lado para evitar conflitos diretos.' },
    { id: 'arraia', name: 'Arraia', desc: 'Elegante e tranquila. Você desliza pela vida sem fazer barulho, mas tem defesas ocultas.' },
    { id: 'peixe_palhaco', name: 'Peixe-palhaço', desc: 'Engraçado e leal. Você ama seu lar e não se importa de viver em simbiose com os outros.' },
    { id: 'estrela_do_mar', name: 'Estrela-do-mar', desc: 'Resistente e regenerativo. Mesmo quando se machuca, você se recupera e brilha novamente.' },
    { id: 'lontra', name: 'Lontra Marinha', desc: 'Adorável e engenhoso. Você usa ferramentas para resolver problemas e adora ficar de mãos dadas.' },
    { id: 'lula_gigante', name: 'Lula Gigante', desc: 'Lendário e esquivo. Poucos te conhecem de verdade, você vive nas profundezas de seus pensamentos.' },
    { id: 'pinguim', name: 'Pinguim', desc: 'Focado e resistente. Você aguenta o frio da vida com elegância e é extremamente fiel.' },
    { id: 'manati', name: 'Peixe-boi', desc: 'A alma mais "zen" do oceano. Você é gentil, lento e todo mundo gosta de estar perto de você.' },
    { id: 'moreia', name: 'Moreia', desc: 'Observador e reservado. Você prefere ficar na sua toca, mas ataca rápido se provocado.' },
    { id: 'baiacu', name: 'Baiacu', desc: 'Pode parecer pequeno, mas se infla sob pressão. Você sabe se defender quando o mundo te aperta.' },
    { id: 'lagosta', name: 'Lagosta', desc: 'Vive muito e cresce sempre. Você troca de "casca" constantemente para evoluir.' },
    { id: 'dragao_marinho', name: 'Dragão-marinho', desc: 'Exótico e mestre da camuflagem. Você tem uma beleza artística e gosta de se misturar com a natureza.' }
];

// 2. Banco de Perguntas
const questions = [
    {
        text: "Como você prefere passar seu fim de semana?",
        options: [
            { text: "Em uma grande festa com todos os amigos", type: ['golfinho', 'peixe_palhaco', 'lontra'] },
            { text: "Viajando para um lugar novo e distante", type: ['tartaruga', 'baleia', 'pinguim'] },
            { text: "Ficado em casa, lendo ou jogando", type: ['polvo', 'moreia', 'lula_gigante'] },
            { text: "Competindo ou praticando esportes", type: ['tubarao', 'orca', 'dragao_marinho'] }
        ]
    },
    {
        text: "Diante de um problema difícil, você...",
        options: [
            { text: "Enfrento de frente, sem medo", type: ['tubarao', 'orca', 'baiacu'] },
            { text: "Analiso e crio uma estratégia inteligente", type: ['polvo', 'golfinho', 'lula_gigante'] },
            { text: "Espero passar ou me escondo", type: ['caranguejo', 'moreia', 'cavalo_marinho'] },
            { text: "Peço ajuda aos meus amigos", type: ['lontra', 'peixe_palhaco', 'manati'] }
        ]
    },
    {
        text: "Qual destas palavras melhor te define?",
        options: [
            { text: "Liderança", type: ['orca', 'tubarao'] },
            { text: "Criatividade", type: ['polvo', 'dragao_marinho'] },
            { text: "Paciência", type: ['tartaruga', 'manati', 'estrela_do_mar'] },
            { text: "Lealdade", type: ['cavalo_marinho', 'pinguim', 'peixe_palhaco'] }
        ]
    },
    {
        text: "Qual é o seu ambiente ideal?",
        options: [
            { text: "Águas quentes e tropicais", type: ['peixe_palhaco', 'tartaruga', 'arraia'] },
            { text: "Profundezas escuras e silenciosas", type: ['lula_gigante', 'moreia', 'agua_viva'] },
            { text: "Onde tiver comida e ação", type: ['tubarao', 'baleia'] },
            { text: "Um lugar seguro e cheio de corais", type: ['cavalo_marinho', 'caranguejo', 'dragao_marinho'] }
        ]
    },
    {
        text: "Se alguém te irrita, o que você faz?",
        options: [
            { text: "Ignoro e sigo meu caminho", type: ['baleia', 'manati', 'arraia'] },
            { text: "Mordo de volta!", type: ['tubarao', 'moreia'] },
            { text: "Fico na defensiva e me fecho", type: ['caranguejo', 'baiacu', 'tartaruga'] },
            { text: "Dou um jeito de contornar a situação", type: ['golfinho', 'polvo'] }
        ]
    },
    {
        text: "Como é seu grupo de amigos?",
        options: [
            { text: "Enorme, conheço todo mundo", type: ['golfinho', 'sardinha', 'peixe_palhaco'] },
            { text: "Pequeno e muito unido (família)", type: ['orca', 'lontra', 'pinguim'] },
            { text: "Sou um lobo solitário", type: ['tubarao', 'polvo', 'lula_gigante'] },
            { text: "Tenho um parceiro para a vida toda", type: ['cavalo_marinho', 'peixe_palhaco'] }
        ]
    },
    {
        text: "O que você mais valoriza?",
        options: [
            { text: "Inteligência", type: ['polvo', 'golfinho', 'orca'] },
            { text: "Força", type: ['tubarao', 'baleia'] },
            { text: "Beleza/Estilo", type: ['dragao_marinho', 'agua_viva', 'arraia'] },
            { text: "Paz", type: ['manati', 'tartaruga', 'estrela_do_mar'] }
        ]
    },
    {
        text: "Qual seu estilo de 'moda'?",
        options: [
            { text: "Discreto e camuflado", type: ['polvo', 'dragao_marinho', 'moreia'] },
            { text: "Colorido e chamativo", type: ['peixe_palhaco', 'estrela_do_mar', 'agua_viva'] },
            { text: "Imponente e clássico", type: ['orca', 'pinguim', 'arraia'] },
            { text: "Armadura pesada", type: ['lagosta', 'caranguejo', 'tartaruga'] }
        ]
    },
    {
        text: "Como você lida com mudanças?",
        options: [
            { text: "Me adapto rapidamente", type: ['agua_viva', 'lagosta', 'polvo'] },
            { text: "Não gosto, prefiro a rotina", type: ['cavalo_marinho', 'manati'] },
            { text: "Eu causo a mudança", type: ['tubarao', 'orca'] },
            { text: "Vou com a maré", type: ['tartaruga', 'baleia'] }
        ]
    },
    {
        text: "Escolha um superpoder:",
        options: [
            { text: "Invisibilidade", type: ['polvo', 'lula_gigante', 'dragao_marinho'] },
            { text: "Super Força", type: ['baleia', 'tubarao', 'orca'] },
            { text: "Imortalidade/Regeneração", type: ['agua_viva', 'estrela_do_mar', 'lagosta'] },
            { text: "Sexto Sentido/Radar", type: ['golfinho', 'tubarao', 'arraia'] }
        ]
    }
];

// 3. Lógica do Quiz
let currentQuestionIndex = 0;
let scores = {};

// Inicializa pontuação zerada
animals.forEach(animal => scores[animal.id] = 0);

function startQuiz() {
    document.getElementById('start-screen').classList.remove('active');
    setTimeout(() => {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('quiz-screen').classList.remove('hidden');
        setTimeout(() => document.getElementById('quiz-screen').classList.add('active'), 50);
        loadQuestion();
    }, 500);
}

function loadQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    document.getElementById('question-text').innerText = currentQuestion.text;
    
    const buttonsContainer = document.getElementById('answer-buttons');
    buttonsContainer.innerHTML = '';

    // Atualiza barra de progresso
    const progressPercent = ((currentQuestionIndex) / questions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progressPercent}%`;

    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.innerText = option.text;
        button.classList.add('btn-option');
        button.onclick = () => selectAnswer(option.type);
        buttonsContainer.appendChild(button);
    });
}

function selectAnswer(types) {
    // Adiciona pontos aos animais relacionados à resposta
    types.forEach(type => {
        if(scores[type] !== undefined) {
            scores[type]++;
        }
    });

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        // Pequeno delay para animação fluir
        const quizScreen = document.getElementById('quiz-screen');
        quizScreen.style.opacity = '0';
        setTimeout(() => {
            loadQuestion();
            quizScreen.style.opacity = '1';
        }, 300);
    } else {
        showResult();
    }
}

function showResult() {
    // Calcula o vencedor
    let maxScore = -1;
    let winnerId = '';

    for (const [id, score] of Object.entries(scores)) {
        // Fator aleatório pequeno para desempate se necessário
        const finalScore = score + Math.random() * 0.5;
        if (finalScore > maxScore) {
            maxScore = finalScore;
            winnerId = id;
        }
    }

    const winner = animals.find(a => a.id === winnerId);

    // Registra estatística no localStorage
    let count = parseInt(localStorage.getItem('marinho') || 0) + 1;
    localStorage.setItem('marinho', count);

    document.getElementById('quiz-screen').classList.remove('active');
    setTimeout(() => {
        document.getElementById('quiz-screen').classList.add('hidden');
        document.getElementById('result-screen').classList.remove('hidden');
        
        // Popula dados
        document.getElementById('result-name').innerText = winner.name;
        document.getElementById('result-desc').innerText = winner.desc;
        // Define o caminho da imagem: pasta 'imagens' + id + .png
        document.getElementById('result-img').src = `../imagens/${winner.id}.png`;
        
        setTimeout(() => document.getElementById('result-screen').classList.add('active'), 50);
    }, 500);
}

function restartQuiz() {
    currentQuestionIndex = 0;
    animals.forEach(animal => scores[animal.id] = 0);
    
    document.getElementById('result-screen').classList.remove('active');
    setTimeout(() => {
        document.getElementById('result-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
        setTimeout(() => document.getElementById('start-screen').classList.add('active'), 50);
    }, 500);
}