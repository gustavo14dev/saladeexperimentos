export default async function handler(req, res) {
    // Return whether server ENV vars are configured
    // Allow a local-config.js fallback for easy local development (gitignored)
    let LOCAL_CONFIG = {};
    try {
        LOCAL_CONFIG = (await import('./local-config.js')).default || {};
    } catch (e) {
        // ignore if not present
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY || LOCAL_CONFIG.GROQ_API_KEY;
    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || LOCAL_CONFIG.MISTRAL_API_KEY;

    console.log('[API STATUS] GROQ present:', !!GROQ_API_KEY, 'MISTRAL present:', !!MISTRAL_API_KEY, 'NODE_ENV:', process.env.NODE_ENV);

    res.status(200).json({ groq: !!GROQ_API_KEY, mistral: !!MISTRAL_API_KEY, timestamp: new Date().toISOString() });
}