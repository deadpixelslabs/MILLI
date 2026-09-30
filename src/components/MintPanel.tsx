import { useCallback, useEffect, useRef, useState } from 'react';
import { Contract } from 'ethers';
import { ArrowUpRight, Check, LoaderCircle, Minus, Plus, ShieldCheck } from 'lucide-react';
import { useWallet } from '../lib/wallet';
import { abi, snapshot, type Snapshot } from '../lib/collection';
import { CHAIN_ID, EXPLORER, SUPPLY, TREASURY, message, sameAddress } from '../lib/config';
import WalletButton from './WalletButton';
export default function MintPanel({address}:{address:string}){
 const w=useWallet();const [data,setData]=useState<Snapshot|null>(null);const [error,setError]=useState('');const [readError,setReadError]=useState('');
 const [quantity,setQuantity]=useState(1);const [busy,setBusy]=useState(false);const [phase,setPhase]=useState('');const [hash,setHash]=useState('');const [ids,setIds]=useState<number[]>([]);
 const locked=useRef(false);const generation=useRef(0);
 const refresh=useCallback(async()=>{if(!address)return;const g=++generation.current;try{const s=await snapshot(address,w.account);if(g===generation.current){setData(s);setReadError('');}}catch{if(g===generation.current){setData(null);setReadError('Live data is temporarily unavailable. Retry before minting.');}}},[address,w.account]);
 useEffect(()=>{setData(null);setIds([]);setQuantity(1);void refresh();const timer=setInterval(()=>void refresh(),15000);return()=>{clearInterval(timer);generation.current++;};},[refresh]);
 const treasury=sameAddress(w.account,TREASURY);const available=data?.allowance??2;
 const selected=Math.min(quantity,Math.max(1,available));
 async function mint(){
  if(locked.current)return;locked.current=true;setBusy(true);setError('');setHash('');setIds([]);
  try{
   setPhase('Checking mint availability');const signer=await w.signer();
   const c=new Contract(address,abi,signer);const [open,allowance]=await Promise.all([c.mintOpen(),c.mintAllowance(await signer.getAddress())]);
   if(!open)throw Error('Minting is currently closed.');if(selected>Number(allowance))throw Error('Your mint allowance or the remaining supply changed. Refresh and try again.');
   const gas=await c.mint.estimateGas(selected);await w.signer();setPhase('Confirm your free mint in your wallet');
   const tx=await c.mint(selected,{gasLimit:gas*115n/100n});setHash(tx.hash);setPhase('Mint submitted. Waiting for confirmation');
   const receipt=await tx.wait();
   if(!receipt||receipt.status!==1)throw Error('Mint transaction did not succeed.');
   const minted:number[]=[];for(const l of receipt.logs){try{const parsed=c.interface.parseLog(l);if(parsed?.name==='Minted'){const start=Number(parsed.args.firstTokenId);const count=Number(parsed.args.quantity);for(let i=0;i<Math.min(count,100);i++)minted.push(start+i);}}catch{}}
   setIds(minted);setPhase('Your Hazels are minted. Welcome home.');await refresh();
  }catch(e){setError(message(e));setPhase('');await refresh();}finally{locked.current=false;setBusy(false);}
 }
 const soldOut=data?.total===SUPPLY;
 const status=!address?'MINT OPENS SOON':readError?'NETWORK UNAVAILABLE':!data?'READING THE CHAIN':soldOut?'FULLY MINTED':data.open?'PUBLIC MINT IS LIVE':'MINT IS PAUSED';
 return <section className="mint-card" id="mint" aria-label="Mint your Hazels">
  <div className="card-topline"><span className={`live-dot ${data?.open&&!soldOut?'is-live':''}`}/><span>{status}</span><span className="edition">№ 5,555</span></div>
  <h2>Find your Hazel.</h2><p className="card-description">A little character. A forever home onchain.</p>
  <div className="mint-stats"><div><span>MINT PRICE</span><strong>0 <small>ETH</small></strong></div><div><span>PER WALLET</span><strong>{treasury?'∞':'2'} <small>NFT{treasury?'s':'s'}</small></strong></div></div>
  <div className="supply-line"><span>{data?<><strong>{data.total.toLocaleString('en-US')}</strong> / 5,555 minted</>:'5,555 total supply'}</span><span>{data?`${Math.floor(data.total/SUPPLY*100)}%`:'Fully onchain'}</span></div>
  <div className="progress-track"><span style={{width:`${data?data.total/SUPPLY*100:0}%`}}/></div>
  <div className="quantity-label"><label htmlFor="mint-quantity">How many are coming home?</label>{w.account&&data?<span>{treasury?'Treasury access':`${data.minted}/2 minted`}</span>:null}</div>
  <div className="quantity-row"><button className="quantity-button" disabled={busy||selected<=1} onClick={()=>setQuantity(q=>Math.max(1,q-1))} aria-label="Mint one fewer"><Minus size={17}/></button><input id="mint-quantity" type="number" min="1" max={treasury?(data?SUPPLY-data.total:SUPPLY):2} step="1" value={selected} onChange={e=>setQuantity(Math.min(treasury?SUPPLY:2,Math.max(1,Math.trunc(Number(e.target.value)||1))))} disabled={busy}/><button className="quantity-button" disabled={busy||selected>=available} onClick={()=>setQuantity(selected+1)} aria-label="Mint one more"><Plus size={17}/></button><span className="quantity-total">Free <small>+ network gas</small></span></div>
  {!w.account?<div className="mint-connect"><WalletButton/></div>:w.chain!==CHAIN_ID?<button className="primary" onClick={async()=>{try{await w.switchChain();}catch(e){setError(message(e));}}}>Switch to Robinhood Chain <ArrowUpRight size={19}/></button>:<button className="primary" disabled={!address||!data?.open||!available||busy||!!readError} onClick={mint}>{busy?<><LoaderCircle className="spin" size={18}/> Minting…</>:soldOut?'All Hazels have been minted':available===0?'Wallet mint limit reached':!address?'Mint opens soon':!data?.open?'Mint currently closed':<>Mint {selected} Hazel{selected===1?'':'s'} <ArrowUpRight size={20}/></>}</button>}
  <p className="gas-note"><ShieldCheck size={14}/> No mint fee. Your wallet pays network gas only.</p>
  {treasury?<p className="small muted">Treasury has no wallet cap. Total supply and transaction gas still apply.</p>:null}
  {readError?<div className="notice error" role="alert">{readError} <button className="text-button" onClick={()=>void refresh()}>Retry</button></div>:null}
  {error?<p className="notice error" role="alert">{error}</p>:null}
  {phase?<div className={`notice ${ids.length?'success':''}`} role="status">{ids.length?<Check size={16}/>:null}{phase}{ids.length?<span className="small">Token{ids.length>1?'s':''}: {ids.map(x=>`#${x}`).join(', ')}</span>:null}</div>:null}
  {hash?<a className="transaction-link" href={`${EXPLORER}/tx/${hash}`} target="_blank" rel="noreferrer">View transaction <ArrowUpRight size={14}/></a>:null}
 </section>;
}
