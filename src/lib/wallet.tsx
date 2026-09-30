import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { BrowserProvider, type Eip1193Provider, type JsonRpcSigner } from 'ethers';
import { CHAIN_HEX, CHAIN_ID, EXPLORER, PUBLIC_RPC, message } from './config';
type Injected = Eip1193Provider & { on?: (event:string, fn:(...a: any[])=>void)=>void; removeListener?: (event:string, fn:(...a:any[])=>void)=>void };
type Wallet = { info: {uuid:string; name:string}; provider:Injected };
type WalletState = { account:string; chain:number; wallets:Wallet[]; provider:BrowserProvider | null; busy:boolean; error:string; connect:(w?:Wallet)=>Promise<void>; disconnect:()=>void; signer:()=>Promise<JsonRpcSigner>; switchChain:()=>Promise<void> };
const Context = createContext<WalletState | null>(null);
export function WalletProvider({children}:{children:ReactNode}) {
  const [wallets,setWallets] = useState<Wallet[]>([]);
  const [account,setAccount] = useState(''); const [chain,setChain] = useState(0);
  const [provider,setProvider] = useState<BrowserProvider|null>(null);
  const [busy,setBusy] = useState(false); const [error,setError] = useState('');
  const injected = useRef<Injected|null>(null);
  const clean = useRef<()=>void>(()=>{});
  useEffect(()=>{
    const listener = (event:Event) => { const w=(event as CustomEvent<Wallet>).detail; if(w?.info?.uuid && w.provider) setWallets(prev=>prev.some(x=>x.info.uuid===w.info.uuid)?prev:[...prev,w]); };
    window.addEventListener('eip6963:announceProvider',listener);
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    return ()=>{window.removeEventListener('eip6963:announceProvider',listener);clean.current();};
  },[]);
  const disconnect=useCallback(()=>{ clean.current(); injected.current=null;setProvider(null);setAccount('');setChain(0);setError(''); },[]);
  async function connect(w?:Wallet) {
    setBusy(true);setError('');
    try {
      const p=w?.provider || wallets[0]?.provider || (window as unknown as {ethereum?:Injected}).ethereum;
      if(!p) throw Error('No wallet detected. Open this page in your wallet browser, or install an EVM wallet extension.');
      const accounts=await p.request({method:'eth_requestAccounts'}) as string[];
      const chainId=await p.request({method:'eth_chainId'}) as string;
      clean.current(); injected.current=p;setProvider(new BrowserProvider(p,'any'));setAccount(accounts[0]||'');setChain(Number(chainId));
      const changed=(a:string[])=>{setAccount(a[0]||'');setError('');};
      const network=(id:string)=>{setChain(Number(id));setProvider(new BrowserProvider(p,'any'));setError('');};
      p.on?.('accountsChanged',changed);p.on?.('chainChanged',network);p.on?.('disconnect',disconnect);
      clean.current=()=>{p.removeListener?.('accountsChanged',changed);p.removeListener?.('chainChanged',network);p.removeListener?.('disconnect',disconnect);};
    } catch(e){setError(message(e));} finally{setBusy(false);}
  }
  async function switchChain() {
    const p=injected.current;if(!p) throw Error('Connect a wallet first.');
    try{await p.request({method:'wallet_switchEthereumChain',params:[{chainId:CHAIN_HEX}]});}
    catch(e){if((e as {code:number}).code!==4902)throw e;await p.request({method:'wallet_addEthereumChain',params:[{chainId:CHAIN_HEX,chainName:'Robinhood Chain',nativeCurrency:{name:'Ether',symbol:'ETH',decimals:18},rpcUrls:[PUBLIC_RPC],blockExplorerUrls:[EXPLORER]}]});}
    const actual=Number(await p.request({method:'eth_chainId'}));setChain(actual);
    if(actual!==CHAIN_ID)throw Error('Select Robinhood Chain in your wallet before continuing.');
  }
  async function signer(){
    if(!provider || !injected.current)throw Error('Connect a wallet first.');
    if(Number(await injected.current.request({method:'eth_chainId'}))!==CHAIN_ID)throw Error('Switch your wallet to Robinhood Chain.');
    const s=await provider.getSigner();
    if((await s.getAddress()).toLowerCase()!==account.toLowerCase())throw Error('Wallet changed. Reconnect before continuing.');
    return s;
  }
  return <Context.Provider value={{account,chain,wallets,provider,busy,error,connect,disconnect,signer,switchChain}}>{children}</Context.Provider>;
}
export function useWallet(){const c=useContext(Context);if(!c)throw Error('Missing wallet provider');return c;}
