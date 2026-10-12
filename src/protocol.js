import {PublicKey,SystemProgram} from '@solana/web3.js';
import {NATIVE_MINT,TOKEN_PROGRAM_ID,TOKEN_2022_PROGRAM_ID,getAssociatedTokenAddressSync} from '@solana/spl-token';
import layouts from './layouts.json' with {type:'json'};
import migrationConfigs from './migration-configs.json' with {type:'json'};
import {decode,decodeMint,tokenAccount,ensure} from './accounts.js';
export {tokenAccount} from './accounts.js';
export const DBC=new PublicKey('dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN');
export const DAMM=new PublicKey('cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG');
const pda=(program,...seeds)=>PublicKey.findProgramAddressSync(seeds.map(x=>typeof x==='string'?Buffer.from(x):x.toBuffer()),program)[0];
const sorted=mint=>[mint,NATIVE_MINT].sort((a,b)=>b.toBuffer().compare(a.toBuffer()));
export const curveAddress=(config,mint)=>pda(DBC,'pool',config,...sorted(mint));
export const migratedAddress=(config,mint)=>pda(DAMM,'pool',config,...sorted(mint));
export const DBC_AUTHORITY=pda(DBC,'pool_authority');
const unwrap=record=>Object.fromEntries(Object.entries(record).filter(([k])=>k.startsWith('pool_state.')).map(([k,v])=>[k.slice(11),v]));
export function classify(curve,config){
 ensure([0,1].includes(curve.is_migrated),'UNKNOWN_STAGE','Unknown DBC migration state.');
 ensure([0,1].includes(config.migration_option),'UNKNOWN_MIGRATION','Unknown DBC migration option.');
 if(curve.is_migrated===0){ensure(curve.quote_reserve<config.migration_quote_threshold&&curve.migration_progress===0,'MIGRATION_PENDING','Curve completed; wait for migration.',409);return 'meteora-dbc';}
 ensure(config.migration_option===1,'UNSUPPORTED_MIGRATION','DAMM V1 migrations are not supported by this beta.');return 'meteora-damm-v2';
}
export async function inspectState(rpc,input){
 ensure(input.market,'MARKET_REQUIRED','Provide the original DBC curve address in market. It is needed to verify the migration destination.',400);
 const first=unwrap(decode((await rpc.accounts([input.market]))[0],DBC,layouts.curve));
 const [curveInfo,configInfo]=await rpc.accounts([input.market,first.config]);
 const curve=unwrap(decode(curveInfo,DBC,layouts.curve)),config=decode(configInfo,DBC,layouts.config);
 ensure(curve.config.equals(first.config),'STATE_CHANGED','Curve configuration changed; retry.',409);
 ensure(curve.base_mint.equals(input.mint)&&config.quote_mint.equals(NATIVE_MINT)&&curveAddress(curve.config,input.mint).equals(input.market),'MARKET_MISMATCH','Curve, mint, quote or PDA does not match.');
 ensure([0,1].includes(config.token_type)&&config.quote_token_flag===0&&curve.pool_type===config.token_type,'UNSUPPORTED_TOKEN_PROGRAM','Unsupported mint program flags.');
 const venue=classify(curve,config),tokenProgram=config.token_type===0?TOKEN_PROGRAM_ID:TOKEN_2022_PROGRAM_ID;
 if(venue==='meteora-dbc')return {curveKey:input.market,marketKey:input.market,venue,label:'Dynamic Bonding Curve',programId:DBC,variants:[78,88],tokenProgram};
 ensure(Number.isInteger(config.migration_fee_option)&&config.migration_fee_option<migrationConfigs.length,'UNSUPPORTED_MIGRATION','Unknown migrated fee configuration.');
 const marketKey=migratedAddress(new PublicKey(migrationConfigs[config.migration_fee_option]),input.mint);
 const info=(await rpc.accounts([marketKey]))[0];ensure(info,'MIGRATION_PENDING','Expected DAMM V2 pool is unavailable. Custom migration configurations are not covered by this beta.',409);
 const pool=decode(info,DAMM,layouts.damm);
 ensure(pool.token_a_mint.equals(input.mint)&&pool.token_b_mint.equals(NATIVE_MINT)&&pool.creator.equals(DBC_AUTHORITY),'POOL_MISMATCH','DAMM V2 pool is not the expected DBC migration.');
 ensure(pool.pool_status===0&&pool.liquidity>0n,'POOL_DISABLED','Migrated pool is disabled or has no liquidity.');
 return {curveKey:input.market,marketKey,venue,label:'Meteora DAMM v2',programId:DAMM,variants:[77,108],tokenProgram};
}
export async function loadState(rpc,input,additionalKeys=[]){
 const state=await inspectState(rpc,input),userBaseTokenAccount=getAssociatedTokenAddressSync(input.mint,input.user,false,state.tokenProgram);
 const [mintInfo,userInfo,walletInfo,...additionalAccounts]=await rpc.accounts([input.mint,userBaseTokenAccount,input.user,...additionalKeys]);
 const mintAccount=decodeMint(input.mint,mintInfo);ensure(mintInfo.owner.equals(state.tokenProgram),'MINT_MISMATCH');
 ensure(!walletInfo||(!walletInfo.executable&&walletInfo.owner.equals(SystemProgram.programId)),'UNSUPPORTED_WALLET','Use a system-owned signing wallet.');
 return {...state,userBaseTokenAccount,mintAccount,walletInfo,userBase:tokenAccount(userBaseTokenAccount,userInfo,input.mint,input.user,state.tokenProgram,true),additionalAccounts,slot:rpc.slot};
}
export async function verifyStage(rpc,input,state){const latest=await inspectState(rpc,input);ensure(latest.venue===state.venue&&latest.marketKey.equals(state.marketKey),'VENUE_CHANGED','Market changed during construction; rebuild.',409);}
