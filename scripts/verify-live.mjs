// READ ONLY: chooses public holder accounts for unsigned simulation; never signs or sends.
import fs from 'node:fs';import {PublicKey,SystemProgram} from '@solana/web3.js';import {unpackAccount} from '@solana/spl-token';
import {Rpc} from '../src/rpc.js';import {jupiterTrade} from '../src/jupiter.js';
const samples=JSON.parse(fs.readFileSync('research/public-samples.json')),rows=[],seen=new Set();
const url=process.env.SOLANA_RPC_URL||'https://api.mainnet-beta.solana.com';
for(const {venue,...sample}of samples){
 if(seen.has(sample.mint))continue;seen.add(sample.mint);
 const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'getTokenLargestAccounts',params:[sample.mint,{commitment:'confirmed'}]}),signal:AbortSignal.timeout(7000)});
 const j=await r.json();if(!r.ok||j.error){console.log({venue,discovery:'largest-account lookup unavailable'});continue;}
 const keys=j.result.value.slice(0,12).map(x=>new PublicKey(x.address)),rpc=new Rpc(process.env),infos=await rpc.accounts(keys);
 const holders=infos.flatMap((a,i)=>{if(!a)return [];const t=unpackAccount(keys[i],a,a.owner);return PublicKey.isOnCurve(t.owner.toBuffer())&&t.amount>10000n&&!t.isFrozen?[{address:t.owner,amount:t.amount}]:[];});
 const owners=await rpc.accounts(holders.map(x=>x.address));const funded=holders.find((h,i)=>owners[i]?.owner.equals(SystemProgram.programId)&&owners[i].lamports>10000000);
 if(!funded){console.log({venue,discovery:'no funded holder found in bounded sample'});continue;}
 for(const action of ['buy','sell']){
  const start=performance.now(),body={...sample,publicKey:funded.address.toBase58(),action,amount:action==='buy'?'0.0001':'10000',maxServiceFeeBps:25};
  try{const result=await jupiterTrade(body,process.env,true);const row={time:new Date().toISOString(),mint:sample.mint,market:sample.market,publicKey:body.publicKey,venue:result.venue,action,latencyMs:Math.round(performance.now()-start),simulation:result.simulation,transactionBytes:result.transactionBytes,feeRecipient:result.feeRecipient,submitted:result.submitted};rows.push(row);console.log(row);}catch(e){rows.push({time:new Date().toISOString(),mint:sample.mint,venue,action,error:e.code??'VERIFICATION_FAILED'});console.log(rows.at(-1));}
 }
 if(rows.some(x=>x.simulation?.status==='passed'))break;
}
fs.writeFileSync('research/verification-'+Date.now()+'.json',JSON.stringify(rows,null,2));
