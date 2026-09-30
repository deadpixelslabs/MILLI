// The approved illustrations are the source of truth. No geometry is redrawn.
// Palette regions annotate existing paths; original fills remain the default.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
export const hairs=['Original','#604638','#735142','#55463f','#42464c','#574750','#3d494a','#48483d','#614347','#393c43','#6a5648','#34332f'];
export const outfits=['Original','#45566c','#526353','#775456','#8c735c','#626b74','#685771','#796855','#3b555b','#a29580','#42494a','#654649','#888579','#4f576b','#6f7470','#61513e'];
export const backgrounds=['Original','#b99797','#7d9190','#9c95a9','#c0ab89','#8d9baf','#b89e8d','#929d8d','#b2a4b6','#baa879','#a6b5ab','#9aa9ba','#d1b69c','#aa7d73','#ada8bc','#c5b8a4','#7b939a','#98927c','#b4a1a5','#8b8198','#adb39b','#baa17c','#78908c','#c3aaad','#90a2ae','#a8a49b','#b4aa8c','#929caa','#ad9185','#c4b7b0','#81958a','#b8aaa0'];
export const originalBackgrounds=['#9b9286','#c38d76','#66798d'];
export const hairBases=['#29282c','#443531','#473d3a'];
export const outfitBases=['#29282c','#303b4a','#29282b'];
export const labels={look:['Ink hoodie','Indigo denim','Braided leather'],hair:['Twin buns and long layers','High ponytail','Side braid'],outfit:['Oversized hoodie','Denim overalls','Leather jacket'],accessory:['Crossbody buckle and earrings','Overall hardware and earrings','Pendant and earrings']};
export const regions=JSON.parse(fs.readFileSync('art/regions.json','utf8'));
const pad=s=>s+' '.repeat((3-Buffer.byteLength(s)%3)%3);
export const bodies=regions.map(region=>{
 const raw=fs.readFileSync('art/approved/'+region.file,'utf8');
 if(createHash('sha256').update(raw).digest('hex')!==region.sha256)throw Error('Approved source changed: '+region.file);
 let i=0;const body=raw.replace(/^<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'').replace(/<path\b/g,()=>{const cls=region.classes[i++];return cls?`<path class="${cls}"`:'<path';});
 if(i!==region.classes.length)throw Error('Path count mismatch');
 return pad(body);
});
// Body data is base64-encoded once at build time. tokenURI assembles a standard
// SVG data URI without re-encoding hundreds of kilobytes on every metadata read.
export const parts=bodies.map((body,i)=>({name:labels.look[i],svg:body,data:Buffer.from(body).toString('base64')}));
export const colorTables=regions.map(r=>['h','o'].map(k=>r.colors[k]));
for(let i=0;i<colorTables.length;i++)for(let j=0;j<2;j++)parts.push({name:`Palette ${i}/${j}`,data:Buffer.from(colorTables[i][j].map(c=>c.slice(1)).join(''),'hex')});
export function traits(id){
 if(!Number.isInteger(id)||id<1||id>5555)throw Error('Invalid token');
 // Three exact approved originals are reserved for #1, #2 and #3.
 // 7,919 is coprime to 18,429: the remaining compositions cannot repeat.
 let x=id<=3?id-1:3+((id-4)*7919)%18429;
 const take=n=>{const value=x%n;x=Math.floor(x/n);return value;};
 const t={look:take(3),hairColor:take(12),outfitColor:take(16),backdrop:take(32)};
 const rank=((id-1)*811+37)%5555;t.rarity=rank<4166?0:rank<5277?1:2;return t;
}
const rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
export function tint(color,source,target){
 const c=rgb(color),s=rgb(source),t=rgb(target);
 return '#'+c.map((v,i)=>v<=s[i]
  ? Math.floor(v*t[i]/s[i])
  : t[i]+Math.floor((v-s[i])*(255-t[i])/(255-s[i]))
 ).map(v=>v.toString(16).padStart(2,'0')).join('');
}
export function style(t){
 let s='';
 for(const [kind,index,palette,bases] of [['h',t.hairColor,hairs,hairBases],['o',t.outfitColor,outfits,outfitBases]])if(index){s+=regions[t.look].colors[kind].map((c,i)=>`.${kind}${i.toString(16).padStart(3,'0')}{fill:${tint(c,bases[t.look],palette[index])}}`).join('');}
 if(t.backdrop)s+=`.b{fill:${backgrounds[t.backdrop]}}`;
 return s?`<style>${s}</style>`:'';
}
export function prefix(t){return pad(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 724 724" width="724" height="724">${style(t)}`);}
export function render(id){const t=traits(id);return prefix(t)+bodies[t.look]+'</svg>';}
export function description(id){const t=traits(id);return {id,name:labels.look[t.look],tag:labels.outfit[t.look].toUpperCase(),alt:`Hazel #${id}, ${labels.hair[t.look]}, ${labels.outfit[t.look]}`};}
if(process.argv[1]?.endsWith('character-art.mjs')){
 fs.mkdirSync('src/generated',{recursive:true});
 fs.writeFileSync('src/generated/gallery.json',JSON.stringify([1,2,3,8,19,144].map(description),null,2)+'\n');
 console.log('Approved SVG paths preserved:',regions.map(r=>r.classes.length).join(', '));
}
