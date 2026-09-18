import test from "node:test";import assert from "node:assert/strict";import {privateKeyToAccount} from "viem/accounts";import {normalizeWalletAddress,walletLinkMessage,verifyWalletProof,validateWalletChallenge} from "../src/services/wallet-crypto.js";
const account=privateKeyToAccount("0x0123456789012345678901234567890123456789012345678901234567890123");
test("wallet proof verifies a valid signature",async()=>{const message=walletLinkMessage(account.address,"nonce-123");const signature=await account.signMessage({message});assert.equal(await verifyWalletProof(account.address,message,signature),true);});
test("wallet proof rejects a changed message",async()=>{const message=walletLinkMessage(account.address,"nonce-123");const signature=await account.signMessage({message});assert.equal(await verifyWalletProof(account.address,message+"x",signature),false);});
test("wallet proof rejects a wrong wallet",async()=>{const message=walletLinkMessage(account.address,"nonce-123");const signature=await account.signMessage({message});const other=privateKeyToAccount("0x0223456789012345678901234567890123456789012345678901234567890123");assert.equal(await verifyWalletProof(other.address,message,signature),false);});
test("wallet address normalization rejects malformed input",()=>{assert.equal(normalizeWalletAddress(("0x"+account.address.slice(2).toUpperCase())),account.address.toLowerCase());assert.throws(()=>normalizeWalletAddress("not-a-wallet"));});

test("challenge validation rejects expired, reused and mismatched proofs",()=>{
 const base={address:account.address.toLowerCase(),chain:"base",nonce:"nonce-123",expires_at:new Date(Date.now()+60000).toISOString(),used_at:null};
 validateWalletChallenge(base,account.address,"base",walletLinkMessage(account.address,base.nonce));
 assert.throws(()=>validateWalletChallenge({...base,expires_at:new Date(Date.now()-1).toISOString()},account.address,"base",walletLinkMessage(account.address,base.nonce)));
 assert.throws(()=>validateWalletChallenge({...base,used_at:new Date().toISOString()},account.address,"base",walletLinkMessage(account.address,base.nonce)));
 assert.throws(()=>validateWalletChallenge(base,account.address,"base","wrong message"));
 assert.throws(()=>validateWalletChallenge(base,"0x1111111111111111111111111111111111111111","base",walletLinkMessage(account.address,base.nonce)));
});