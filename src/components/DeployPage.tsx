import {useState} from 'react';
import {ArrowUpRight, Copy, Download, Layers} from 'lucide-react';

export default function DeployPage() {
 const [status,setStatus] = useState('');
 const base = 'https://milliformillion.xyz/metadata/';
 async function copy() {try {await navigator.clipboard.writeText(base);setStatus('Base URI copied.');} catch {setStatus('Select and copy the Base URI shown below.');}}
 return <main className="deploy-main"><a className="back-link" href="/">← Back to the collection</a>
  <div className="deploy-heading"><span className="eyebrow">METADATA STUDIO</span><h1>Your collection.<br/><em>Ready to reveal.</em></h1><p>Deploy your NFT contract in OpenSea. This server provides the images and traits for all 5,555 Hazels.</p></div>
  <div className="deploy-layout"><section className="studio-card"><div className="section-label"><Layers size={18}/><span>IMAGES & METADATA</span></div><h2>One Base URI.</h2>
   <div className="settings-grid"><div><span>COLLECTION</span><strong>Hazels CTO Freemint</strong></div><div><span>ARTWORK</span><strong>5,555 SVG portraits</strong></div><div><span>TOKEN IDS</span><strong>1 through 5,555</strong></div><div><span>METADATA</span><strong>Available immediately</strong></div></div>
   <p>Set your collection contract's Base URI to the address below, including the trailing slash.</p><p className="mono break" style={{userSelect:'all'}}>{base}</p>
   <div className="button-row"><button className="secondary" onClick={copy}><Copy size={16}/> Copy Base URI</button><a className="text-button" href="/downloads/Hazels-CTO-Freemint-Metadata.csv" download><Download size={16}/> Metadata CSV</a></div>
   {status?<p className="notice" role="status">{status}</p>:null}
   <div className="deployment-steps"><div className="deployment-step"><span>1</span><div><strong>Deploy through OpenSea</strong><small>Configure supply, mint stages and creator earnings in OpenSea.</small></div></div><div className="deployment-step"><span>2</span><div><strong>Set the Base URI</strong><small>The contract appends the token ID. Both /metadata/1 and /metadata/1.json are supported.</small></div></div><div className="deployment-step"><span>3</span><div><strong>Check a minted token</strong><small>Its tokenURI should return the matching JSON endpoint. Marketplace indexing may take time.</small></div></div></div>
   <p className="small muted">Images and metadata are hosted on Vercel. Keep this domain and deployment online. The artwork is not stored onchain. Metadata for all token IDs is public before minting.</p>
  </section><aside className="studio-aside"><div className="studio-art"><img src="/art/characters/3.webp" alt="Hazel with a side braid and leather jacket"/></div><a className="text-button" href="/metadata/1" target="_blank" rel="noreferrer">View token #1 metadata <ArrowUpRight size={16}/></a><a className="text-button" href="/images/1.svg" target="_blank" rel="noreferrer">View token #1 SVG <ArrowUpRight size={16}/></a><a className="text-button" href="/metadata/5555" target="_blank" rel="noreferrer">View token #5555 metadata <ArrowUpRight size={16}/></a></aside></div>
 </main>;
}
