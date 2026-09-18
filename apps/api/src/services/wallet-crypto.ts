import {verifyMessage} from "viem";import {AppError} from "../lib/errors.js";
export const WALLET_CHALLENGE_TTL_MS=5*60*1000;
export function normalizeWalletAddress(address:string){if(!/^0x[a-fA-F0-9]{40}$/.test(address))throw new AppError("VALIDATION","Invalid EVM wallet address");return address.toLowerCase();}
export function walletLinkMessage(address:string,nonce:string){return "RUSH.FUN wallet link\nAddress: "+normalizeWalletAddress(address)+"\nNonce: "+nonce;}
export async function verifyWalletProof(address:string,message:string,signature:`0x${string}`){try{return await verifyMessage({address:normalizeWalletAddress(address) as `0x${string}`,message,signature});}catch{return false;}}
