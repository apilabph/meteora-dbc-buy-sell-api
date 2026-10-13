import {PublicKey} from '@solana/web3.js';
import {TOKEN_PROGRAM_ID,TOKEN_2022_PROGRAM_ID,unpackMint,unpackAccount,getExtensionTypes,ExtensionType} from '@solana/spl-token';
import {ApiError} from './http.js';
const bad=(message='On-chain account validation failed.')=>{throw new ApiError(503,'INVALID_CHAIN_STATE',message);};
export function owned(info,owner){if(!info||info.executable||!info.owner.equals(owner))bad();return info;}
export function decodeMint(mint,info) {
  if(!info||info.executable||![TOKEN_PROGRAM_ID,TOKEN_2022_PROGRAM_ID].some(p=>p.equals(info.owner)))bad();
  const decoded=unpackMint(mint,info,info.owner);
  if(!decoded.isInitialized)bad();
  const permitted=[ExtensionType.MetadataPointer,ExtensionType.TokenMetadata,ExtensionType.MintCloseAuthority];
  if(getExtensionTypes(decoded.tlvData).some(t=>!permitted.includes(t)))throw new ApiError(422,'UNSUPPORTED_TOKEN_EXTENSION','This mint has token extensions unsupported by this builder.');
  if(decoded.freezeAuthority)throw new ApiError(422,'UNSUPPORTED_FREEZE_AUTHORITY','Mints with a freeze authority are unsupported.');
  return decoded;
}
export function tokenAccount(address,info,mint,owner,program,optional=false) {
  if(info===null&&optional)return null;
  const account=unpackAccount(address,owned(info,program),program);
  if(!account.mint.equals(mint)||!account.owner.equals(owner)||!account.isInitialized||account.isFrozen)bad('Token account owner, mint or state mismatch.');
  return account;
}

export function ensure(condition,code='INVALID_MARKET',message='Market identity or stage could not be verified.',status=422){if(!condition)throw new ApiError(status,code,message);}
export function decode(info,program,layout){
 owned(info,program);ensure(info.data.length>=layout.size,'ACCOUNT_LAYOUT','Account data is shorter than the pinned layout.');
 ensure(info.data.subarray(0,8).equals(Buffer.from(layout.discriminator)),'ACCOUNT_LAYOUT','Account discriminator mismatch.');
 const out={};for(const [name,{offset,type}] of Object.entries(layout.fields)){
  if(type==='pubkey')out[name]=new PublicKey(info.data.subarray(offset,offset+32));
  else if(type==='u8')out[name]=info.data[offset];
  else if(type==='u16')out[name]=info.data.readUInt16LE(offset);
  else if(type==='u64')out[name]=info.data.readBigUInt64LE(offset);
  else if(type==='u128')out[name]=info.data.readBigUInt64LE(offset)+(info.data.readBigUInt64LE(offset+8)<<64n);
 }return out;
}
