/**
 * Compat: /api/pixels-proxy
 *
 * O frontend histórico do Lhama AI chama `/api/pixels-proxy`.
 * Localmente, `index.js` também expõe essa rota via Express.
 * Em deploy (ex.: Vercel), é necessário existir um handler serverless com esse nome.
 *
 * Este endpoint simplesmente delega para o `pexels-proxy`.
 */

import pexelsProxy from './pexels-proxy.js';

export default async function handler(req, res) {
    return pexelsProxy(req, res);
}
