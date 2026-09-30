import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import sharp from 'sharp';
import {render,regions,traits,bodies,parts} from '../scripts/character-art.mjs';

test('approved illustrations retain every path, face, detail and original pixel',async()=>{
 for(let i=0;i<3;i++){
  const original=fs.readFileSync('art/approved/'+regions[i].file,'utf8');
  const paths=s=>[...s.matchAll(/\sd="([^"]*)"/g)].map(m=>m[1]);
  assert.deepEqual(paths(bodies[i]),paths(original));
  assert.equal(Buffer.from(parts[i].data,'base64').toString(),bodies[i]);
  const source=await sharp(Buffer.from(original)).ensureAlpha().raw().toBuffer();
  const actual=await sharp(Buffer.from(render(i+1))).ensureAlpha().raw().toBuffer();
  assert.deepEqual(actual,source,'Original artwork changed: '+regions[i].file);
 }
});

test('palette variation never changes geometry or introduces unsupported material layers',()=>{
 for(const id of [4,8,19,27,144,888,2345,5555]){
  const t=traits(id),svg=render(id),body=bodies[t.look];
  assert(svg.includes(body));assert(!/<(?:image|script|foreignObject)\b|(?:href|src)="(?!#)/i.test(svg));
  assert(!svg.includes('foil'));assert(!svg.includes('<text'));
 }
});
