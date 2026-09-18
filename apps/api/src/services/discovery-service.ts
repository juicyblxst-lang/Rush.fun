import type {Market} from "@rush/types";
import {adminDb} from "../db/client.js";
import type {MarketProvider} from "../providers/provider.js";

export interface DiscoverySignals{volume:number;liquidity:number;priceMove:number;recency:number;theses24h:number;posts24h:number;reactions24h:number}
export interface RankedMarket{market:Market;signals:DiscoverySignals;score:number}
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const normalize=(value:number,values:number[])=>{const finite=values.filter(Number.isFinite);if(!finite.length)return 0;const min=Math.min(...finite),max=Math.max(...finite);return max===min?0.5:clamp((value-min)/(max-min));};
export function rankDiscoveryMarkets(items:Array<{market:Market;signals:DiscoverySignals}>):RankedMarket[]{
 const volumes=items.map(x=>Math.log1p(Math.max(0,x.signals.volume)));const liquidities=items.map(x=>Math.log1p(Math.max(0,x.signals.liquidity)));
 const moves=items.map(x=>Math.abs(x.signals.priceMove));const recencies=items.map(x=>x.signals.recency);const theses=items.map(x=>x.signals.theses24h);const posts=items.map(x=>x.signals.posts24h);const reactions=items.map(x=>x.signals.reactions24h);
 return items.map((x,i)=>({market:x.market,signals:x.signals,score:
   normalize(volumes[i],volumes)*0.25+normalize(liquidities[i],liquidities)*0.10+normalize(moves[i],moves)*0.15+
   normalize(recencies[i],recencies)*0.10+normalize(theses[i],theses)*0.20+normalize(posts[i],posts)*0.10+normalize(reactions[i],reactions)*0.10
 })).sort((a,b)=>b.score-a.score||a.market.id.localeCompare(b.market.id));
}
async function socialSignals(markets:Market[]){
 const ids=markets.map(x=>x.id);
 if(!ids.length)return new Map<string,DiscoverySignals>();
 const db=await adminDb.from("markets").select("id,external_id").in("external_id",ids);if(db.error)throw db.error;
 const map=new Map((db.data??[]).map(x=>[x.id,x.external_id]));
 const marketIds=[...(db.data??[]).map(x=>x.id)];
 const cutoff=new Date(Date.now()-24*60*60*1000).toISOString();
 const [th,po,re]=await Promise.all([
  marketIds.length?adminDb.from("theses").select("market_id").in("market_id",marketIds).gte("created_at",cutoff):Promise.resolve({data:[],error:null}),
  marketIds.length?adminDb.from("posts").select("market_id").in("market_id",marketIds).gte("created_at",cutoff):Promise.resolve({data:[],error:null}),
  adminDb.from("reactions").select("target_type,target_id").gte("created_at",cutoff)
 ]);
 if(th.error||po.error||re.error)throw th.error??po.error??re.error;
 const signal=new Map<string,DiscoverySignals>();
 for(const id of ids)signal.set(id,{volume:0,liquidity:0,priceMove:0,recency:0,theses24h:0,posts24h:0,reactions24h:0});
 for(const row of db.data??[]){const market=markets.find(x=>x.id===row.external_id);if(market){const age=Math.max(0,Date.now()-new Date(market.updatedAt).getTime());signal.get(market.id)!.recency=1/(1+age/(60*60*1000));signal.get(market.id)!.volume=market.volume24hUsd??0;signal.get(market.id)!.liquidity=market.liquidityUsd??0;signal.get(market.id)!.priceMove=market.priceChange24h??0;}}
 for(const row of th.data??[]){const external=map.get(row.market_id);if(external)signal.get(external)!.theses24h++;}
 for(const row of po.data??[]){const external=map.get(row.market_id);if(external)signal.get(external)!.posts24h++;}
 const targetIds=new Set((re.data??[]).map(x=>x.target_id));
 if(targetIds.size){const [tp,pp,cp]=await Promise.all([
  adminDb.from("theses").select("id,market_id").in("id",[...targetIds]),
  adminDb.from("posts").select("id,market_id").in("id",[...targetIds]),
  adminDb.from("comments").select("id,post_id,thesis_id").in("id",[...targetIds])
 ]);
 for(const row of tp.data??[]){const external=map.get(row.market_id);if(external)signal.get(external)!.reactions24h++;}
 for(const row of pp.data??[]){const external=map.get(row.market_id);if(external)signal.get(external)!.reactions24h++;}
 const postMap=new Map((pp.data??[]).map(x=>[x.id,x.market_id]));const thesisMap=new Map((tp.data??[]).map(x=>[x.id,x.market_id]));
 for(const row of cp.data??[]){const mid=row.post_id?postMap.get(row.post_id):row.thesis_id?thesisMap.get(row.thesis_id):undefined;const external=mid?map.get(mid):undefined;if(external)signal.get(external)!.reactions24h++;}
 }
 return signal;
}
export async function discoverRushMarkets(providers:MarketProvider[],limit:number){
 const results=await Promise.allSettled(providers.map(p=>p.listMarkets({limit:Math.max(limit,100)})));
 const markets=results.flatMap(r=>r.status==="fulfilled"?r.value.items:[]);
 const deduped=[...new Map(markets.map(m=>[m.id,m])).values()];
 if(!deduped.length)throw new Error("No configured market provider returned data");
 const signals=await socialSignals(deduped);
 return rankDiscoveryMarkets(deduped.map(m=>({market:m,signals:signals.get(m.id)!}))).slice(0,limit).map(x=>x.market);
}