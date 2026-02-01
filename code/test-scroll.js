const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Iniciar servidor HTTP simples
function startServer(port = 3000) {
    const server = http.createServer((req, res) => {
        let filePath = path.join(__dirname, req.url === '/' ? 'code.html' : req.url);
        
        if (filePath.endsWith('/')) {
            filePath = path.join(filePath, 'code.html');
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                return;
            }

            const ext = path.extname(filePath);
            let contentType = 'text/html';
            if (ext === '.js') contentType = 'application/javascript';
            if (ext === '.css') contentType = 'text/css';

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });

    server.listen(port, () => {
        console.log(`✅ Servidor HTTP rodando em http://localhost:${port}`);
    });

    return server;
}

async function testScroll() {
    console.log('🚀 Iniciando teste de scroll automático...');
    
    const server = startServer(3000);

    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
        const page = await browser.newPage();
        
        // Injetar logs para capturar behavior do scroll
        await page.evaluateOnNewDocument(() => {
            const original = {
                forceScrollToBottom: null,
                startContinuousScroll: null,
                scrollToTop: null
            };

            // Interceptar forceScrollToBottom
            window._scrollDebug = {
                logs: [],
                lastScrollTop: 0,
                lastScrollHeight: 0
            };

            window._captureScroll = setInterval(() => {
                const chatArea = document.getElementById('chatArea');
                if (chatArea) {
                    window._scrollDebug.lastScrollTop = chatArea.scrollTop;
                    window._scrollDebug.lastScrollHeight = chatArea.scrollHeight;
                    window._scrollDebug.logs.push({
                        time: Date.now(),
                        scrollTop: chatArea.scrollTop,
                        scrollHeight: chatArea.scrollHeight,
                        isAtBottom: Math.abs(chatArea.scrollTop + chatArea.clientHeight - chatArea.scrollHeight) < 10
                    });
                }
            }, 100);
        });

        console.log('📖 Abrindo página...');
        await page.goto('http://localhost:3000/code.html', { waitUntil: 'networkidle2' });
        
        // Aguardar 2s para garantir que tudo está carregado
        await new Promise(r => setTimeout(r, 2000));

        console.log('💬 Injetando mensagem de teste...');
        
        // Simular uma mensagem longa
        const longMessage = `Escreva uma história longa sobre um aventureiro que viaja pelo mundo. A história deve ter pelo menos 10 parágrafos, cada parágrafo com pelo menos 50 palavras. Comece a história em uma floresta misteriosa e termine em uma cidade desconhecida.`;

        // Clicar no input e digitar
        await page.click('#userInput');
        await page.type('#userInput', longMessage, { delay: 5 });

        console.log('📤 Enviando mensagem...');
        await page.click('#sendButton');

        // Aguardar mais tempo para que a resposta chegue e seja renderizada
        console.log('⏳ Aguardando resposta da IA (12s)...');
        await new Promise(r => setTimeout(r, 12000));

        // Capturar dados de scroll
        const scrollData = await page.evaluate(() => {
            return {
                logs: window._scrollDebug.logs.slice(-20), // últimas 20 entradas
                finalScrollTop: document.getElementById('chatArea')?.scrollTop || 0,
                finalScrollHeight: document.getElementById('chatArea')?.scrollHeight || 0,
                finalClientHeight: document.getElementById('chatArea')?.clientHeight || 0,
                messagesCount: document.querySelectorAll('#messagesContainer > div').length
            };
        });

        console.log('\n📊 RESULTADO DO TESTE:');
        console.log('========================');
        console.log(`Mensagens no chat: ${scrollData.messagesCount}`);
        console.log(`scrollTop final: ${scrollData.finalScrollTop}`);
        console.log(`scrollHeight final: ${scrollData.finalScrollHeight}`);
        console.log(`clientHeight final: ${scrollData.finalClientHeight}`);
        
        const isAtBottom = Math.abs(scrollData.finalScrollTop + scrollData.finalClientHeight - scrollData.finalScrollHeight) < 10;
        console.log(`✅ Está no final? ${isAtBottom ? 'SIM' : 'NÃO'}`);
        
        console.log('\nÚltimos 20 eventos de scroll:');
        scrollData.logs.forEach((log, i) => {
            const status = log.isAtBottom ? '✅' : '❌';
            console.log(`  ${status} scrollTop=${log.scrollTop} / scrollHeight=${log.scrollHeight} (isAtBottom=${log.isAtBottom})`);
        });

        if (!isAtBottom) {
            console.log('\n⚠️ PROBLEMA DETECTADO: A página NÃO scrollou para o final!');
            console.log(`Faltam ${scrollData.finalScrollHeight - (scrollData.finalScrollTop + scrollData.finalClientHeight)} pixels para o final`);
        } else {
            console.log('\n✅ SUCESSO! O scroll automático está funcionando!');
        }

        // Manter o navegador aberto por 3s para visualização
        console.log('\n📺 Mantendo navegador aberto por 3s para visualização...');
        await new Promise(r => setTimeout(r, 3000));

        await browser.close();
    } catch (error) {
        console.error('❌ Erro durante teste:', error.message);
    } finally {
        server.close();
        console.log('\n✅ Teste finalizado');
        process.exit(0);
    }
}

testScroll();
