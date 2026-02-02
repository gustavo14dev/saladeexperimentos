export default async function handler(req, res) {
    // Apenas GET
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    // Allow a local-config.js fallback for local dev convenience (gitignored)
    let LOCAL_CONFIG = {};
    try { LOCAL_CONFIG = (await import('./local-config.js')).default || {}; } catch (e) { /* ignore */ }

    const GROQ = !!(process.env.GROQ_API_KEY || LOCAL_CONFIG.GROQ_API_KEY);
    const MISTRAL = !!(process.env.MISTRAL_API_KEY || LOCAL_CONFIG.MISTRAL_API_KEY);
    const GEMINI = !!(process.env.GEMINI_API_KEY || LOCAL_CONFIG.GEMINI_API_KEY);

    console.log('[API STATUS] GROQ:', GROQ, 'MISTRAL:', MISTRAL, 'GEMINI:', GEMINI, 'NODE_ENV:', process.env.NODE_ENV);

    res.status(200).json({ status: { GROQ, MISTRAL, GEMINI }, timestamp: new Date().toISOString() });
}
