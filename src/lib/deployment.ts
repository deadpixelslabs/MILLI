import { Contract, ContractFactory, keccak256, ZeroAddress, type JsonRpcApiProvider, type JsonRpcSigner, type TransactionReceipt } from 'ethers';
import { CHAIN_ID, TREASURY, sameAddress } from './config';
import { abi } from './collection';
type Chunk={initCode:string;codeHash:string;bytes:number};
export type Manifest={manifestHash:string;art:{name:string;compressedBytes:number;chunks:Chunk[]}[]};
type Artifact={abi:any[];bytecode:string;deployedBytecode:string;immutableReferences:Record<string,{start:number;length:number}[]>};
export type Artifacts={HazelsRenderer:Artifact;HazelsCTOFreemint:Artifact};
export type Journal={chainId:number;deployer:string;manifestHash:string;chunks:string[];renderer:string;collection:string;receipts:string[];pending?:{hash:string;kind:'chunk'|'renderer'|'collection';index:number}};
const KEY='hazels-deployment-journal';
export async function loadDeploymentFiles(){
 const [m,a]=await Promise.all([fetch('/deployment/art.json'),fetch('/deployment/contracts.json')]);
 if(!m.ok||!a.ok)throw Error('Deployment files could not be loaded.');
 return {manifest:await m.json() as Manifest,artifacts:await a.json() as Artifacts};
}
export function readJournal():Journal|null{try{const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw):null;}catch{return null;}}
export function saveJournal(j:Journal){localStorage.setItem(KEY,JSON.stringify(j));}
export function exportJSON(name:string,data:unknown){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function normalize(code:string,a:Artifact){let s=code.slice(2).toLowerCase();for(const refs of Object.values(a.immutableReferences))for(const r of refs)s=s.slice(0,r.start*2)+'0'.repeat(r.length*2)+s.slice((r.start+r.length)*2);return s;}
export async function verifyRuntime(provider:JsonRpcApiProvider,address:string,a:Artifact){const code=await provider.getCode(address);if(code==='0x'||normalize(code,a)!==normalize(a.deployedBytecode,a))throw Error('Contract bytecode does not match this build. Stop and check the saved deployment.');}
export async function deployCollection(signer:JsonRpcSigner,manifest:Manifest,artifacts:Artifacts,onChange:(j:Journal,stage:string)=>void){
 const provider=signer.provider;
 const account=await signer.getAddress();
 if(!sameAddress(account,TREASURY))throw Error('Connect the treasury wallet to deploy this collection.');
 const check=async()=>{if(Number(await provider.send('eth_chainId',[]))!==CHAIN_ID)throw Error('Wallet network changed. Switch to Robinhood Chain before resuming.');const accounts=await provider.send('eth_accounts',[]) as string[];if(!accounts[0]||!sameAddress(accounts[0],account))throw Error('Wallet account changed. Reconnect the treasury wallet.');};
 await check();
 const chunks=manifest.art.flatMap(a=>a.chunks);
 let j=readJournal()||{chainId:CHAIN_ID,deployer:account,manifestHash:manifest.manifestHash,chunks:[],renderer:'',collection:'',receipts:[]};
 if(j.chainId!==CHAIN_ID||!sameAddress(j.deployer,account)||j.manifestHash!==manifest.manifestHash)throw Error('The saved deployment belongs to another account, chain, or artwork build. Export it before starting a fresh browser profile.');
 if(!Array.isArray(j.chunks)||j.chunks.length>chunks.length)throw Error('Invalid deployment journal.');
 const report=(stage:string)=>{saveJournal(j);onChange({...j,chunks:[...j.chunks],receipts:[...j.receipts]},stage);};
 report('Checking saved progress');
 const record=(r:TransactionReceipt,kind:'chunk'|'renderer'|'collection',index:number)=>{
  if(r.status!==1||!r.contractAddress)throw Error('Deployment transaction did not create a contract. Check the transaction before resuming.');
  if(kind==='chunk')j.chunks[index]=r.contractAddress;
  else j[kind]=r.contractAddress;
  j.receipts.push(r.hash);delete j.pending;report('Transaction confirmed');
 };
 if(j.pending){
  const p=j.pending;report('Waiting for the previously submitted transaction');
  let receipt=await provider.getTransactionReceipt(p.hash);
  if(!receipt)receipt=await provider.waitForTransaction(p.hash,1,120000);
  if(!receipt)throw Error('The previous transaction is still pending. Resume after it confirms; do not redeploy it.');
  if(receipt.status!==1){delete j.pending;report('Previous transaction reverted. You can retry this step.');throw Error('Previous transaction reverted. Click Resume to retry.');}
  record(receipt,p.kind,p.index);
 }
 const send=async(data:string,kind:'chunk'|'renderer'|'collection',index:number,title:string)=>{
  await check();report(title+' — estimating network gas');
  const estimate=await signer.estimateGas({data,value:0n});
  await check();report(title+' — confirm in your wallet');
  const tx=await signer.sendTransaction({data,value:0n,gasLimit:estimate*115n/100n});
  j.pending={hash:tx.hash,kind,index};report(title+' — waiting for confirmation');
  let receipt:TransactionReceipt|null;
  try{receipt=await tx.wait(1,120000);}catch(e){
   const replacement=e as {code?:string;cancelled?:boolean;receipt?:TransactionReceipt;replacement?:{hash:string}};
   if(replacement.code==='TRANSACTION_REPLACED'&&replacement.receipt){
    if(replacement.cancelled){delete j.pending;report('Transaction cancelled or replaced. Review it before resuming.');throw Error('Transaction was cancelled or replaced. No deployment was recorded.');}
    receipt=replacement.receipt;
   }else throw e;
  }
  if(!receipt)throw Error('Transaction is still pending. Resume after it confirms.');
  record(receipt,kind,index);
 };
 for(let i=0;i<chunks.length;i++){
  if(!j.chunks[i])await send(chunks[i].initCode,'chunk',i,`Store artwork ${i+1} of ${chunks.length}`);
  const code=await provider.getCode(j.chunks[i]);
  if(keccak256(code)!==chunks[i].codeHash)throw Error(`Artwork chunk ${i+1} failed its onchain hash check.`);
 }
 if(!j.renderer){const f=new ContractFactory(artifacts.HazelsRenderer.abi,artifacts.HazelsRenderer.bytecode,signer);const tx=await f.getDeployTransaction(j.chunks);await send(tx.data,'renderer',0,'Deploy immutable SVG renderer');}
 await verifyRuntime(provider,j.renderer,artifacts.HazelsRenderer);
 const renderer=new Contract(j.renderer,artifacts.HazelsRenderer.abi,provider);
 if(await renderer.ART_MANIFEST()!==manifest.manifestHash)throw Error('Renderer artwork commitment mismatch.');
 if(!j.collection){const f=new ContractFactory(artifacts.HazelsCTOFreemint.abi,artifacts.HazelsCTOFreemint.bytecode,signer);const tx=await f.getDeployTransaction(j.renderer);await send(tx.data,'collection',0,'Deploy Hazels CTO Freemint');}
 await verifyRuntime(provider,j.collection,artifacts.HazelsCTOFreemint);
 const c=new Contract(j.collection,abi,provider);
 const [linked,treasury,supply,bps]=await Promise.all([c.renderer(),c.TREASURY(),c.MAX_SUPPLY(),c.ROYALTY_BPS()]);
 if(!sameAddress(linked,j.renderer)||!sameAddress(treasury,TREASURY)||Number(supply)!==5555||Number(bps)!==500)throw Error('Deployment settings did not match.');
 report('Deployment verified. The collection is closed until you open minting.');
 return j;
}
export const emptyValidator=ZeroAddress;
