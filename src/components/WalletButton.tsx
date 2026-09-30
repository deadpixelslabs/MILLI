import { useEffect, useState } from 'react';
import { Wallet, X, ArrowUpRight, LogOut } from 'lucide-react';
import { useWallet } from '../lib/wallet';
import { CHAIN_ID, message, shortAddress } from '../lib/config';
export default function WalletButton(){
 const w=useWallet();const [open,setOpen]=useState(false);const [error,setError]=useState('');
 useEffect(()=>{
  if(!open)return;const previous=document.activeElement as HTMLElement|null;
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);return;}if(e.key==='Tab'){const dialog=document.querySelector('[role="dialog"]');const items=Array.from(dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled)')||[]);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
  document.addEventListener('keydown',key);const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
  return()=>{document.removeEventListener('keydown',key);document.body.style.overflow=overflow;previous?.focus();};
 },[open]);
 async function switchNetwork(){try{await w.switchChain();setError('');}catch(e){setError(message(e));}}
 return <>
  <button className="wallet-button" onClick={()=>setOpen(true)}><Wallet size={16}/>{w.account?shortAddress(w.account):'Connect wallet'}{w.account&&w.chain!==CHAIN_ID?<span className="network-alert" aria-label="Wrong network"/>:null}</button>
  {open?<div className="modal-backdrop" onClick={()=>setOpen(false)}><section className="wallet-modal" role="dialog" aria-modal="true" aria-label="Connect wallet" onClick={e=>e.stopPropagation()}><button className="icon-button modal-close" aria-label="Close wallet dialog" onClick={()=>setOpen(false)} autoFocus><X size={20}/></button><span className="eyebrow">YOUR ONCHAIN IDENTITY</span><h2>{w.account?'Your wallet.':'Make yourself at home.'}</h2>
  {w.account?<><p className="mono break">{w.account}</p><p>{w.chain===CHAIN_ID?'Connected to Robinhood Chain.':'Switch to Robinhood Chain to mint or deploy.'}</p>{w.chain!==CHAIN_ID?<button className="primary" onClick={switchNetwork}>Switch network <ArrowUpRight size={18}/></button>:null}<button className="secondary full" onClick={()=>{w.disconnect();setOpen(false);}}><LogOut size={16}/> Disconnect</button></>:<><p>Choose a wallet to connect. We never ask for your recovery phrase.</p>{w.wallets.length?w.wallets.map(wallet=><button className="wallet-option" key={wallet.info.uuid} disabled={w.busy} onClick={async()=>{await w.connect(wallet);}}>{wallet.info.name}<ArrowUpRight size={18}/></button>):<button className="primary" disabled={w.busy} onClick={()=>w.connect()}>{w.busy?'Connecting…':'Connect browser wallet'}<Wallet size={18}/></button>}<p className="muted small">On mobile, open this site in your wallet’s built-in browser.</p></>}
  {w.error||error?<p role="alert" className="notice error">{w.error||error}</p>:null}
  {w.account?<button className="text-button" onClick={()=>setOpen(false)}>Continue to the collection →</button>:null}
  </section></div>:null}
 </>;
}
