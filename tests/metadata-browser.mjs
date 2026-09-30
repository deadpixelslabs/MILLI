import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from '@playwright/test';
import metadataHandler from '../api/metadata.ts';
import imageHandler from '../api/image.ts';
import csvHandler from '../api/csv.ts';
import {csvText} from '../server/metadata.mjs';

const server = http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 res.status=n=>{res.statusCode=n;return res;};res.send=b=>res.end(b);res.json=j=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(j));};
 if(url.pathname.startsWith('/metadata/')){req.query={id:url.pathname.slice(10)};return metadataHandler(req,res);}
 if(url.pathname.startsWith('/images/')){req.query={id:url.pathname.slice(8)};return imageHandler(req,res);}
 if(url.pathname==='/downloads/Hazels-CTO-Freemint-Metadata.csv')return csvHandler(req,res);
 let name=['/','/deploy'].includes(url.pathname)?'/index.html':url.pathname;
 const file=path.resolve('dist','.'+name);
 if(!file.startsWith(path.resolve('dist')+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;return res.end();}
 const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
 res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const executablePath=process.env.BROWSER_EXECUTABLE_PATH;
const browser=await chromium.launch({...(executablePath?{executablePath}:{}),headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1080}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.getByRole('heading',{name:'Find your Hazel.'}).waitFor();
 assert.equal(await page.getByRole('button',{name:'OpenSea link coming soon'}).isDisabled(),true);
 await page.goto(base+'/deploy');await page.getByRole('heading',{name:'One Base URI.'}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Deploy collection',exact:true}).count(),0);
 for(const id of [1,2,3,144,2345,5555]){
  const r=await page.request.get(base+'/metadata/'+id);assert.equal(r.status(),200);
  const m=await r.json();assert.equal(m.name,`Hazels CTO Freemint #${id}`);
  const dims=await page.evaluate(async url=>{const i=new Image();i.src=url;await i.decode();return [i.naturalWidth,i.naturalHeight];},base+'/images/'+id+'.svg');
  assert.deepEqual(dims,[724,724]);
 }
 const csv=await page.request.get(base+'/downloads/Hazels-CTO-Freemint-Metadata.csv');assert.equal(csv.status(),200);assert.equal(await csv.text(),csvText());
 assert.equal((await page.request.get(base+'/metadata/5556')).status(),404);
 fs.mkdirSync('test-results',{recursive:true});
 await page.goto(base+'/deploy');await page.getByRole('heading',{name:'One Base URI.'}).waitFor();await page.locator('.studio-art img').evaluate(i=>i.decode());await page.screenshot({path:'test-results/metadata-studio-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/deploy');await page.getByRole('heading',{name:'One Base URI.'}).waitFor();await page.locator('.studio-art img').evaluate(i=>i.decode());
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
 await page.screenshot({path:'test-results/metadata-studio-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({pages:['/','/deploy'],renderedSVGs:6,metadata:true,csv:true,invalidToken404:true,mobileOverflow:false,browserErrors:errors}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
