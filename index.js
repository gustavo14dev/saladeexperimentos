import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos da raiz
app.use(express.static(__dirname));

// Servir arquivos estáticos da pasta Lhama-AI
app.use('/Lhama-AI', express.static(path.join(__dirname, 'Lhama-AI')));

// API proxies
app.use('/api/lhama-groq-api-proxy', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }
  next();
}, async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Import dinâmico para evitar problemas com ES modules
    const { default: handler } = await import('./api/lhama-groq-api-proxy.js');
    // Adaptar para o formato Express
    const mockRes = {
      status: (code) => {
        res.status(code);
        return {
          json: (data) => res.json(data),
          end: () => res.end(),
          setHeader: (name, value) => res.setHeader(name, value)
        };
      },
      setHeader: (name, value) => res.setHeader(name, value),
      json: (data) => res.json(data),
      end: () => res.end()
    };
    await handler(req, mockRes);
  } catch (error) {
    console.error('[PROXY] Erro:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use('/api/pixels-proxy', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }
  next();
}, async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Import dinâmico do unified-proxy
    const { default: handler } = await import('./api/unified-proxy.js');
    const mockRes = {
      status: (code) => {
        res.status(code);
        return {
          json: (data) => res.json(data),
          end: () => res.end(),
          setHeader: (name, value) => res.setHeader(name, value)
        };
      },
      setHeader: (name, value) => res.setHeader(name, value),
      json: (data) => res.json(data),
      end: () => res.end()
    };
    // Adaptar request GET para o formato esperado pelo unified-proxy
    const mockReq = {
      method: 'POST',
      body: {
        service: 'pixels',
        query: req.query.query,
        per_page: parseInt(req.query.per_page) || 10,
        page: parseInt(req.query.page) || 1
      }
    };
    await handler(mockReq, mockRes);
  } catch (error) {
    console.error('[PIXELS-PROXY] Erro:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rota principal para servir o Lhama AI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Lhama-AI', 'conversa.html'));
});

// Rota específica para o Lhama AI
app.get('/Lhama-AI', (req, res) => {
  res.sendFile(path.join(__dirname, 'Lhama-AI', 'conversa.html'));
});

app.get('/Lhama-AI/conversa.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Lhama-AI', 'conversa.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Lhama AI disponível em: http://localhost:${PORT}/Lhama-AI`);
});
