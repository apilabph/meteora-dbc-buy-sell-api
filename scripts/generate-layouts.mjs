// Derive fixed offsets from the pinned official IDLs. SDKs are tooling, not runtime RPC clients.
import {createRequire} from 'node:module';
import fs from 'node:fs';
const require=createRequire(import.meta.url),dbc=require('@meteora-ag/dynamic-bonding-curve-sdk'),damm=require('@meteora-ag/cp-amm-sdk');
function layout(idl,name){
 const fields={};
 function walk(type,offset,prefix){
  if(typeof type==='string'){
   const size={u8:1,i8:1,bool:1,u16:2,i16:2,u32:4,i32:4,u64:8,i64:8,u128:16,i128:16,pubkey:32}[type];
   if(!size)throw Error('Unknown scalar '+type);
   fields[prefix]={offset,type};return size;
  }
  if(type.array){const size=walk(type.array[0],offset,prefix+'[0]');return size*type.array[1];}
  if(type.defined){const def=idl.types.find(x=>x.name===type.defined.name)?.type;if(def?.kind!=='struct')throw Error('Nonfixed struct');let size=0;for(const field of def.fields)size+=walk(field.type,offset+size,prefix?prefix+'.'+field.name:field.name);return size;}
  throw Error('Unsupported IDL type');
 }
 const size=8+walk({defined:{name}},8,'');
 return {size,discriminator:idl.accounts.find(x=>x.name===name).discriminator,fields};
}
const layouts={curve:layout(dbc.DynamicBondingCurveIdl,'VirtualPool'),config:layout(dbc.DynamicBondingCurveIdl,'PoolConfig'),damm:layout(damm.CpAmmIdl,'Pool')};
fs.writeFileSync('src/layouts.json',JSON.stringify(layouts,null,2)+'\n');
fs.writeFileSync('src/migration-configs.json',JSON.stringify(dbc.DAMM_V2_MIGRATION_FEE_ADDRESS.map(x=>x.toBase58()),null,2)+'\n');
console.log(Object.fromEntries(Object.entries(layouts).map(([k,v])=>[k,v.size])));
