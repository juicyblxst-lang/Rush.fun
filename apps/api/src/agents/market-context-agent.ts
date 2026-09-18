import OpenAI from "openai";
import {apiConfig} from "@rush/config";
import {getMarket,marketActivity} from "../services/market-service.js";
import {listTheses} from "../services/thesis-service.js";
import {AppError} from "../lib/errors.js";
export interface MarketContextResult{marketId:string;generatedAt:string;sourceDataAt:string|null;model:string;summary:string;relevantActivity:unknown[];relevantTheses:unknown[];supportingArguments:string[];counterArguments:string[];limitations:string[]}
export async function buildMarketContext(marketId:string):Promise<MarketContextResult>{
 if(!apiConfig.openAiApiKey)throw new AppError("AGENT_UNAVAILABLE","Market context agent is not configured",503);
 const market=await getMarket(marketId);if(!market)throw new AppError("MARKET_NOT_FOUND","Market not found",404);
 const [activity,theses]=await Promise.all([marketActivity(marketId,25),listTheses(marketId)]);
 const timestamps=[market.updatedAt,...activity.map(x=>x.occurredAt),...theses.map(x=>x.createdAt)].filter(Boolean).sort();
 const client=new OpenAI({apiKey:apiConfig.openAiApiKey});
 const response=await client.responses.create({model:apiConfig.openAiModel,instructions:"You are the market-context assistant inside RUSH.FUN. Use only the supplied market, activity and thesis data. Never invent facts, news, causes, people, prices, events or arguments. Supporting and counter arguments must be grounded in supplied theses. State limitations when data is missing. Do not recommend trades.",input:JSON.stringify({market,activity,theses}),store:false,text:{format:{type:"json_schema",name:"rush_market_context",strict:true,schema:{type:"object",additionalProperties:false,properties:{summary:{type:"string"},supportingArguments:{type:"array",items:{type:"string"}},counterArguments:{type:"array",items:{type:"string"}},limitations:{type:"array",items:{type:"string"}}},required:["summary","supportingArguments","counterArguments","limitations"]}}}});
 let parsed:{summary:string;supportingArguments:string[];counterArguments:string[];limitations:string[]};
 try{parsed=JSON.parse(response.output_text);}catch{throw new AppError("AGENT_INVALID_OUTPUT","Market context agent returned invalid structured output",502);}
 return{marketId,generatedAt:new Date().toISOString(),sourceDataAt:timestamps.length?timestamps[timestamps.length-1]:null,model:apiConfig.openAiModel,summary:parsed.summary,relevantActivity:activity,relevantTheses:theses,supportingArguments:parsed.supportingArguments,counterArguments:parsed.counterArguments,limitations:parsed.limitations};
}