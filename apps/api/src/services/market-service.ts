import {marketProviders} from "../providers/index.js"; import type {Market} from "@rush/types";
export async function discoverMarkets(limit=24){const results=await Promise.allSettled(marketProviders.map(p=>p.listMarkets({limit})));return results.flatMap(r=>r.status==="fulfilled"?r.value.items:[]);}
export async function getMarket(id:string){const provider=marketProviders.find(p=>id.startsWith(p.name+":"));return provider?provider.getMarket(id):null;}
export async function searchMarkets(q:string,limit=20){const results=await Promise.allSettled(marketProviders.map(p=>p.searchMarkets(q,limit)));return results.flatMap(r=>r.status==="fulfilled"?r.value:[]).slice(0,limit);}
export async function marketActivity(id:string,limit=50){const provider=marketProviders.find(p=>id.startsWith(p.name+":"));return provider?provider.getMarketActivity(id,limit):[];}
export const marketToResponse=(market:Market)=>market;