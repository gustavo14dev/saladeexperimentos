/**
 * INSTRUÇÕES ESPECIAIS PARA VERCEL
 * 
 * O Vercel não passa variáveis de ambiente para o frontend automaticamente.
 * 
 * SOLUÇÃO 1: Usar Vercel Functions (Node.js) - RECOMENDADO
 * =========================================================
 * 
 * Crie o arquivo: /api/config.js
 * 
 * export default (req, res) => {
 *   res.status(200).json({
 *     GEMINI_API_KEY: process.env.GEMINI_API_KEY
 *   });
 * }
 * 
 * Depois edite api-init.js para chamar:
 * const config = await fetch('/api/config'); // Nota: prefira usar um proxy server-side (/api/gemini-proxy) para evitar expor a chave diretamente ao cliente
 * 
 * 
 * SOLUÇÃO 2: HTML Inline - MAIS SIMPLES
 * ======================================
 * 
 * Edite conversa.html e adicione ANTES de <script src="Gemini/config.js">:
 * 
 * <script>
 *   window.GEMINI_API_KEY = '<%= GEMINI_API_KEY %>';
 * </script>
 * 
 * Mas isto requer template engine.
 * 
 * 
 * SOLUÇÃO 3: Usar Variável Global (ATUAL)
 * ========================================
 * 
 * api-init.js tenta buscar de window.GEMINI_API_KEY
 * 
 * Se isto também não funcionar, você PRECISA implementar
 * a Solução 1 (Vercel Function).
 */
