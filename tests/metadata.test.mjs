import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import metadataHandler from '../api/metadata.ts';
import imageHandler from '../api/image.ts';
import {metadata, tokenId} from '../server/metadata.mjs';
import {render} from '../scripts/character-art.mjs';

function invoke(handler, id, method = 'GET', headers = {}) {
  const result = {statusCode: 200, headers: {}, body: ''};
  const res = {setHeader(k, v) {result.headers[k] = v;}, status(n) {result.statusCode = n; return this;}, send(s) {result.body = s; return this;}, json(j) {result.body = JSON.stringify(j); return this;}, end() {return this;}};
  handler({method, query: {id}, headers}, res);
  return result;
}

test('all 5555 metadata records and unique SVGs use matching token IDs', () => {
  const images = new Set(), counts = {Signature: 0, Rare: 0, Legendary: 0};
  for (let id = 1; id <= 5555; id++) {
    const m = metadata(id);
    assert.equal(m.name, `Hazels CTO Freemint #${id}`);
    assert.equal(m.image, `https://milliformillion.xyz/images/${id}.svg`);
    assert.equal(m.attributes.length, 8);
    counts[m.attributes.at(-1).value]++;
    images.add(createHash('sha256').update(render(id)).digest('hex'));
  }
  assert.equal(images.size, 5555);
  assert.deepEqual(counts, {Signature: 4166, Rare: 1111, Legendary: 278});
});

test('server supports extensionless metadata, .json and SVG, including last ID', () => {
  for (const id of [1, 2, 3, 144, 2345, 5555]) {
    for (const input of [String(id), `${id}.json`]) {
      const r = invoke(metadataHandler, input);
      assert.equal(r.statusCode, 200);
      assert.deepEqual(JSON.parse(r.body), metadata(id));
      assert.match(r.headers['Content-Type'], /^application\/json/);
    }
    const r = invoke(imageHandler, `${id}.svg`);
    assert.equal(r.body, render(id));
    assert.match(r.headers['Content-Type'], /^image\/svg\+xml/);
    assert.equal(Number(r.headers['Content-Length']), Buffer.byteLength(r.body));
    assert.equal(invoke(imageHandler, `${id}.svg`, 'HEAD').body, '');
    assert.equal(invoke(imageHandler, `${id}.svg`, 'GET', {'if-none-match': r.headers.ETag}).statusCode, 304);
  }
});

test('invalid IDs never receive another token or an HTML fallback', () => {
  for (const id of [undefined, ['1','2'], '0', '5556', '-1', '1.5', '1e2', '01', '../1', '1.json/x', '1.svg']) {
    assert.equal(tokenId(id), null);
    const r = invoke(metadataHandler, id);
    assert.equal(r.statusCode, 404);
    assert.equal(r.headers['Cache-Control'], 'no-store');
  }
  for (const handler of [metadataHandler, imageHandler]) assert.equal(invoke(handler, '1', 'POST').statusCode, 405);
});
