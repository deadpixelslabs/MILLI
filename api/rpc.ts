// A read-only RPC proxy. Keep a dedicated production endpoint in RPC_URL.
// Wallets broadcast their own transactions; this endpoint never signs or sends.
const allowed = new Set(['eth_chainId','eth_blockNumber','eth_call','eth_getCode','eth_getBalance','eth_getTransactionReceipt','eth_getTransactionByHash','eth_getBlockByNumber']);
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({error:'POST required'});
  try {
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
    const batch=Array.isArray(body)?body:[body];
    if(batch.length===0||batch.length>15||JSON.stringify(body).length>16384||batch.some(x=>!x || x.jsonrpc!=='2.0'||!allowed.has(x.method)||!Array.isArray(x.params)))return res.status(400).json({error:'Unsupported RPC request'});
    const response=await fetch(process.env.RPC_URL || 'https://rpc.mainnet.chain.robinhood.com', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw Error('RPC unavailable');
    res.status(200).json(await response.json());
  } catch {res.status(503).json({error:'Network read temporarily unavailable. Please retry.'});}
}
