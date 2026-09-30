import fs from 'node:fs';
import {keccak256,toUtf8Bytes} from 'ethers';
import {parts,colorTables,hairs,outfits,backgrounds,hairBases,outfitBases} from './character-art.mjs';
const buffers=[],entries=[];let offset=0,originalBytes=0;
for(const part of parts){
 if(part.svg&&/<(?:image|script|foreignObject)\b|(?:href|src)="(?!#)/i.test(part.svg))throw Error('External assets forbidden');
 const b=Buffer.from(part.data);if(part.svg&&Buffer.from(part.data,'base64').toString()!==part.svg)throw Error('SVG encoding mismatch');
 buffers.push(b);entries.push({name:part.name,offset,length:b.length});offset+=b.length;originalBytes+=Buffer.byteLength(part.svg||b);
}
const bytes=Buffer.concat(buffers),chunks=[];
for(let off=0;off<bytes.length;off+=24000){const chunk=bytes.subarray(off,off+24000);const runtime=Buffer.concat([Buffer.from([0]),chunk]);chunks.push({initCode:'0x61'+runtime.length.toString(16).padStart(4,'0')+'80600a3d393df3'+runtime.toString('hex'),codeHash:keccak256(runtime),bytes:chunk.length});}
const art=[{name:'Approved full-detail SVG illustrations',originalBytes,storedBytes:bytes.length,hash:keccak256(bytes),chunks}];
const manifest={encoding:'base64-svg-body',art,parts:entries,manifestHash:keccak256(toUtf8Bytes(JSON.stringify({art,entries,colorTables,hairs,outfits,backgrounds,hairBases,outfitBases})))};
fs.mkdirSync('public/deployment',{recursive:true});fs.writeFileSync('public/deployment/art.json',JSON.stringify(manifest));
const table=entries.map(e=>e.offset.toString(16).padStart(8,'0')+e.length.toString(16).padStart(8,'0')).join('');
const hashes=chunks.map(c=>c.codeHash.slice(2)).join('');
fs.writeFileSync('contracts/ArtManifest.sol',`// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
// Generated from the approved, unmodified SVG paths and palette annotations.
library ArtManifest {
 bytes32 internal constant MANIFEST = ${manifest.manifestHash};
 uint256 internal constant CHUNKS = ${chunks.length};
 function chunkHash(uint256 i) internal pure returns(bytes32 result){
  require(i<CHUNKS); bytes memory hashes=hex"${hashes}";
  assembly("memory-safe"){result:=mload(add(add(hashes,32),mul(i,32)))}
 }
 function entry(uint256 i) internal pure returns(uint256 start,uint256 size){
  require(i<${entries.length}); bytes memory table=hex"${table}";
  assembly("memory-safe"){start:=shr(224,mload(add(add(table,32),mul(i,8)))) size:=shr(224,mload(add(add(table,36),mul(i,8))))}
 }
}
`);
console.log({originalBytes,storedBytes:bytes.length,dataTransactions:chunks.length,approvedIllustrations:3});
