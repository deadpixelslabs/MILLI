import {milliMetadata,milliTokenId} from '../server/milli.mjs';
import {sendAsset,validateMethod} from '../server/response.mjs';
export default function handler(req:any,res:any){
 if(!validateMethod(req,res))return;
 const id=milliTokenId(req.query?.id);
 if(id===null){res.setHeader('Cache-Control','no-store');return res.status(404).json({error:'MILLI token ID must be an integer from 1 through 10000.'});}
 return sendAsset(req,res,JSON.stringify(milliMetadata(id)),'application/json; charset=utf-8');
}
