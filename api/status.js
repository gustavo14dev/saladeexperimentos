export default function handler(req, res) {
    // Apenas GET
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const status = {
        GROQ: !!process.env.GROQ_API_KEY,
        MISTRAL: !!process.env.MISTRAL_API_KEY,
        GEMINI: !!process.env.GEMINI_API_KEY
    };

    res.status(200).json({ status, timestamp: new Date().toISOString() });
}
