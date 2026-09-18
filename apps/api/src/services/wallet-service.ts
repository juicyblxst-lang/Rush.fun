import {randomBytes} from "node:crypto";
import {adminDb} from "../db/client.js";
import {AppError} from "../lib/errors.js";
import {normalizeWalletAddress,walletLinkMessage,verifyWalletProof,WALLET_CHALLENGE_TTL_MS} from "./wallet-crypto.js";

export async function createWalletChallenge(userId:string,address:string,chain:"base"){
  const normalized=normalizeWalletAddress(address);
  const nonce=randomBytes(32).toString("hex");
  const expiresAt=new Date(Date.now()+WALLET_CHALLENGE_TTL_MS).toISOString();
  const result=await adminDb.from("wallet_link_challenges").insert({
    user_id:userId,address:normalized,chain,nonce,expires_at:expiresAt
  }).select("id,nonce,expires_at,address,chain").single();
  if(result.error)throw new AppError("DB_ERROR",result.error.message,500);
  return {
    challengeId:result.data.id,
    nonce:result.data.nonce,
    address:result.data.address,
    chain:result.data.chain,
    expiresAt:result.data.expires_at,
    message:walletLinkMessage(normalized,result.data.nonce)
  };
}

export async function linkWallet(userId:string,address:string,chain:"base",challengeId:string,message:string,signature:`0x${string}`){
  const normalized=normalizeWalletAddress(address);
  const challenge=await adminDb.from("wallet_link_challenges")
    .select("id,address,chain,nonce,expires_at,used_at")
    .eq("id",challengeId).eq("user_id",userId).maybeSingle();
  if(challenge.error)throw new AppError("DB_ERROR",challenge.error.message,500);
  if(!challenge.data)throw new AppError("INVALID_SIGNATURE","Wallet link challenge not found");
  if(challenge.data.used_at)throw new AppError("INVALID_SIGNATURE","Wallet link challenge has already been used");
  if(new Date(challenge.data.expires_at).getTime()<Date.now())throw new AppError("INVALID_SIGNATURE","Wallet link challenge has expired");
  if(challenge.data.address!==normalized||challenge.data.chain!==chain)throw new AppError("INVALID_SIGNATURE","Wallet link challenge does not match the wallet");
  const expected=walletLinkMessage(normalized,challenge.data.nonce);
  if(message!==expected)throw new AppError("INVALID_SIGNATURE","Wallet proof message does not match");
  const valid=await verifyWalletProof(normalized,message,signature);
  if(!valid)throw new AppError("INVALID_SIGNATURE","Wallet signature could not be verified");
  const consumed=await adminDb.from("wallet_link_challenges").update({used_at:new Date().toISOString()})
    .eq("id",challengeId).eq("user_id",userId).is("used_at",null).select("id").maybeSingle();
  if(consumed.error)throw new AppError("DB_ERROR",consumed.error.message,500);
  if(!consumed.data)throw new AppError("INVALID_SIGNATURE","Wallet link challenge has already been used");
  const wallet=await adminDb.from("wallets").upsert(
    {user_id:userId,address:normalized,chain,verified_at:new Date().toISOString()},
    {onConflict:"chain,address"}
  ).select().single();
  if(wallet.error){
    if(wallet.error.code==="23505")throw new AppError("WALLET_ALREADY_LINKED","This wallet is already linked to another account",409);
    throw new AppError("DB_ERROR",wallet.error.message,500);
  }
  return wallet.data;
}
