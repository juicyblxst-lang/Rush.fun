export type Chain = "base" | "solana";
export type MarketKind = "token" | "pool" | "asset";
export type ThesisStance = "bullish" | "bearish" | "neutral";
export interface Market { id:string; provider:string; chain:Chain; kind:MarketKind; name:string; symbol:string; address:string; marketAddress?:string; quoteSymbol?:string; description?:string; imageUrl?:string; priceUsd?:number; priceChange24h?:number; marketCapUsd?:number; volume24hUsd?:number; liquidityUsd?:number; updatedAt:string; sourceUrl?:string; }
export interface MarketActivity { id:string; marketId:string; provider:string; occurredAt:string; side?:string; priceUsd?:number; amountUsd?:number; traderAddress?:string; transactionHash?:string; }
export interface Profile { id:string; username:string; displayName:string; avatarUrl?:string; bio?:string; createdAt:string; }
export interface Thesis { id:string; marketId:string; author:Profile; stance:ThesisStance; title:string; body:string; createdAt:string; updatedAt:string; reactions:number; comments:number; }
export interface Post { id:string; marketId?:string; thesisId?:string; author:Profile; body:string; createdAt:string; reactions:number; comments:number; }
