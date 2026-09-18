import {adminDb} from "../db/client.js";import {AppError} from "../lib/errors.js";import {buildMarketContext} from "../agents/market-context-agent.js";import {getMarket} from "./market-service.js";
export async function getPersistedMarketContext(externalId:string){
 const market=await adminDb.from("markets").select("id,updated_at").eq("external_id",externalId).maybeSingle();if(market.error)throw new AppError("DB_ERROR",market.error.message,500);if(!market.data)throw new AppError("MARKET_NOT_FOUND","Market has not been synchronized yet",404);
 const result=await adminDb.from("market_contexts").select("*").eq("market_id",market.data.id).eq("agent_type","market-context-agent").eq("generation_status","ready").maybeSingle();if(result.error)throw new AppError("DB_ERROR",result.error.message,500);if(!result.data)throw new AppError("AGENT_CONTEXT_UNAVAILABLE","No current market context is available yet",404);
 const row=result.data as {generated_at:string;source_data_at:string|null;model:string;summary:string;supporting_arguments:string[];counter_arguments:string[];limitations:string[]};
 return{marketId:externalId,generatedAt:row.generated_at,sourceDataAt:row.source_data_at,model:row.model,summary:row.summary,supportingArguments:row.supporting_arguments,counterArguments:row.counter_arguments,limitations:row.limitations};
}
export async function persistMarketContextFailure(externalId:string,error:unknown){
 const market=await adminDb.from("markets").select("id").eq("external_id",externalId).maybeSingle();if(market.error||!market.data)return;
 const message=error instanceof Error?error.message:"Unknown agent failure";
 await adminDb.from("market_contexts").upsert({market_id:market.data.id,agent_type:"market-context-agent",model:process.env.OPENAI_MODEL??"gpt-5.6-luna",generated_at:new Date().toISOString(),source_data_at:null,summary:"",relevant_activity:[],relevant_theses:[],supporting_arguments:[],counter_arguments:[],limitations:["Context generation failed and no generated context is available."],generation_status:"failed",error_message:message,updated_at:new Date().toISOString()},{onConflict:"market_id,agent_type"});
}
export async function generateAndPersistMarketContext(externalId:string){
 const market=await getMarket(externalId);if(!market)throw new AppError("MARKET_NOT_FOUND","Market not found",404);
 const context=await buildMarketContext(externalId);const dbMarket=await adminDb.from("markets").select("id").eq("external_id",externalId).single();if(dbMarket.error)throw new AppError("DB_ERROR",dbMarket.error.message,500);
 const row=await adminDb.from("market_contexts").upsert({market_id:dbMarket.data.id,agent_type:"market-context-agent",model:context.model,generated_at:context.generatedAt,source_data_at:context.sourceDataAt,summary:context.summary,relevant_activity:context.relevantActivity,relevant_theses:context.relevantTheses,supporting_arguments:context.supportingArguments,counter_arguments:context.counterArguments,limitations:context.limitations,generation_status:"ready",error_message:null,updated_at:context.generatedAt},{onConflict:"market_id,agent_type"}).select("*").single();if(row.error)throw new AppError("DB_ERROR",row.error.message,500);
 const event=await adminDb.from("agent_events").insert({agent:"market-context-agent",event_type:"context_refreshed",market_id:dbMarket.data.id,payload:{generatedAt:context.generatedAt,model:context.model,sourceDataAt:context.sourceDataAt}});if(event.error)throw new AppError("DB_ERROR",event.error.message,500);
 return getPersistedMarketContext(externalId);
}