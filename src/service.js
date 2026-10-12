import {app,bodyJson,query} from './http.js';
import {jupiterTrade} from './jupiter.js';
import {FEE_BPS,FEE_RECIPIENT} from './fees.js';
export function createService(){return app('Meteora DBC Buy and Sell API',[
 {method:'GET',path:'/api/capabilities',handle:async({url})=>{query(url,[]);return {version:'0.1.0-beta',network:'solana-mainnet',serviceFeeBps:FEE_BPS,feeRecipient:FEE_RECIPIENT.toBase58(),signing:'client',broadcast:false,mandatoryBuildSimulation:true,status:'beta',fundedTradesTested:false};}},
 ...['quote','trade'].map(kind=>({method:'POST',path:'/api/'+kind,handle:async({request,url,env})=>{query(url,[]);return jupiterTrade(await bodyJson(request),env,kind==='trade');}})),
]);}
