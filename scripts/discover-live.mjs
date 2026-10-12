// Public reads only. No signing or broadcasting; discovered wallets belong to third parties.
import fs from 'node:fs';import {PublicKey} from '@solana/web3.js';
import {Rpc} from '../src/rpc.js';import {inspectState,DBC} from '../src/protocol.js';import layouts from '../src/layouts.json' with {type:'json'};import {decode} from '../src/accounts.js';
const url=process.env.SOLANA_RPC_URL||'https://api.mainnet-beta.solana.com';let id=0;
async function read(method,params){if(!['getSignaturesForAddress','getTransaction','getMultipleAccounts'].includes(method))throw Error('read only');const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:++id,method,params}),signal:AbortSignal.timeout(10000)});const j=await r.json();if(j.error||!r.ok)throw Error('Public discovery RPC unavailable: '+r.status);return j.result;}
const signatures=await read('getSignaturesForAddress',[DBC.toBase58(),{limit:4}]),samples=[];
for(const signature of signatures.filter(x=>x.err===null)){
 try{
 const tx=await read('getTransaction',[signature.signature,{encoding:'jsonParsed',maxSupportedTransactionVersion:0,commitment:'confirmed'}]);if(!tx)continue;
 const keys=tx.transaction.message.accountKeys.map(x=>new PublicKey(x.pubkey));
 const result=await read('getMultipleAccounts',[keys.map(k=>k.toBase58()),{encoding:'base64',commitment:'confirmed'}]);
 const infos=result.value.map(a=>a&&a.owner===DBC.toBase58()?{...a,owner:DBC,data:Buffer.from(a.data[0],'base64')}:null);
 for(let i=0;i<keys.length;i++)if(infos[i]?.owner.equals(DBC)&&infos[i].data.subarray(0,8).equals(Buffer.from(layouts.curve.discriminator))){
  const curve=decode(infos[i],DBC,layouts.curve),mint=curve['pool_state.base_mint'],user=keys[0];
  try{const state=await inspectState(new Rpc({SOLANA_RPC_URL:url}),{mint,user,market:keys[i],action:'buy'});samples.push({mint:mint.toBase58(),market:keys[i].toBase58(),publicKey:user.toBase58(),venue:state.venue});}catch(e){console.log({stageError:e.code});}
 }
 }catch(e){console.log({discovery:'temporary RPC failure',code:e.code??e.name});}
}
fs.mkdirSync('research',{recursive:true});fs.writeFileSync('research/public-samples.json',JSON.stringify(samples,null,2));console.log(samples);
