// Deterministic hosted SVG artwork. Original #1–#3 remain pixel-identical.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
export const hairs=['Original','#604638','#b28a55','#c7b9a5','#747a88','#986275','#355f67','#69806b','#923e45','#3d415e','#8b60a0','#34332f'];
export const outfits=['Original','#45566c','#526353','#775456','#b99057','#626b74','#685771','#967f55','#3b7378','#bdb6a4','#42494a','#8b4249','#888579','#4f576b','#798e72','#ae775e'];
export const backgrounds=['Original','#dfadaf','#8fbdb8','#b8a4cd','#e7cf93','#8eaeca','#d9aa8e','#acbd8e','#d3b4d6','#dfba65','#9fc5a7','#9ea5d6','#efcbaa','#b77572','#bfbdde','#e1d5b9','#7ca3b4','#bab180','#d39cac','#9484bc','#bdd094','#d5ac71','#6eaaa0','#edbdc1','#92bed0','#c9c8b3','#d1c08c','#9dacc2','#bd8978','#ead5ca','#8aaf97','#baa18d'];
export const hairBases=['#29282c','#443531','#473d3a','#353331','#4e3934','#96918b','#574139','#4a3b33','#302b2d'];
export const outfitBases=['#29282c','#303b4a','#29282b','#5d6251','#733c3e','#37343a','#bcb29c','#a89776','#333f50'];
export const labels={
 look:['Ink hoodie','Indigo denim','Braided leather','Bob bomber','Fringe varsity','Wolf-cut tailoring','Ponytail knitwear','Wavy utility','Topknot technical'],
 hair:['Twin buns and long layers','High ponytail','Side braid','Chin-length bob','Long hair with blunt fringe','Layered wolf cut','Low ponytail','Shoulder-length waves','Messy high bun'],
 outfit:['Oversized hoodie','Denim overalls','Leather jacket','MA-1 bomber jacket','Two-tone varsity jacket','Tailored blazer and turtleneck','Knit cardigan and collared shirt','Multi-pocket utility vest','Technical windbreaker'],
 accessory:['Crossbody buckle and earrings','Overall hardware and earrings','Pendant and earrings','Ear cuff and bomber zipper','Small hoops and varsity snaps','Chain pendant and tailored lapels','Pearl studs and cardigan buttons','Star earring and utility hardware','Choker and metallic hairpin'],
};
export const patterns=['Solid','Halftone','Sun disc','Vertical stripes','Checkerboard','Starfield','Diagonal lines','Wave lines'];
export const pins=['None','Silver star','Golden crescent','Red lightning','Daisy','Safety pin','Wing emblem'];
export const regions=[...JSON.parse(fs.readFileSync('art/regions.json','utf8')),...JSON.parse(fs.readFileSync('art/expanded/regions.json','utf8'))];
export const originalBackgrounds=['#9b9286','#c38d76','#66798d',...regions.slice(3).map(r=>r.background)];
const pad=s=>s+' '.repeat((3-Buffer.byteLength(s)%3)%3);
export const bodies=regions.map(region=>{
 const raw=fs.readFileSync(`art/${region.directory||'approved'}/${region.file}`,'utf8');
 if(createHash('sha256').update(raw).digest('hex')!==region.sha256)throw Error('Source artwork changed: '+region.file);
 let i=0;const body=raw.replace(/^<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'').replace(/<path\b/g,()=>{const cls=region.classes[i++];return cls?`<path class="${cls}"`:'<path';});
 if(i!==region.classes.length)throw Error('Path count mismatch');
 return pad(body);
});
// Retained exports for the archived contract-authoring utilities.
export const parts=bodies.map((body,i)=>({name:labels.look[i],svg:body,data:Buffer.from(body).toString('base64')}));
export const colorTables=regions.map(r=>['h','o'].map(k=>r.colors[k]));
for(let i=0;i<colorTables.length;i++)for(let j=0;j<2;j++)parts.push({name:`Palette ${i}/${j}`,data:Buffer.from(colorTables[i][j].map(c=>c.slice(1)).join(''),'hex')});
export function traits(id){
 if(!Number.isInteger(id)||id<1||id>5555)throw Error('Invalid token');
 const looks=regions.length;
 const look=id<=looks?id-1:(id-looks-1)%looks;
 const serial=id<=looks?0:Math.floor((id-looks-1)/looks)+1;
 // 103 is coprime to 1,792: every look gets distinct backdrop/motif/pin combinations.
 const packed=(serial*103)%(backgrounds.length*patterns.length*pins.length);
 const t={look,hairColor:serial&&look<3?(serial*7+look)%hairs.length:0,
  outfitColor:serial&&look<3?Math.floor(serial*11/7)%outfits.length:0,
  backdrop:packed%backgrounds.length,
  pattern:Math.floor(packed/backgrounds.length)%patterns.length,
  pin:Math.floor(packed/(backgrounds.length*patterns.length))%pins.length};
 const rank=((id-1)*811+37)%5555;t.rarity=rank<4166?0:rank<5277?1:2;return t;
}
const rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
export function tint(color,source,target){
 const c=rgb(color),s=rgb(source),t=rgb(target);
 return '#'+c.map((v,i)=>v<=s[i]?Math.floor(v*t[i]/s[i]):t[i]+Math.floor((v-s[i])*(255-t[i])/(255-s[i]))).map(v=>Math.max(0,Math.min(255,v)).toString(16).padStart(2,'0')).join('');
}
function backdrop(t){
 if(!t.pattern)return '';
 const color=t.backdrop?backgrounds[t.backdrop]:originalBackgrounds[t.look];
 const cells=[null,{size:24,art:'<circle cx="12" cy="12" r="2.3" fill="#252330" opacity=".16"/>'},{size:724,art:'<circle cx="402" cy="242" r="217" fill="#fff2d1" opacity=".55"/>'},{size:56,art:'<path d="M14 0V56" stroke="#fff6df" stroke-width="16" opacity=".35"/>'},{size:80,art:'<path d="M0 0h40v40H0zM40 40h40v40H40z" fill="#fff6df" opacity=".28"/>'},{size:116,art:'<path d="m29 17 4 10 11 2-9 7 2 11-8-6-10 6 2-11-8-7 11-2zM82 72v12m-6-6h12" fill="#fff6df" stroke="#fff6df" stroke-width="2" opacity=".6"/>'},{size:42,art:'<path d="M-10 10 10-10M0 42 42 0m-10 52 20-20" stroke="#fff6df" stroke-width="3" opacity=".45"/>'},{size:120,art:'<path d="M-30 30Q0 0 30 30T90 30T150 30M-30 90Q0 60 30 90T90 90T150 90" fill="none" stroke="#fff6df" stroke-width="4" opacity=".45"/>'}];
 const c=cells[t.pattern];return `<defs><pattern id="hazel-background" width="${c.size}" height="${c.size}" patternUnits="userSpaceOnUse"><rect width="${c.size}" height="${c.size}" fill="${color}"/>${c.art}</pattern></defs>`;
}
export function style(t){
 let s='';
 for(const [kind,index,palette,bases] of [['h',t.hairColor,hairs,hairBases],['o',t.outfitColor,outfits,outfitBases]])if(index){s+=regions[t.look].colors[kind].map((c,i)=>`.${kind}${i.toString(16).padStart(3,'0')}{fill:${tint(c,bases[t.look],palette[index])}}`).join('');}
 if(t.pattern)s+='.b{fill:url(#hazel-background)}';else if(t.backdrop)s+=`.b{fill:${backgrounds[t.backdrop]}}`;
 return s?`<style>${s}</style>`:'';
}
function pin(t){
 if(!t.pin)return '';
 const [x,y]=[[219,532],[281,571],[264,500],[237,531],[257,560],[250,518],[240,560],[243,560],[239,543]][t.look];
 const shapes=['','<path d="m0-22 6 14 16 2-12 11 3 16L0 13l-13 8 3-16-12-11 16-2z" fill="#d5d9de"/>','<path d="M7-22a23 23 0 1 0 14 37A22 22 0 0 1 7-22Z" fill="#e7ba59"/>','<path d="m5-25-22 29h15l-3 23L19-6H3z" fill="#c75443"/>','<g fill="#f3ead3"><ellipse ry="13" rx="7" cy="-13"/><ellipse ry="13" rx="7" cy="13"/><ellipse ry="7" rx="13" cx="-13"/><ellipse ry="7" rx="13" cx="13"/></g><circle r="7" fill="#d5a444"/>','<path d="m-14 19 17-34a10 10 0 0 1 17 9L3 25a10 10 0 0 1-17-6Z" fill="none" stroke="#d9dce0" stroke-width="5"/><path d="m-7 16 15-28" stroke="#d9dce0" stroke-width="3"/>','<path d="M0 4 25-15l-4 14-12 7 8 1-7 9L0 21l-10-5-7-9 8-1-12-7-4-14z" fill="#c5b9a1"/>'];
 return `<g transform="translate(${x} ${y}) rotate(-12)" stroke="#282633" stroke-width="2.2" stroke-linejoin="round">${shapes[t.pin]}</g>`;
}
export function prefix(t){return pad(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 724 724" width="724" height="724">${backdrop(t)}${style(t)}`);}
export function render(id){const t=traits(id);return prefix(t)+bodies[t.look]+pin(t)+'</svg>';}
export function description(id){const t=traits(id);return {id,name:labels.look[t.look],tag:labels.outfit[t.look].toUpperCase(),alt:`Hazel #${id}, ${labels.hair[t.look]}, ${labels.outfit[t.look]}`};}
if(process.argv[1]?.endsWith('character-art.mjs')){
 fs.mkdirSync('src/generated',{recursive:true});
 fs.writeFileSync('src/generated/gallery.json',JSON.stringify([1,2,3,4,5,6,7,8,9].map(description),null,2)+'\n');
 console.log('SVG character designs:',regions.length);
}
