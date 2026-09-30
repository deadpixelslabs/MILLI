import {metadata, tokenId} from '../server/metadata.mjs';
import {notFound, sendAsset, validateMethod} from '../server/response.mjs';

export default function handler(req: any, res: any) {
  if (!validateMethod(req, res)) return;
  const id = tokenId(req.query?.id);
  if (id === null) return notFound(res);
  return sendAsset(req, res, JSON.stringify(metadata(id)), 'application/json; charset=utf-8');
}
