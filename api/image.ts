import {render} from '../scripts/character-art.mjs';
import {tokenId} from '../server/metadata.mjs';
import {notFound, sendAsset, validateMethod} from '../server/response.mjs';

export default function handler(req: any, res: any) {
  if (!validateMethod(req, res)) return;
  const id = tokenId(req.query?.id, 'svg');
  if (id === null) return notFound(res);
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
  return sendAsset(req, res, render(id), 'image/svg+xml; charset=utf-8');
}
