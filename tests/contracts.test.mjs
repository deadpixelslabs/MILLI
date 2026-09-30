import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import * as E from 'ethers';
import solc from 'solc';
import sharp from 'sharp';
import { render, traits } from '../scripts/character-art.mjs';
const require=createRequire(import.meta.url);
const root=new URL('../',import.meta.url);
const artifacts=JSON.parse(fs.readFileSync(new URL('public/deployment/contracts.json',root)));
const manifest=JSON.parse(fs.readFileSync(new URL('public/deployment/art.json',root)));
const TREASURY='0x9d4B1bDF276a2B30F9FA95DB3beC0b40477c2941';
const zero=E.ZeroAddress;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function auxiliary(){
 const source=`// SPDX-License-Identifier: MIT
 pragma solidity 0.8.26;
 interface IMint {function mint(uint256) external;}
 contract Validator {bool public blocked; address public caller; address public from; address public to; uint256 public token; function policy(bool b,address c,address f,address t,uint256 id) external {blocked=b;caller=c;from=f;to=t;token=id;} function validateTransfer(address c,address f,address t,uint256 id) external view {require(!blocked,"Blocked");if(caller!=address(0))require(c==caller&&f==from&&t==to&&id==token,"Wrong transfer args");}}
 contract Receiver {IMint public target;bool public reentrySucceeded;constructor(address c){target=IMint(c);} function run(uint256 n) external {target.mint(n);} function onERC721Received(address,address,uint256,bytes calldata) external returns(bytes4){try target.mint(1){reentrySucceeded=true;}catch{}return this.onERC721Received.selector;}}
 contract Rejector {function run(address c) external {IMint(c).mint(1);} }
 contract BatchTraits {function batch(address r,uint256 start,uint256 length) external view returns(uint8[5][] memory rows){rows=new uint8[5][](length);for(uint256 i;i<length;i++){(bool ok,bytes memory data)=r.staticcall(abi.encodeWithSignature("traits(uint256)",start+i));require(ok);rows[i]=abi.decode(data,(uint8[5]));}}}
 `;
 const c=JSON.parse(solc.compile(JSON.stringify({language:'Solidity',sources:{'Aux.sol':{content:source}},settings:{optimizer:{enabled:true,runs:200},evmVersion:'paris',outputSelection:{'*':{'*':['abi','evm.bytecode.object']}}}})));
 assert(!c.errors?.some(e=>e.severity==='error'));return c.contracts['Aux.sol'];
}
test('deployed NFT invariants, treasury cap, validator and all character assignments', {timeout:240000},async()=>{
 const server=net.createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;await new Promise(r=>server.close(r));
 const anvil=require.resolve('@foundry-rs/anvil-linux-amd64/bin/anvil');
 const child=spawn(anvil,['--host','127.0.0.1','--port',String(port),'--chain-id','4663','--silent','--gas-limit','100000000'],{stdio:'ignore'});
 const provider=new E.JsonRpcProvider(`http://127.0.0.1:${port}`,4663,{staticNetwork:true,cacheTimeout:-1});provider.pollingInterval=10;
 let totalGas=0n;
 try{
  for(let i=0;i<80;i++){try{await provider.send('eth_chainId',[]);break;}catch{if(i===79)throw Error('EVM startup failed');await delay(50);}}
  const user=await provider.getSigner(0),buyer=await provider.getSigner(1),operator=await provider.getSigner(2);
  await provider.send('anvil_impersonateAccount',[TREASURY]);await provider.send('anvil_setBalance',[TREASURY,E.toBeHex(E.parseEther('1000'))]);
  const treasury=await provider.getSigner(TREASURY);
  const chunks=[];
  for(const chunk of manifest.art.flatMap(a=>a.chunks)){
   assert((chunk.initCode.length-2)/2<49152);
   const r=await(await treasury.sendTransaction({data:chunk.initCode})).wait();totalGas+=r.gasUsed;
   assert.equal(E.keccak256(await provider.getCode(r.contractAddress)),chunk.codeHash);chunks.push(r.contractAddress);
  }
  const deploy=async(name,args=[],signer=treasury)=>{const a=artifacts[name];const c=await new E.ContractFactory(a.abi,a.bytecode,signer).deploy(...args);const r=await c.deploymentTransaction().wait();totalGas+=r.gasUsed;assert((await provider.getCode(await c.getAddress())).length/2-1<=24576);return c;};
  const renderer=await deploy('HazelsRenderer',[chunks]);
  await assert.rejects(deploy('HazelsRenderer',[[await user.getAddress()]]));
  await assert.rejects(deploy('HazelsRenderer',[[...chunks].reverse()]));
  const c=await deploy('HazelsCTOFreemint',[await renderer.getAddress()]);
  assert.equal(await c.name(),'Hazels CTO Freemint');assert.equal(await c.owner(),TREASURY);assert.equal(await c.MAX_SUPPLY(),5555n);assert.equal(await c.WALLET_LIMIT(),2n);
  assert.equal(await c.mintOpen(),false);await assert.rejects(c.connect(user).mint(1));await assert.rejects(c.connect(user).setMintOpen(true));
  await(await c.setMintOpen(true)).wait();await assert.rejects(c.connect(user).mint(0));await assert.rejects(c.connect(user).mint(3));
  await assert.rejects(user.sendTransaction({to:await c.getAddress(),data:c.interface.encodeFunctionData('mint',[1]),value:1n}));
  await(await c.connect(user).mint(2)).wait();assert.equal(await c.mintedBy(await user.getAddress()),2n);assert.equal(await c.mintAllowance(await user.getAddress()),0n);
  await(await c.connect(user).transferFrom(await user.getAddress(),await buyer.getAddress(),1)).wait();await assert.rejects(c.connect(user).mint(1));assert.equal(await c.balanceOf(await user.getAddress()),1n);
  assert.equal(await c.supportsInterface('0x80ac58cd'),true);assert.equal(await c.supportsInterface('0x5b5e139f'),true);assert.equal(await c.supportsInterface('0x2a55205a'),true);
  const iid=['getTransferValidator()','getTransferValidationFunction()','setTransferValidator(address)'].reduce((x,s)=>x^BigInt(E.id(s).slice(0,10)),0n);
  assert.equal(await c.supportsInterface(E.toBeHex(iid,4)),true);assert.deepEqual([...await c.getTransferValidationFunction()],['0xcaee23ea',true]);
  assert.deepEqual([...await c.royaltyInfo(1,E.parseEther('1'))],[TREASURY,E.parseEther('0.05')]);
  assert.deepEqual([...await c.royaltyInfo(1,19)],[TREASURY,0n]);
  await assert.rejects(c.connect(user).setTransferValidator(await buyer.getAddress()));await assert.rejects(c.setTransferValidator(await buyer.getAddress()));
  const aux=auxiliary();const deployAux=async(name,args=[])=>{const a=aux[name];const d=await new E.ContractFactory(a.abi,a.evm.bytecode.object,treasury).deploy(...args);await d.waitForDeployment();return d;};
  const v=await deployAux('Validator');await(await c.setTransferValidator(await v.getAddress())).wait();
  await(await v.policy(true,zero,zero,zero,0)).wait();
  await assert.rejects(c.connect(buyer).transferFrom(await buyer.getAddress(),await user.getAddress(),1));
  await(await c.connect(buyer).mint(1)).wait();assert.equal(await c.mintedBy(await buyer.getAddress()),1n);
  await(await c.connect(buyer).approve(await operator.getAddress(),1)).wait();
  await(await v.policy(false,await operator.getAddress(),await buyer.getAddress(),await user.getAddress(),1)).wait();
  await(await c.connect(operator).transferFrom(await buyer.getAddress(),await user.getAddress(),1)).wait();
  await(await c.setTransferValidator(zero)).wait();
  const receiver=await deployAux('Receiver',[await c.getAddress()]);await(await receiver.run(1)).wait();assert.equal(await receiver.reentrySucceeded(),false);assert.equal(await c.mintedBy(await receiver.getAddress()),1n);
  const rejector=await deployAux('Rejector');const before=await c.totalSupply();await assert.rejects(rejector.run(await c.getAddress()));assert.equal(await c.totalSupply(),before);assert.equal(await c.mintedBy(await rejector.getAddress()),0n);
  await(await c.mint(5)).wait();assert.equal(await c.mintedBy(TREASURY),5n);assert.equal(await c.mintAllowance(TREASURY),5555n-await c.totalSupply());
  // Verify every token's onchain trait tuple against the website renderer and
  // uniqueness of complete visible compositions, excluding edition numbers.
  const batch=await deployAux('BatchTraits');const unique=new Set(),counts=[0,0,0];
  for(let start=1;start<=5555;start+=200){const length=Math.min(200,5556-start);const rows=await batch.batch(await renderer.getAddress(),start,length,{gasLimit:25000000});for(let i=0;i<length;i++){const row=rows[i].map(Number);const t=traits(start+i);assert.deepEqual(row,[t.look,t.hairColor,t.outfitColor,t.backdrop,t.rarity]);const key=row.slice(0,4).join(':');assert(!unique.has(key));unique.add(key);counts[row[4]]++;}}
  assert.equal(unique.size,5555);assert.deepEqual(counts,[4166,1111,278]);await assert.rejects(renderer.traits(0));await assert.rejects(renderer.traits(5556));await assert.rejects(c.tokenURI(5555));
  fs.mkdirSync(new URL('test-results',root),{recursive:true});
  const renderIds=[1,2,3,8,19,144,888,2345,5555];
  let readGas=0n;
  for(const id of renderIds){const image=await renderer.imageURI(id);const svg=Buffer.from(image.slice(image.indexOf(',')+1),'base64').toString();assert.equal(svg,render(id));assert(!/<(?:image|script|foreignObject)\b|(?:href|src)="(?!#)/i.test(svg));await sharp(Buffer.from(svg)).resize(384,384).png().toFile(new URL(`test-results/onchain-${id}.png`,root).pathname);}
  const uri=await c.tokenURI(1);const metadata=await (await fetch(uri)).json();const svg=Buffer.from(metadata.image.split(',')[1],'base64').toString();assert.equal(svg,render(1));assert.equal(metadata.name,'Hazels CTO Freemint #1');assert.equal(metadata.attributes.length,8);
  for(const id of renderIds){const gas=await renderer.tokenURI.estimateGas(id);if(gas>readGas)readGas=gas;assert(gas<30000000n,`Metadata read gas too high for ${id}: ${gas}`);const m=await(await fetch(await renderer.tokenURI(id))).json();assert.equal(Buffer.from(m.image.split(',')[1],'base64').toString(),render(id));}
  const gasAtMint=await c.mint.estimateGas(2);
  // Reach the actual cap through real mints. No storage mutation or cap mocks.
  while(await c.totalSupply()<5555n){const remain=5555n-await c.totalSupply();await(await c.mint(remain>300n?300n:remain,{gasLimit:25000000})).wait();}
  assert.equal(await c.totalSupply(),5555n);assert.equal(await c.mintAllowance(TREASURY),0n);await assert.rejects(c.mint(1));await assert.rejects(c.connect(buyer).mint(1));assert.equal(await c.ownerOf(5555),TREASURY);
  assert.equal(await c.tokenURI(2345),await renderer.tokenURI(2345));const collectionReadGas=await c.tokenURI.estimateGas(2345);assert(collectionReadGas<30000000n,`Collection metadata read gas too high: ${collectionReadGas}`);
  await(await c.setMintOpen(false)).wait();assert.equal(await c.mintOpen(),false);
  const proof={environment:'Isolated Anvil EVM, no public-chain deployment',compiler:solc.version(),uniqueCharacters:unique.size,rarityCounts:counts,checkedOnchainAssignments:5555,svgMatchesWebsite:renderIds,deploymentGas:String(totalGas),rendererTokenURIGas:String(readGas),collectionTokenURIGas:String(collectionReadGas),deploymentTransactions:chunks.length+2,treasuryTwoMintGas:String(gasAtMint),checks:['lifetime wallet limit survives transfers','treasury mints more than two','real 5555 cap reached; treasury cannot exceed it','zero price / nonpayable','unsafe receiver rollback','reentrant mint blocked','owner-only controls','ERC721/ERC2981/ICreatorToken interfaces','5% royalty math','validator transfer authorization, direct and approved operator','mint exempt from transfer validator','immutable data hash checks','SVG metadata decodes without external assets','all 5555 visible compositions unique; backgrounds included']};
  fs.writeFileSync(new URL('test-results/contracts.json',root),JSON.stringify(proof,null,2));console.log(proof);
 }finally{provider.destroy();child.kill();}
});
