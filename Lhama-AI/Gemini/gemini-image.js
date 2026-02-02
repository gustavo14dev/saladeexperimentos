/**
 * Geração de Imagens com Gemini
 * Integração com modelo de geração de imagens mais econômico
 * 
 * Marca d'água com "Lhama AI 1"
 */

class GeminiImageAPI {
    constructor() {
        this.estaProcessando = false;
        this.modeloImagem = 'imagen-3.0-fast-generate-001'; // Modelo mais econômico do Google
    }

    /**
     * Verifica se pode gerar imagem
     * @returns {boolean}
     */
    podeGerar() {
        return temChaveAPI();
    }

    /**
     * Detecta se o usuário está pedindo para gerar imagem
     * @param {string} mensagem - Mensagem do usuário
     * @returns {boolean}
     */
    estasPedindoImagem(mensagem) {
        const palavrasChave = [
            'gere uma imagem',
            'gera uma imagem',
            'gerar imagem',
            'gera imagem',
            'desenha',
            'desenhe',
            'pinta',
            'pinte',
            'cria uma imagem',
            'crie uma imagem',
            'cria imagem',
            'crie imagem',
            'cria uma foto',
            'crie uma foto',
            'foto de',
            'imagem de',
            'picture of',
            'draw me',
            'generate image'
        ];

        const mensagemLower = mensagem.toLowerCase();
        return palavrasChave.some(palavra => mensagemLower.includes(palavra));
    }

    /**
     * Gera uma imagem usando Gemini
     * @param {string} descricao - Descrição da imagem
     * @returns {Promise<string>} - URL da imagem ou mensagem de erro
     */
    async gerarImagem(descricao) {
        if (this.estaProcessando) {
            return null;
        }

        this.estaProcessando = true;

        try {
            // Usar proxy server-side para não expor a chave no cliente
            const url = '/api/gemini-proxy';
            const proxyBody = {
                model: this.modeloImagem,
                payload
            }; 

            // Adicionar marca d'água na descrição (discretamente)
            const descricaoComMarca = `${descricao}\n\n[Com marca d'água de "Lhama AI 1" pequena no canto inferior direito]`;

            const payload = {
                contents: [{
                    parts: [{
                        text: descricaoComMarca
                    }]
                }],
                generationConfig: {
                    temperature: 0.9,
                    topP: 1.0,
                    topK: 40,
                }
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s para imagem

            const resposta = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(proxyBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!resposta.ok) {
                console.error('Erro ao gerar imagem:', resposta.status);
                return null;
            }

            const dados = await resposta.json();
            
            // A resposta pode conter a imagem em base64
            if (dados.candidates && dados.candidates.length > 0) {
                const conteudo = dados.candidates[0]?.content?.parts?.[0];
                
                // Se for imagem em base64
                if (conteudo?.inlineData?.mimeType?.startsWith('image/')) {
                    const base64 = conteudo.inlineData.data;
                    const mimeType = conteudo.inlineData.mimeType;
                    const dataUrl = `data:${mimeType};base64,${base64}`;
                    return dataUrl;
                }

                // Se for URL
                if (conteudo?.text?.startsWith('http')) {
                    return conteudo.text;
                }
            }

            return null;

        } catch (erro) {
            console.error('Erro ao gerar imagem com Gemini:', erro);
            return null;

        } finally {
            this.estaProcessando = false;
        }
    }
}

// Instância global
const geminiImageAPI = new GeminiImageAPI();
