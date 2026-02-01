/**
 * Script de teste para validar o sistema de scroll automático
 * Execute esto no console do navegador enquanto estiver em code.html
 */

function testScrollBehavior() {
    console.log('🧪 INICIANDO TESTES DE SCROLL...\n');

    // 1. Verificar elementos
    console.log('✅ Verificando elementos...');
    const chatArea = document.getElementById('chatArea');
    const messagesContainer = document.getElementById('messagesContainer');
    const scrollBtn = document.getElementById('scrollToBottomBtn');

    if (!chatArea) {
        console.error('❌ chatArea não encontrado!');
        return;
    }
    if (!messagesContainer) {
        console.error('❌ messagesContainer não encontrado!');
        return;
    }

    console.log('✅ Elementos encontrados:');
    console.log(`   - chatArea: ${chatArea.className}`);
    console.log(`   - messagesContainer: ${messagesContainer.className}`);
    console.log(`   - scrollBtn: ${scrollBtn ? 'encontrado' : 'não encontrado'}`);

    // 2. Simular adição de mensagens e verificar scroll
    console.log('\n✅ Teste 1: Adicionando mensagem do usuário...');
    
    const userMsg = document.createElement('div');
    userMsg.className = 'mb-6 flex justify-end animate-slideIn';
    userMsg.innerHTML = `
        <div class="max-w-[80%] bg-primary text-white rounded-2xl px-5 py-3 shadow-soft">
            <p class="text-base leading-relaxed">Teste de scroll automático!</p>
        </div>
    `;
    messagesContainer.appendChild(userMsg);

    setTimeout(() => {
        console.log('📊 Estado após adição:');
        console.log(`   - scrollHeight: ${chatArea.scrollHeight}px`);
        console.log(`   - scrollTop: ${chatArea.scrollTop}px`);
        console.log(`   - clientHeight: ${chatArea.clientHeight}px`);
        const distanceFromBottom = chatArea.scrollHeight - chatArea.scrollTop - chatArea.clientHeight;
        console.log(`   - Distância do bottom: ${distanceFromBottom}px`);

        if (Math.abs(chatArea.scrollHeight - chatArea.scrollTop - chatArea.clientHeight) < 50) {
            console.log('✅ SCROLL FUNCIONANDO: Chat está no final!');
        } else {
            console.log('❌ SCROLL NÃO FUNCIONANDO: Chat não está no final!');
        }

        // 3. Teste com mensagem do assistente
        console.log('\n✅ Teste 2: Adicionando mensagem do assistente...');
        
        const assistantMsg = document.createElement('div');
        assistantMsg.className = 'mb-6 flex justify-start animate-slideIn';
        assistantMsg.innerHTML = `
            <div class="w-full max-w-[85%] bg-surface-light dark:bg-surface-dark rounded-2xl px-5 py-4 shadow-soft border border-gray-100 dark:border-gray-700">
                <div class="text-base leading-relaxed text-gray-700 dark:text-gray-200">
                    Resposta automática do sistema de teste. O scroll deve estar funcionando perfeitamente agora.
                </div>
            </div>
        `;
        messagesContainer.appendChild(assistantMsg);

        setTimeout(() => {
            console.log('📊 Estado após adição da mensagem do assistente:');
            console.log(`   - scrollHeight: ${chatArea.scrollHeight}px`);
            console.log(`   - scrollTop: ${chatArea.scrollTop}px`);
            console.log(`   - clientHeight: ${chatArea.clientHeight}px`);
            const distanceFromBottom2 = chatArea.scrollHeight - chatArea.scrollTop - chatArea.clientHeight;
            console.log(`   - Distância do bottom: ${distanceFromBottom2}px`);

            if (Math.abs(distanceFromBottom2) < 50) {
                console.log('✅ SCROLL FUNCIONANDO: Chat está no final!');
            } else {
                console.log('❌ SCROLL NÃO FUNCIONANDO: Chat não está no final!');
            }

            // 4. Teste do botão de scroll to bottom
            console.log('\n✅ Teste 3: Verificando funcionalidade do botão...');
            if (scrollBtn) {
                console.log(`   - Botão visível: ${scrollBtn.style.display !== 'none' ? 'SIM' : 'NÃO'}`);
                console.log(`   - Opacidade: ${scrollBtn.style.opacity || 'padrão'}`);
                
                // Simular scroll para cima
                chatArea.scrollTop = 0;
                console.log('   - Simulado: Scroll para CIMA');
                
                setTimeout(() => {
                    console.log(`   - Botão visível após scroll: ${scrollBtn.style.display !== 'none' ? 'SIM ✅' : 'NÃO ❌'}`);
                }, 200);
            }

            console.log('\n✨ TESTES CONCLUÍDOS!');
            console.log('Se todos os ✅ aparecerem, o sistema está funcionando perfeitamente!');
        }, 500);
    }, 500);
}

// Executar testes
testScrollBehavior();
