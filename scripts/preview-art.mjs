import fs from 'node:fs';
import sharp from 'sharp';
import { render } from './character-art.mjs';
fs.mkdirSync('public/art/characters',{recursive:true});
const ids=[1,2,3,8,19,27,73,144,299,888,1200,2345];
for(const id of ids){const svg=render(id);fs.writeFileSync(`public/art/characters/${id}.svg`,svg);await sharp(Buffer.from(svg)).resize(600,656).webp({quality:88}).toFile(`public/art/characters/${id}.webp`);}
const tiles=[];for(let i=0;i<3;i++)tiles.push({input:await sharp(Buffer.from(render([19,8,888][i]))).resize(384,420).png().toBuffer(),left:24+i*384,top:105});
await sharp({create:{width:1200,height:630,channels:4,background:'#efede6'}}).composite(tiles).png().toFile('public/art/social.png');
