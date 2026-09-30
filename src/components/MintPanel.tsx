import {useEffect, useState} from 'react';
import {ArrowUpRight, Sparkles} from 'lucide-react';

export default function MintPanel({address:_address}:{address:string}) {
 const [url,setUrl]=useState('');
 useEffect(()=>{let live=true;fetch('/site-config.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(c=>{if(!c?.openseaUrl)return;const u=new URL(c.openseaUrl);if(live&&u.protocol==='https:'&&u.hostname==='opensea.io')setUrl(u.href);}).catch(()=>{});return()=>{live=false;};},[]);
 return <section className="mint-card" id="mint" aria-label="Mint your Hazels"><div className="card-topline"><span className="live-dot"/><span>{url?'MINT THROUGH OPENSEA':'OPENSEA DROP IN PREPARATION'}</span><span className="edition">№ 5,555</span></div><h2>Find your Hazel.</h2><p className="card-description">A little character. An entirely new chapter.</p>
  <div className="mint-stats"><div><span>PLANNED MINT PRICE</span><strong>0 <small>ETH</small></strong></div><div><span>PUBLIC WALLET LIMIT</span><strong>2 <small>NFTs</small></strong></div></div>
  <div className="supply-line"><span>5,555 total supply</span><span>SVG artwork</span></div>
  <p>Minting will take place on OpenSea. Your NFT's image and traits are available through the collection's metadata server.</p>
  {url?<a className="primary" href={url} target="_blank" rel="noreferrer">Open the collection <ArrowUpRight size={20}/></a>:<button className="primary" disabled>OpenSea link coming soon</button>}
  <p className="gas-note"><Sparkles size={14}/> Instant metadata. Network gas applies when minting.</p>
 </section>;
}
