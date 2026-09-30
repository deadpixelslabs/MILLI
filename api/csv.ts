import {csvText} from '../server/metadata.mjs';
import {sendAsset, validateMethod} from '../server/response.mjs';

export default function handler(req: any, res: any) {
  if (!validateMethod(req, res)) return;
  res.setHeader('Content-Disposition', 'attachment; filename="Hazels-CTO-Freemint-Metadata.csv"');
  return sendAsset(req, res, csvText(), 'text/csv; charset=utf-8');
}
