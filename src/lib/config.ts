export const CHAIN_ID = 4663;
export const CHAIN_HEX = '0x1237';
export const TREASURY = '0x9d4B1bDF276a2B30F9FA95DB3beC0b40477c2941';
export const PUBLIC_RPC = 'https://rpc.mainnet.chain.robinhood.com';
export const EXPLORER = 'https://robin.etherscan.io';
export const SUPPLY = 5555;
export const REPO = 'https://github.com/deadpixelslabs/MILLI';
export const shortAddress = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
export const sameAddress = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
export function message(error: unknown): string {
  const e = error as { code?: string | number; shortMessage?: string; reason?: string; message?: string; revert?: {name?: string} };
  if (e.code === 4001 || e.code === 'ACTION_REJECTED') return 'Request cancelled in your wallet. Nothing new was submitted.';
  const names: Record<string,string> = { WalletLimit:'This wallet has already used its two mints.', SoldOut:'There are not enough NFTs remaining.', MintClosed:'Minting is currently closed.', InvalidQuantity:'Enter a valid quantity.', InsufficientFunds:'Your wallet needs ETH for network gas.' };
  if(e.revert?.name && names[e.revert.name]) return names[e.revert.name];
  return e.reason || e.shortMessage || e.message || 'The request could not be completed. Please try again.';
}
