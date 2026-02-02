/**
 * Vercel Serverless Function
 * Passa a chave API para o frontend de forma segura
 * 
 * Arquivo: /api/config.js
 * URL: https://seu-dominio.vercel.app/api/config
 */

export default (req, res) => {
    // Apenas GET
    if (req.method !== 'GET') {
        return res.status(405).json({ erro: 'Method not allowed' });
    }

    // Log seguro para diagnóstico (não imprime a chave)
    console.log('[API CONFIG] GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY, 'NODE_ENV:', process.env.NODE_ENV);

    // Retorna a chave de forma segura (mantém comportamento atual)
    res.status(200).json({
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || null,
        hasKey: !!process.env.GEMINI_API_KEY,
        timestamp: new Date().toISOString()
    });
};
