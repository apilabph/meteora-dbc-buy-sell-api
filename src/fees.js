import {PublicKey} from '@solana/web3.js';
import {getAssociatedTokenAddressSync,NATIVE_MINT} from '@solana/spl-token';
export const FEE_BPS=25;
export const FEE_RECIPIENT=new PublicKey('DYjod9qNZvNu93yhdEw7pnASdt8FdghQF5WhEU7CgEXj');
export const FEE_ATA=getAssociatedTokenAddressSync(NATIVE_MINT,FEE_RECIPIENT);
export const feeFor=amount=>amount*BigInt(FEE_BPS)/10000n;
