import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
export const MILLI_SUPPLY=10000;
export const MILLI_ORIGIN='https://www.milliformillion.xyz';
export const MILLI_BASE_URI=`${MILLI_ORIGIN}/milli/metadata/`;
const source=JSON.parse(gunzipSync(fs.readFileSync('collection/milli/metadata.json.gz')));
export function milliTokenId(input){
 if(typeof input!=='string'||!/^([1-9][0-9]{0,4})(?:\.json)?$/.test(input))return null;
 const id=Number(input.replace(/\.json$/,''));return id<=MILLI_SUPPLY?id:null;
}
export function milliMetadata(id){
 if(!Number.isInteger(id)||id<1||id>MILLI_SUPPLY)throw new RangeError('MILLI token ID must be 1–10000');
 const original=source[id-1];
 return {...original,image:`${MILLI_ORIGIN}/milli/images/${id}.png`,external_url:`${MILLI_ORIGIN}/?token=${id}#collection`};
}
export function milliCSV(){
 const quote=v=>'"'+String(v).replaceAll('"','""')+'"';
 const headers=['tokenID','name','description','file_name','external_url',...source[0].attributes.map(a=>`attributes[${a.trait_type}]`)];
 return [headers,...source.map((r,i)=>[i+1,r.name,r.description,`${i+1}.png`,`${MILLI_ORIGIN}/?token=${i+1}#collection`,...r.attributes.map(a=>a.value)])].map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n';
}
