/**
 * Middleware para injetar a chave API do Vercel no frontend
 * 
 * Em produção no Vercel: A chave vem como variável de ambiente
 * Localmente: Use sessionStorage ou variável global
 * 
 * NUNCA coloque a chave diretamente neste arquivo!
 */

// Toda requisição será feita via proxy Groq. Não é mais necessário chave local ou sessionStorage.
