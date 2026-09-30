import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
export default defineConfig({ plugins: [react()], build: { target: 'es2022' }, server:{proxy:{'/api/rpc':{target:process.env.RPC_URL || 'https://rpc.mainnet.chain.robinhood.com',changeOrigin:true,rewrite:()=>''}}} });
