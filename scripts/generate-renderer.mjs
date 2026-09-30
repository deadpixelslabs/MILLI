import fs from 'node:fs';
import {hairs,outfits,backgrounds,labels} from './character-art.mjs';
const array=a=>'['+a.map(x=>JSON.stringify(x)).join(', ')+']';
const s=`// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "solady/src/utils/Base64.sol";
import {LibZip} from "solady/src/utils/LibZip.sol";
import {ArtManifest} from "./ArtManifest.sol";
/// @notice Immutable modular SVG art; the approved face is shared and preserved.
/// 5,555 unique character tuples, excluding background and frame from uniqueness.
/// Public deterministic allocation, not a hidden/randomized rarity lottery.
contract HazelsRenderer {
 using Strings for uint256;
 address[] private _parts;
 bytes32 public constant ART_MANIFEST = ArtManifest.MANIFEST;
 error InvalidArtwork(); error InvalidToken();
 constructor(address[] memory parts) {
  if(parts.length==0 || parts.length>8) revert InvalidArtwork();
  _parts=parts;
  if(keccak256(_read())!=ArtManifest.ATLAS_HASH) revert InvalidArtwork();
 }
 function _read() internal view returns(bytes memory result){
  uint256 length;
  for(uint256 i;i<_parts.length;++i){uint256 size=_parts[i].code.length;if(size<2||size>24001)revert InvalidArtwork();length+=size-1;}
  result=new bytes(length);uint256 offset;
  for(uint256 i;i<_parts.length;++i){address part=_parts[i];uint256 size=part.code.length-1;assembly("memory-safe"){extcodecopy(part,add(add(result,32),offset),1,size)}offset+=size;}
 }
 function _part(bytes memory packed,uint256 index) internal pure returns(bytes memory){
  (uint256 start,uint256 size)=ArtManifest.entry(index);bytes memory fragment=new bytes(size);
  assembly("memory-safe"){let src:=add(add(packed,32),start) let dest:=add(fragment,32) for {let i:=0} lt(i,size) {i:=add(i,32)} {mstore(add(dest,i),mload(add(src,i)))}}
  return LibZip.flzDecompress(fragment);
 }
 // hair, fringe, outfit, accessory, hair ink, outfit ink, backdrop, rarity.
 function traits(uint256 id) public pure returns(uint8[8] memory t){
  if(id==0||id>5555)revert InvalidToken();
  uint256 x=((id-1)*7919+137)%2654208;
  t[0]=uint8(x%16);x/=16;t[1]=uint8(x%6);x/=6;t[2]=uint8(x%16);x/=16;
  t[3]=uint8(x%12);x/=12;t[4]=uint8(x%12);x/=12;t[5]=uint8(x%12);
  t[6]=uint8((id*7)%32);
  uint256 rank=((id-1)*811+37)%5555;t[7]=rank<4166?0:rank<5277?1:2;
 }
 function hairColor(uint256 i) public pure returns(string memory){return ${array(hairs)}[i];}
 function outfitColor(uint256 i) public pure returns(string memory){return ${array(outfits)}[i];}
 function backdropColor(uint256 i) public pure returns(string memory){return ${array(backgrounds)}[i];}
 function hairName(uint256 i) public pure returns(string memory){return ${array(labels.hair)}[i];}
 function outfitName(uint256 i) public pure returns(string memory){return ${array(labels.outfit)}[i];}
 function accessoryName(uint256 i) public pure returns(string memory){return ${array(labels.accessory)}[i];}
 function rarityName(uint256 i) public pure returns(string memory){return ["Signature","Rare","Legendary"][i];}
 function _use(string memory name,string memory color) internal pure returns(bytes memory){return abi.encodePacked('<g color="',color,'"><use href="#',name,'"/></g>');}
 function renderSVG(uint256 id) public view returns(string memory){
  uint8[8] memory t=traits(id);string memory ink=hairColor(t[4]);
  string memory frame=t[7]==2?'url(#foil)':t[7]==1?'#ccb17a':'#e3d9c8';
  bytes memory body=abi.encodePacked(_use(string.concat('hair',uint256(t[0]).toString()),ink),_use('approved-face',ink),_use(string.concat('outfit',uint256(t[2]).toString()),outfitColor(t[5])),_use(string.concat('bang',uint256(t[1]).toString()),ink),_use(string.concat('accessory',uint256(t[3]).toString()),'#d4c5ac'));
  bytes memory packed=_read();bytes memory layers=abi.encodePacked('<defs>',_part(packed,0),_part(packed,1+t[0]),_part(packed,17+t[1]),_part(packed,23+t[2]),_part(packed,39+t[3]),'</defs>');
  return string(abi.encodePacked('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 840" width="768" height="840">',layers,'<defs><linearGradient id="foil"><stop stop-color="#cfabcc"/><stop offset=".4" stop-color="#aed4ce"/><stop offset=".7" stop-color="#eee0b2"/><stop offset="1" stop-color="#afbddb"/></linearGradient><clipPath id="portrait"><path d="M24 24h720v720H24z"/></clipPath></defs><path fill="#242322" d="M0 0h768v840H0z"/><path fill="',frame,'" d="M12 12h744v732H12z"/><g clip-path="url(#portrait)"><path fill="',backdropColor(t[6]),'" d="M24 24h720v720H24z"/>',body,'</g><g fill="',frame,'"><path d="M26 770h5v12h16v-12h5v32h-5v-15H31v15h-5z"/><text x="68" y="791" font-family="monospace" font-size="17" letter-spacing="2">HAZELS CTO</text><text x="28" y="820" font-family="monospace" font-size="10" letter-spacing="2">',["SIGNATURE","RARE","LEGENDARY"][t[7]],' / #',id.toString(),'</text>',t[7]>0?'<path d="M704 770l4 11 12 4-12 4-4 11-4-11-12-4 12-4z"/>':'','</g></svg>'));
 }
 function _attribute(string memory name,string memory value) internal pure returns(bytes memory){return abi.encodePacked('{"trait_type":"',name,'","value":"',value,'"}');}
 function tokenURI(uint256 id) external view returns(string memory){
  uint8[8] memory t=traits(id);
  bytes memory attributes=abi.encodePacked(_attribute('Rarity',rarityName(t[7])),',',_attribute('Hair',hairName(t[0])),',',_attribute('Fringe',uint256(t[1]+1).toString()),',',_attribute('Outfit',outfitName(t[2])),',',_attribute('Accessory',accessoryName(t[3])),',',_attribute('Hair color',hairColor(t[4])),',',_attribute('Outfit color',outfitColor(t[5])),',',_attribute('Background',backdropColor(t[6])));
  return string.concat('data:application/json;base64,',Base64.encode(abi.encodePacked('{"name":"Hazels CTO Freemint #',id.toString(),'","description":"One of 5,555 unique modular character compositions. The approved face stays constant; hairstyles, outfits, accessories and palettes vary. Immutable onchain SVG, deterministic traits, instant reveal.","image":"data:image/svg+xml;base64,',Base64.encode(bytes(renderSVG(id))),'","attributes":[',attributes,']}')));
 }
}
`;
fs.writeFileSync('contracts/HazelsRenderer.sol',s);
