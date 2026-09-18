import {adminDb} from "../db/client.js";
import {AppError} from "../lib/errors.js";
import {ensureMarketRecord} from "./market-record-service.js";

const select="id,market_id,author_id,stance,title,body,created_at,updated_at,profiles:author_id(id,username,display_name,avatar_url,bio,created_at)";

export async function listTheses(externalMarketId:string){
  const {data:market,error:marketError}=await adminDb.from("markets").select("id").eq("external_id",externalMarketId).maybeSingle();
  if(marketError) throw new AppError("DB_ERROR",marketError.message,500);
  if(!market) return [];
  const {data,error}=await adminDb.from("theses").select(select).eq("market_id",market.id).order("created_at",{ascending:false});
  if(error) throw new AppError("DB_ERROR",error.message,500);
  return data??[];
}
export async function createThesis(userId:string,input:{marketId:string;stance:"bullish"|"bearish"|"neutral";title:string;body:string}){
  const marketId=await ensureMarketRecord(input.marketId);
  const {data,error}=await adminDb.from("theses").insert({market_id:marketId,author_id:userId,stance:input.stance,title:input.title.trim(),body:input.body.trim()}).select(select).single();
  if(error) throw new AppError("DB_ERROR",error.message,500);
  return data;
}