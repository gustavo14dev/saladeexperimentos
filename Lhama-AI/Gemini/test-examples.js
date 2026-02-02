/**
 * Exemplos de Teste da API Gemini
 * 
 * Use estes exemplos no console do navegador (F12)
 * para testar se tudo está funcionando
 */

// ============================================
// ✅ TESTE 1: Verificar Chave API
// ============================================
console.log('%c=== TESTE 1: Verificar Chave ===', 'color: blue; font-weight: bold;');
console.log('Chave definida?', temChaveAPI());
console.log('Instância da API existe?', typeof lhama1API !== 'undefined');
console.log('Training carregado?', buscaTrainamento.estaCarregado());


// ============================================
// ✅ TESTE 2: Buscar no Training.json
// ============================================
console.log('%c=== TESTE 2: Busca no Training ===', 'color: blue; font-weight: bold;');

function testarBuscaTraining() {
    const testesExatos = [
        'olá',
        'oi',
        'tudo bem?',
        'qual o seu nome?'
    ];

    testesExatos.forEach(pergunta => {
        const resultado = buscaTrainamento.buscarExato(pergunta);
        console.log(`"${pergunta}" →`, resultado ? '✅ Encontrado' : '❌ Não encontrado');
    });
}

testarBuscaTraining();


// ============================================
// ✅ TESTE 3: Chamar API Gemini
// ============================================
console.log('%c=== TESTE 3: Chamar API Gemini ===', 'color: blue; font-weight: bold;');

async function testarAPIGemini() {
    console.log('Testando API...');
    
    const resposta = await lhama1API.obterResposta('Como é viver num planeta dourado?');
    console.log('Resposta:', resposta);
}

// Descomente a linha abaixo para testar
// testarAPIGemini();


// ============================================
// ✅ TESTE 4: Definir Chave Manualmente
// ============================================
console.log('%c=== TESTE 4: Definir Chave ===', 'color: blue; font-weight: bold;');
console.log('Para testes locais, execute:');
console.log('  definirChaveAPI("sua-chave-aqui")');
console.log('Depois teste a API com:');
console.log('  testarAPIGemini()');


// ============================================
// 📊 Estatísticas
// ============================================
console.log('%c=== ESTATÍSTICAS ===', 'color: green; font-weight: bold;');
console.log(`Total de treinamentos: ${buscaTrainamento.getTotalTreinamentos()}`);
console.log(`Modelo Groq: ${LHAMA1_GROQ_CONFIG.MODEL}`);
console.log(`Temperatura: ${LHAMA1_GROQ_CONFIG.REQUEST_CONFIG.temperature}`);
console.log(`Max Tokens: ${LHAMA1_GROQ_CONFIG.REQUEST_CONFIG.max_tokens}`);


// ============================================
// 🔧 Funções Úteis
// ============================================

/**
 * Teste completo - executa todos os testes
 */
function testeCompleto() {
    console.clear();
    console.log('%c🚀 TESTE COMPLETO DO SISTEMA', 'color: red; font-size: 16px; font-weight: bold;');
    
    testarBuscaTraining();
    
    console.log('%c✅ Se viu esses testes, o sistema está funcionando!', 'color: green; font-weight: bold;');
}

/**
 * Teste rápido da API
 */
async function testeRapidoAPI() {
    console.log('⏳ Testando API do Groq...');
    const inicio = Date.now();
    
    const resposta = await lhama1API.obterResposta('Qual é o significado da vida?');
    
    const tempo = Date.now() - inicio;
    console.log(`✅ Resposta em ${tempo}ms:`);
    console.log(resposta);
}

/**
 * Simular fluxo completo
 */
async function simularFluxoCompleto(pergunta) {
    console.log(`%c📝 Pergunta: "${pergunta}"`, 'color: blue; font-weight: bold;');
    
    // Passo 1: Buscar no training
    console.log('Passo 1: Buscando no training.json...');
    const respostaTraining = buscaTrainamento.buscarExato(pergunta);
    
    if (respostaTraining) {
        console.log('✅ Encontrada no training!');
        console.log('Resposta:', respostaTraining);
        return;
    }
    
    console.log('❌ Não encontrada no training');
    
    // Passo 2: Chamar API
    if (!temChaveAPI()) {
        console.error('❌ Chave API não definida');
        return;
    }
    
    console.log('Passo 2: Chamando API do Gemini...');
    const respostaAPI = await lhama1API.obterResposta(pergunta);
    console.log('✅ Resposta da API:');
    console.log(respostaAPI);
}

// ============================================
// 📋 Menu de Testes
// ============================================
console.log('%c=== MENU DE TESTES DISPONÍVEIS ===', 'color: orange; font-weight: bold;');
console.log('Execute no console:');
console.log('  testeCompleto()          - Testa tudo');
console.log('  testeRapidoAPI()         - Testa apenas API');
console.log('  simularFluxoCompleto("sua pergunta") - Simula fluxo');
console.log('  definirChaveAPI("sua-chave")  - Define chave manualmente');
