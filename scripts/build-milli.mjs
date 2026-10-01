import fs from 'node:fs';
import {gunzipSync,deflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';
for(const p of ['public/art/characters','public/art/social.png','public/art/approved-preview.webp','public/deployment'])fs.rmSync(p,{recursive:true,force:true});
const root='collection/milli';
const manifest=JSON.parse(fs.readFileSync(`${root}/manifest.json`,'utf8'));
const records=JSON.parse(gunzipSync(fs.readFileSync(`${root}/metadata.json.gz`)));
const output='public/milli';fs.mkdirSync(`${output}/images`,{recursive:true});
const expectedVersion=createHash('sha256').update(fs.readFileSync(`${root}/manifest.json`)).digest('hex');
let cached=false;try{cached=fs.readFileSync(`${output}/.build-version`,'utf8')===expectedVersion&&records.every(r=>fs.existsSync(`${output}/images/${r.edition}.png`));}catch{}
const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(b){let c=0xffffffff;for(const v of b)c=crcTable[(c^v)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
function chunk(name,data){const kind=Buffer.from(name),len=Buffer.alloc(4),crc=Buffer.alloc(4);len.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([kind,data])));return Buffer.concat([len,kind,data,crc]);}
function png(rgba){const scan=Buffer.allocUnsafe(512*(1+512*4));for(let y=0;y<512;y++){scan[y*2049]=0;rgba.copy(scan,y*2049+1,y*2048,(y+1)*2048);}const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(512,0);ihdr.writeUInt32BE(512,4);ihdr[8]=8;ihdr[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(scan,{level:4})),chunk('IEND',Buffer.alloc(0))]);}
if(!cached){
 const unpack=name=>gunzipSync(Buffer.concat(manifest.bundles[name].map(file=>fs.readFileSync(`${root}/${file}`))));
 const tiles=unpack('tiles.bin.gz'),indices=unpack('indices.bin.gz');
 if(tiles.length!==manifest.tiles*1024||indices.length!==10000*1024*4)throw Error('Incomplete artwork bundle');
 for(let id=1;id<=10000;id++){
  const pixels=Buffer.allocUnsafe(512*512*4),start=(id-1)*1024*4;
  for(let cell=0;cell<1024;cell++){const tile=indices.readUInt32LE(start+cell*4)*1024,x=(cell%32)*16,y=Math.floor(cell/32)*16;
   for(let row=0;row<16;row++)tiles.copy(pixels,((y+row)*512+x)*4,tile+row*64,tile+(row+1)*64);
  }
  if(createHash('sha256').update(pixels).digest('hex')!==manifest.pixelSha256[id-1])throw Error(`Artwork mismatch #${id}`);
  fs.writeFileSync(`${output}/images/${id}.png`,png(pixels));
  if(id%1000===0)console.log(`MILLI: ${id}/10000 pixel-exact images`);
 }
 fs.writeFileSync(`${output}/.build-version`,expectedVersion);
}
const categories=Object.entries(manifest.traits).map(([name,values])=>({name,values:Object.keys(values),counts:Object.values(values)}));
const tokens=records.map(r=>r.attributes.map((a,i)=>categories[i].values.indexOf(a.value)));
if(tokens.some(t=>t.length!==6||t.includes(-1)))throw Error('Trait dictionary mismatch');
fs.writeFileSync(`${output}/catalog.json`,JSON.stringify({name:manifest.name,supply:manifest.supply,categories,tokens}));
fs.writeFileSync(`${output}/summary.json`,JSON.stringify({name:manifest.name,supply:manifest.supply,chainId:1,uniqueImages:manifest.uniquePixelImages,uniqueTraitCombinations:manifest.uniqueTraitCombinations,categories:categories.map(c=>({name:c.name,variants:c.values.length}))}));
console.log('MILLI collection ready: 10,000 images, six original trait categories, Ethereum mainnet.');
