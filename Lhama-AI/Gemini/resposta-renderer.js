/**
 * RespostaRenderer - Processa e formata respostas da IA
 * Converte markdown, código, tabelas e outras formatações para HTML
 */
class RespostaRenderer {
    static processar(resposta) {
        if (!resposta || typeof resposta !== 'string') return resposta;
        
        let processado = resposta;
        
        // Ordem importante: processar em sequência específica
        processado = this.processarBlocosCodigo(processado);
        processado = this.processarTabelas(processado);
        processado = this.processarTitulos(processado);
        processado = this.processarListas(processado);
        processado = this.processarFormatacao(processado);
        
        return processado;
    }

    /**
     * Processa blocos de código com syntax highlighting
     */
    static processarBlocosCodigo(texto) {
        const regex = /```(\w*)\n([\s\S]*?)```/g;
        let bloquoID = 0;
        
        return texto.replace(regex, (match, language, code) => {
            const lang = language || 'javascript';
            const id = `code-block-${bloquoID++}`;
            const codigoEscapado = this.escaparHTML(code.trim());
            
            return `<div class="code-block">
                <div class="code-block-header">
                    <span class="code-language">${lang}</span>
                    <button class="code-copy-btn" onclick="copiarCodigo('${id}')" title="Copiar código">
                        <span class="material-icons-outlined">content_copy</span>
                        <span id="copy-text-${id}">Copiar</span>
                    </button>
                </div>
                <pre class="code-content" id="${id}"><code class="language-${lang}">${codigoEscapado}</code></pre>
            </div>`;
        });
    }

    /**
     * Processa tabelas markdown
     */
    static processarTabelas(texto) {
        const linhas = texto.split('\n');
        let resultado = [];
        let emTabela = false;
        let linhasTabela = [];

        for (let i = 0; i < linhas.length; i++) {
            const linha = linhas[i];
            
            if (linha.trim().startsWith('|') && linha.trim().endsWith('|')) {
                if (!emTabela) {
                    emTabela = true;
                    linhasTabela = [linha];
                } else {
                    linhasTabela.push(linha);
                }
            } else {
                if (emTabela) {
                    resultado.push(this.construirTabela(linhasTabela));
                    emTabela = false;
                    linhasTabela = [];
                }
                resultado.push(linha);
            }
        }
        
        if (emTabela) {
            resultado.push(this.construirTabela(linhasTabela));
        }
        
        return resultado.join('\n');
    }

    static construirTabela(linhas) {
        if (linhas.length < 2) return linhas.join('\n');
        
        const cabecalho = linhas[0]
            .split('|')
            .filter(cell => cell.trim())
            .map(cell => `<th>${cell.trim()}</th>`)
            .join('');
        
        const corpo = linhas.slice(2)
            .filter(linha => linha.includes('|'))
            .map(linha => {
                const cells = linha.split('|')
                    .filter(cell => cell.trim())
                    .map(cell => `<td>${cell.trim()}</td>`)
                    .join('');
                return `<tr>${cells}</tr>`;
            })
            .join('');
        
        return `<table class="markdown-table">
            <thead><tr>${cabecalho}</tr></thead>
            <tbody>${corpo}</tbody>
        </table>`;
    }

    /**
     * Processa títulos markdown
     */
    static processarTitulos(texto) {
        texto = texto.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
        texto = texto.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
        texto = texto.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
        return texto;
    }

    /**
     * Processa listas
     */
    static processarListas(texto) {
        const linhas = texto.split('\n');
        let resultado = [];
        let emListaUL = false;
        let emListaOL = false;
        let linhasUL = [];
        let linhasOL = [];
        
        for (let linha of linhas) {
            const trimmed = linha.trim();
            
            if (trimmed.match(/^[-*]\s+/)) {
                if (!emListaUL) {
                    if (emListaOL) {
                        resultado.push(`<ol>${linhasOL.join('')}</ol>`);
                        linhasOL = [];
                        emListaOL = false;
                    }
                    emListaUL = true;
                }
                const conteudo = trimmed.replace(/^[-*]\s+/, '');
                linhasUL.push(`<li>${conteudo}</li>`);
            } 
            else if (trimmed.match(/^\d+\.\s+/)) {
                if (!emListaOL) {
                    if (emListaUL) {
                        resultado.push(`<ul>${linhasUL.join('')}</ul>`);
                        linhasUL = [];
                        emListaUL = false;
                    }
                    emListaOL = true;
                }
                const conteudo = trimmed.replace(/^\d+\.\s+/, '');
                linhasOL.push(`<li>${conteudo}</li>`);
            } 
            else {
                if (emListaUL) {
                    resultado.push(`<ul>${linhasUL.join('')}</ul>`);
                    linhasUL = [];
                    emListaUL = false;
                }
                if (emListaOL) {
                    resultado.push(`<ol>${linhasOL.join('')}</ol>`);
                    linhasOL = [];
                    emListaOL = false;
                }
                resultado.push(linha);
            }
        }
        
        if (emListaUL) resultado.push(`<ul>${linhasUL.join('')}</ul>`);
        if (emListaOL) resultado.push(`<ol>${linhasOL.join('')}</ol>`);
        
        return resultado.join('\n');
    }

    /**
     * Processa formatação inline
     */
    static processarFormatacao(texto) {
        texto = texto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        texto = texto.replace(/\*(.*?)\*/g, '<em>$1</em>');
        texto = texto.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
        
        return texto;
    }

    /**
     * Escapa caracteres HTML
     */
    static escaparHTML(texto) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return texto.replace(/[&<>"']/g, m => map[m]);
    }
}

/**
 * Função global para copiar código
 */
function copiarCodigo(blocoID) {
    const elemento = document.getElementById(blocoID);
    if (!elemento) return;
    
    let texto = elemento.innerText || elemento.textContent;
    
    navigator.clipboard.writeText(texto).then(() => {
        const textSpan = document.getElementById('copy-text-' + blocoID);
        if (textSpan) {
            textSpan.textContent = '✓ Copiado!';
            setTimeout(() => {
                textSpan.textContent = 'Copiar';
            }, 2000);
        }
    }).catch(err => {
        console.error('Erro ao copiar:', err);
    });
}
