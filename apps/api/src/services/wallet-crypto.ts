import {verifyMessage} from "viem";import {AppError} from "../lib/errors.js";
export const WALLET_CHALLENGE_TTL_MS=5*60*1000;
export function normalizeWalletAddress(address:string){if(!/^0x[a-fA-F0-9]{40}$/.test(address))throw new AppError("VALIDATION","Invalid EVM wallet address");return address.toLowerCase();}
export function walletLinkMessage(address:string,nonce:string){return "RUSH.FUN wallet link\nAddress: "+normalizeWalletAddress(address)+"\nNonce: "+nonce;}
export function validateWalletChallenge(challenge:{address:string;chain:string;nonce:string;expires_at:string;used_at?:string|null},address:string,chain:"base",message:string){
 const normalized=normalizeWalletAddress(address);
 if(challenge.used_at)throw new AppError("INVALID_SIGNATURE","Wallet link challenge has already been used");
 if(new Date(challenge.expires_at).getTime()<Date.now())throw new AppError("INVALID_SIGNATURE","Wallet link challenge has expired");
 if(challenge.address!==normalized||challenge.chain!==chain)throw new AppError("INVALID_SIGNATURE","Wallet link challenge does not match the wallet");
 if(message!==walletLinkMessage(normalized,challenge.nonce))throw new AppError("INVALID_SIGNATURE","Wallet proof message does not match");
}
export async function verifyWalletProof(address:string,message:string,signature:`0x${string}`){try{return await verifyMessage({address:normalizeWalletAddress(address) as `0x${string}`,message,signature});}catch{return false;}}
