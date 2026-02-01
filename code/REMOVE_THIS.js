// REMOVE THIS ENTIRE BLOCK (lines 1305-1317)
// It's causing XSS warnings because hljs tries to highlight HTML with unescaped tags

// OLD CODE TO DELETE:
/*
        // Aplicar syntax highlight
        // Aplicar syntax highlight APENAS em blocos de código legítimos
        setTimeout(() => {
            try {
                // Procurar apenas por elementos <code> dentro de <pre> (blocos de código reais)
                const codeBlocks = element.querySelectorAll('pre > code');
                codeBlocks.forEach(codeBlock => {
                    try {
                        hljs.highlightElement(codeBlock);
                    } catch(e) {}
                });
            } catch(e) {}
            // Garantir scroll final depois do highlight
            this.scrollToBottom();
        }, 100);
*/

// REPLACE WITH THIS (just scroll):
        // Scroll final após formatter
        setTimeout(() => this.scrollToBottom(), 100);
