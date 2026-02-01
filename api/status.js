export default async function handler(req, res) {
    // Return whether server ENV vars are configured
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

    res.status(200).json({ groq: !!GROQ_API_KEY, mistral: !!MISTRAL_API_KEY });
}