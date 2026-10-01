import {milliCSV} from '../server/milli.mjs';
import {sendAsset,validateMethod} from '../server/response.mjs';
export default function handler(req:any,res:any){
 if(!validateMethod(req,res))return;
 res.setHeader('Content-Disposition','attachment; filename="Milli-For-Million-Metadata.csv"');
 return sendAsset(req,res,milliCSV(),'text/csv; charset=utf-8');
}
