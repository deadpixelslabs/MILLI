import { Contract, JsonRpcProvider, FetchRequest, isAddress, ZeroAddress } from 'ethers';
import abi from '../generated/abi.json';
import { CHAIN_ID, SUPPLY, TREASURY, sameAddress } from './config';
export {abi};
const request=new FetchRequest(import.meta.env.VITE_READ_RPC_URL || new URL('/api/rpc',window.location.origin).href);
request.timeout=12000;
export const reader=new JsonRpcProvider(request, undefined, {batchMaxCount:12,cacheTimeout:1000});
export type Snapshot={total:number;open:boolean;allowance:number;minted:number;validator:string;owner:string};
export async function checkCollection(address:string, provider=reader){
  if(!isAddress(address)||address===ZeroAddress)throw Error('Enter a valid collection contract address.');
  const chain=await provider.send('eth_chainId',[]);
  if(Number(chain)!==CHAIN_ID)throw Error('The read RPC is on the wrong network. Expected Robinhood Chain (4663).');
  const c=new Contract(address,abi,provider);
  const [name,supply,limit,treasury,bps]=await Promise.all([c.name(),c.MAX_SUPPLY(),c.WALLET_LIMIT(),c.TREASURY(),c.ROYALTY_BPS()]);
  if(name!=='Hazels CTO Freemint'||Number(supply)!==SUPPLY||Number(limit)!==2||!sameAddress(treasury,TREASURY)||Number(bps)!==500)throw Error('This contract does not match the Hazels collection settings.');
  return c;
}
export async function snapshot(address:string,account:string):Promise<Snapshot>{
  const c=await checkCollection(address);
  const [total,open,allowance,minted,validator,owner]=await Promise.all([c.totalSupply(),c.mintOpen(),account?c.mintAllowance(account):2,account?c.mintedBy(account):0,c.getTransferValidator(),c.owner()]);
  return {total:Number(total),open,allowance:Number(allowance),minted:Number(minted),validator,owner};
}
export async function loadAddress(){
  const response=await fetch('/site-config.json',{cache:'no-store'});if(!response.ok)throw Error('Collection configuration could not be loaded.');
  const config=await response.json();
  const address=import.meta.env.VITE_COLLECTION_ADDRESS || config.collectionAddress;
  if(config.chainId!==CHAIN_ID)throw Error('Collection configuration has the wrong chain ID.');
  if(address && !isAddress(address))throw Error('Collection address is invalid.');
  return address || '';
}
