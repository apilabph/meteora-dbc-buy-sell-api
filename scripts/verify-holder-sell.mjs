// Read-only alternative when a shared RPC limits getTokenLargestAccounts.
import fs from 'node:fs';import {PublicKey} from '@solana/web3.js';import {jupiterTrade} from '../src/jupiter.js';
const [mint,market]=process.argv.slice(2);if(!mint)throw Error('Usage: node scripts/verify-holder-sell.mjs MINT [ORIGINAL_CURVE]');
const url=process.env.SOLANA_RPC_URL||'https://api.mainnet-beta.solana.com';
async function read(method,params){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(7000)});const j=await r.json();if(j.error||!r.ok)throw Error('Public discovery RPC unavailable');return j.result;}
const signatures=await read('getSignaturesForAddress',[mint,{limit:3}]),rows=[];
for(const sig of signatures.filter(s=>s.err===null)){
 let t;try{t=await read('getTransaction',[sig.signature,{encoding:'jsonParsed',maxSupportedTransactionVersion:0}]);}catch{continue;}
 for(const b of t?.meta?.postTokenBalances??[]){if(b.mint!==mint||!b.owner||BigInt(b.uiTokenAmount.amount)<10000n||!PublicKey.isOnCurve(new PublicKey(b.owner).toBytes()))continue;
  try{const started=performance.now(),result=await jupiterTrade({publicKey:b.owner,mint,...(market?{market}:{}),action:'sell',amount:'10000',maxServiceFeeBps:25},process.env,true);const row={time:new Date().toISOString(),mint,market,venue:result.venue,action:'sell',latencyMs:Math.round(performance.now()-started),simulation:result.simulation,transactionBytes:result.transactionBytes,submitted:false};rows.push(row);console.log(row);break;}catch(e){console.log({error:e.code??'VERIFICATION_FAILED'});}
 }
 if(rows.length)break;
}
fs.mkdirSync('research',{recursive:true});fs.writeFileSync('research/verified-sell-'+Date.now()+'.json',JSON.stringify(rows,null,2));
