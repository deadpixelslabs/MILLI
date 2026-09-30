import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {render, traits} from './character-art.mjs';
import {metadata, csvRow, CSV_HEADERS, SUPPLY} from '../server/metadata.mjs';

const output = path.resolve(process.argv[2] || 'exports/hazels-5555');
fs.mkdirSync(path.join(output, 'images'), {recursive: true});
fs.mkdirSync(path.join(output, 'metadata'), {recursive: true});
const rows = [CSV_HEADERS], hashes = [], seen = new Set();
const counts = {Signature: 0, Rare: 0, Legendary: 0};
let totalBytes = 0;
for (let id = 1; id <= SUPPLY; id++) {
  const svg = render(id);
  const hash = createHash('sha256').update(svg).digest('hex');
  if (seen.has(hash)) throw Error(`Duplicate image: ${id}`);
  seen.add(hash);
  if (/<(?:image|script|foreignObject)\b|(?:href|src)="(?!#)/i.test(svg)) throw Error(`Non-vector asset: ${id}`);
  fs.writeFileSync(path.join(output, 'images', `${id}.svg`), svg);
  const data = metadata(id);
  fs.writeFileSync(path.join(output, 'metadata', `${id}.json`), JSON.stringify(data, null, 2) + '\n');
  rows.push(csvRow(id));
  counts[data.attributes.at(-1).value]++;
  hashes.push({id, sha256: hash, bytes: Buffer.byteLength(svg), traits: traits(id)});
  totalBytes += Buffer.byteLength(svg);
  if (id % 1000 === 0) console.log(`Generated ${id}/${SUPPLY} SVGs`);
}
fs.writeFileSync(path.join(output, 'metadata-rows.json'), JSON.stringify(rows));
fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify({supply: SUPPLY, uniqueImages: seen.size, totalBytes, editions: counts, images: hashes}));
console.log(JSON.stringify({output, supply: SUPPLY, uniqueImages: seen.size, totalBytes, editions: counts}));
