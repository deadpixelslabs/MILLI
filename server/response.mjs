import {createHash} from 'node:crypto';

export function sendAsset(req, res, body, contentType) {
  const etag = '"' + createHash('sha256').update(body).digest('hex') + '"';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, must-revalidate');
  res.setHeader('ETag', etag);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.headers?.['if-none-match'] === etag) return res.status(304).end();
  res.setHeader('Content-Length', Buffer.byteLength(body));
  return req.method === 'HEAD' ? res.status(200).end() : res.status(200).send(body);
}

export function validateMethod(req, res) {
  if (req.method === 'GET' || req.method === 'HEAD') return true;
  res.setHeader('Allow', 'GET, HEAD');
  res.setHeader('Cache-Control', 'no-store');
  res.status(405).json({error: 'GET or HEAD required'});
  return false;
}

export function notFound(res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(404).json({error: 'Token must be an integer from 1 through 5555.'});
}
