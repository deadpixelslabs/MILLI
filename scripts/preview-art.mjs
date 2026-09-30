import fs from 'node:fs';
import sharp from 'sharp';
import { render } from './character-art.mjs';
fs.mkdirSync('public/art/characters',{recursive:true});
const ids=[1,2,3,4,5,6,7,8,9,19,27,73,144,299,888,1200,2345];
for(const id of ids){const svg=render(id);fs.writeFileSync(`public/art/characters/${id}.svg`,svg);await sharp(Buffer.from(svg)).resize(600,600).webp({quality:94}).toFile(`public/art/characters/${id}.webp`);}
const tiles=[];for(let i=0;i<3;i++)tiles.push({input:await sharp(Buffer.from(render([1,2,3][i]))).resize(384,384).png().toBuffer(),left:24+i*384,top:105});
await sharp({create:{width:1200,height:630,channels:4,background:'#efede6'}}).composite(tiles).png().toFile('public/art/social.png');
const approved=[];
for(let i=0;i<3;i++)approved.push({input:await sharp(Buffer.from(render(i+1))).resize(600,600).png().toBuffer(),left:i*600,top:0});
await sharp({create:{width:1800,height:600,channels:4,background:'#efede6'}}).composite(approved).webp({quality:96}).toFile('public/art/approved-preview.webp');
