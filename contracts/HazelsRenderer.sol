// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "solady/src/utils/Base64.sol";
import {ArtManifest} from "./ArtManifest.sol";
/// @notice Preserves all approved SVG geometry. Only material palettes vary.
/// Image bodies are encoded at build time, so metadata reads copy immutable data
/// instead of compressing or encoding the full illustrations on every request.
contract HazelsRenderer {
 using Strings for uint256;
 address[] private _parts;
 bytes32 public constant ART_MANIFEST = ArtManifest.MANIFEST;
 error InvalidArtwork(); error InvalidToken();
 constructor(address[] memory parts){
  if(parts.length!=ArtManifest.CHUNKS)revert InvalidArtwork();
  for(uint256 i;i<parts.length;++i)if(parts[i].codehash!=ArtManifest.chunkHash(i))revert InvalidArtwork();
  _parts=parts;
 }
 function _body(uint256 look) internal view returns(bytes memory result){
  (uint256 start,uint256 size)=ArtManifest.entry(look);
  result=new bytes(size);uint256 dest;uint256 index=start/24000;uint256 offset=start%24000;
  while(dest<size){
   address part=_parts[index];uint256 length=part.code.length-1-offset;
   if(length>size-dest)length=size-dest;
   assembly("memory-safe"){extcodecopy(part,add(add(result,32),dest),add(offset,1),length)}
   dest+=length;++index;offset=0;
  }
 }
 function _compose(uint256 look,bytes memory head,bytes memory tail) internal view returns(string memory result){
  (uint256 start,uint256 size)=ArtManifest.entry(look);
  result=new string(head.length+size+tail.length);
  assembly("memory-safe") {
   let out:=add(result,32)
   for {let i:=0} lt(i,mload(head)) {i:=add(i,32)} {mstore(add(out,i),mload(add(add(head,32),i)))}
   let dest:=add(add(out,mload(head)),size)
   for {let i:=0} lt(i,mload(tail)) {i:=add(i,32)} {mstore(add(dest,i),mload(add(add(tail,32),i)))}
  }
  uint256 index=start/24000;uint256 offset=start%24000;uint256 copied;
  while(copied<size){
   address part=_parts[index];uint256 length=part.code.length-1-offset;
   if(length>size-copied)length=size-copied;
   assembly("memory-safe"){extcodecopy(part,add(add(add(result,32),mload(head)),copied),add(offset,1),length)}
   copied+=length;++index;offset=0;
  }
 }
 // Look, hair palette, outfit palette, background, edition.
 function traits(uint256 id) public pure returns(uint8[5] memory t){
  if(id==0||id>5555)revert InvalidToken();
  uint256 x=id<=3?id-1:3+((id-4)*7919)%18429;
  t[0]=uint8(x%3);x/=3;t[1]=uint8(x%12);x/=12;t[2]=uint8(x%16);x/=16;t[3]=uint8(x%32);
  uint256 rank=((id-1)*811+37)%5555;t[4]=rank<4166?0:rank<5277?1:2;
 }
 function hairColor(uint256 i) public pure returns(string memory){return ["Original", "#604638", "#735142", "#55463f", "#42464c", "#574750", "#3d494a", "#48483d", "#614347", "#393c43", "#6a5648", "#34332f"][i];}
 function outfitColor(uint256 i) public pure returns(string memory){return ["Original", "#45566c", "#526353", "#775456", "#8c735c", "#626b74", "#685771", "#796855", "#3b555b", "#a29580", "#42494a", "#654649", "#888579", "#4f576b", "#6f7470", "#61513e"][i];}
 function backdropColor(uint256 i) public pure returns(string memory){return ["Original", "#b99797", "#7d9190", "#9c95a9", "#c0ab89", "#8d9baf", "#b89e8d", "#929d8d", "#b2a4b6", "#baa879", "#a6b5ab", "#9aa9ba", "#d1b69c", "#aa7d73", "#ada8bc", "#c5b8a4", "#7b939a", "#98927c", "#b4a1a5", "#8b8198", "#adb39b", "#baa17c", "#78908c", "#c3aaad", "#90a2ae", "#a8a49b", "#b4aa8c", "#929caa", "#ad9185", "#c4b7b0", "#81958a", "#b8aaa0"][i];}
 function lookName(uint256 i) public pure returns(string memory){return ["Ink hoodie", "Indigo denim", "Braided leather"][i];}
 function hairName(uint256 i) public pure returns(string memory){return ["Twin buns and long layers", "High ponytail", "Side braid"][i];}
 function outfitName(uint256 i) public pure returns(string memory){return ["Oversized hoodie", "Denim overalls", "Leather jacket"][i];}
 function accessoryName(uint256 i) public pure returns(string memory){return ["Crossbody buckle and earrings", "Overall hardware and earrings", "Pendant and earrings"][i];}
 function rarityName(uint256 i) public pure returns(string memory){return ["Signature","Rare","Legendary"][i];}

 function _rgb(string memory text) internal pure returns(uint256 value){
  bytes memory b=bytes(text);for(uint256 i=1;i<7;++i){uint256 c=uint8(b[i]);value=value*16+(c>=97?c-87:c-48);}
 }
 function _paint(bytes memory colors,bytes1 kind,uint256 source,uint256 target) internal pure returns(bytes memory result){
  uint256 length=colors.length/3*19;result=new bytes(length+32);
  assembly("memory-safe") {
   function tint(v,s,t) -> out {
    switch gt(v,s)
    case 0 {out:=div(mul(v,t),s)}
    default {out:=add(t,div(mul(sub(v,s),sub(255,t)),sub(255,s)))}
   }
   let digits:="0123456789abcdef"
   let data:=add(colors,32)
   let output:=add(result,32)
   let count:=div(mload(colors),3)
   for {let i:=0} lt(i,count) {i:=add(i,1)} {
    let p:=add(output,mul(i,19))
    mstore(p,".h000{fill:#000000}")
    mstore8(add(p,1),byte(0,kind))
    mstore8(add(p,2),byte(and(shr(8,i),15),digits))
    mstore8(add(p,3),byte(and(shr(4,i),15),digits))
    mstore8(add(p,4),byte(and(i,15),digits))
    let color:=shr(232,mload(add(data,mul(i,3))))
    for {let j:=0} lt(j,3) {j:=add(j,1)} {
     let shift:=mul(sub(2,j),8)
     let v:=tint(and(shr(shift,color),255),and(shr(shift,source),255),and(shr(shift,target),255))
     let dest:=add(add(p,12),mul(j,2))
     mstore8(dest,byte(shr(4,v),digits))
     mstore8(add(dest,1),byte(and(v,15),digits))
    }
   }
   mstore(result,length)
  }
 }
 function _prefix(uint8[5] memory t) internal view returns(bytes memory result){
  bytes memory css;
  if(t[1]!=0)css=_paint(_body(3+uint256(t[0])*2),'h',_rgb(["#29282c", "#443531", "#473d3a"][t[0]]),_rgb(hairColor(t[1])));
  if(t[2]!=0)css=abi.encodePacked(css,_paint(_body(4+uint256(t[0])*2),'o',_rgb(["#29282c", "#303b4a", "#29282b"][t[0]]),_rgb(outfitColor(t[2]))));
  if(t[3]!=0)css=abi.encodePacked(css,'.b{fill:',backdropColor(t[3]),'}');
  if(css.length!=0)css=abi.encodePacked('<style>',css,'</style>');
  result=abi.encodePacked('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 724 724" width="724" height="724">',css);
  uint256 remainder=result.length%3;
  if(remainder==1)result=abi.encodePacked(result,'  ');
  if(remainder==2)result=abi.encodePacked(result,' ');
 }
 function imageURI(uint256 id) public view returns(string memory){
  uint8[5] memory t=traits(id);
  return _compose(t[0],abi.encodePacked('data:image/svg+xml;base64,',Base64.encode(_prefix(t))),bytes('PC9zdmc+'));
 }
 function _attribute(string memory name,string memory value) internal pure returns(bytes memory){
  // Escape # as JSON Unicode so the UTF-8 data URI never contains a fragment.
  bytes memory v=bytes(value);
  if(v.length>0&&v[0]=='#'){bytes memory tail=new bytes(v.length-1);for(uint256 i=1;i<v.length;++i)tail[i-1]=v[i];value=string(abi.encodePacked('\\u0023',tail));}
  return abi.encodePacked('{"trait_type":"',name,'","value":"',value,'"}');
 }
 function tokenURI(uint256 id) external view returns(string memory){
  uint8[5] memory t=traits(id);
  bytes memory attributes=abi.encodePacked(_attribute('Look',lookName(t[0])),',',_attribute('Hair',hairName(t[0])),',',_attribute('Outfit',outfitName(t[0])),',',_attribute('Accessory',accessoryName(t[0])),',',_attribute('Hair color',hairColor(t[1])),',',_attribute('Outfit color',outfitColor(t[2])),',',_attribute('Background',t[3]==0?["#9b9286", "#c38d76", "#66798d"][t[0]]:backdropColor(t[3])),',',_attribute('Rarity',rarityName(t[4])));
  return _compose(t[0],abi.encodePacked('data:application/json;utf8,{"name":"Hazels CTO Freemint \\u0023',id.toString(),'","description":"One of 5,555 distinct color compositions of three approved illustrations. Original faces, hairstyles, clothing, accessories and all SVG paths are preserved. Hair, outfit and background palettes vary. Fully onchain and immutable.","image":"data:image/svg+xml;base64,',Base64.encode(_prefix(t))),abi.encodePacked('PC9zdmc+","attributes":[',attributes,']}'));
 }
}
