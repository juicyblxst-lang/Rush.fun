import test from "node:test";import assert from "node:assert/strict";import {rankDiscoveryMarkets} from "../src/services/discovery-service.js";
const market=(id:string,priceChange=0)=>({id,provider:"base",chain:"base" as const,kind:"pool" as const,name:id,symbol:id,address:id,updatedAt:new Date().toISOString(),priceChange24h:priceChange});
test("discovery ranking is deterministic and activity-aware",()=>{const ranked=rankDiscoveryMarkets([
 {market:market("quiet"),signals:{volume:10,liquidity:10,priceMove:0,recency:.1,theses24h:0,posts24h:0,reactions24h:0}},
 {market:market("social",5),signals:{volume:100,liquidity:50,priceMove:5,recency:1,theses24h:5,posts24h:3,reactions24h:10}}
]);assert.equal(ranked[0].market.id,"social");assert.equal(rankDiscoveryMarkets(ranked.map(x=>({market:x.market,signals:x.signals})).map(x=>x)).map(x=>x.market.id).join(","),"social,quiet");});
test("ranking handles missing social signals without fabrication",()=>{const ranked=rankDiscoveryMarkets([{market:market("only"),signals:{volume:0,liquidity:0,priceMove:0,recency:0,theses24h:0,posts24h:0,reactions24h:0}}]);assert.equal(ranked[0].score,.5);});
