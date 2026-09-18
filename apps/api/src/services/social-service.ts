import {adminDb} from "../db/client.js";
import {AppError} from "../lib/errors.js";
import {ensureMarketRecord} from "./market-record-service.js";
import {moderateText} from "../agents/moderation-agent.js";
import {apiConfig} from "@rush/config";
import {post as serializePost} from "../lib/serializers.js";

const select="id,market_id,thesis_id,author_id,body,created_at,profiles:author_id(id,username,display_name,avatar_url,bio,created_at),reactions:reactions(count),comments:comments(count),markets:market_id(external_id)";

async function moderateIfConfigured(text:string){
  if(!apiConfig.openAiApiKey)return;
  const result=await moderateText(text);
  if(result.flagged)throw new AppError("CONTENT_REJECTED","This content was flagged by moderation",422);
}
async function assertExists(table:"posts"|"theses",id:string){
  const result=await adminDb.from(table).select("id").eq("id",id).maybeSingle();
  if(result.error)throw new AppError("DB_ERROR",result.error.message,500);
  if(!result.data)throw new AppError("NOT_FOUND",table==="posts"?"Post not found":"Thesis not found",404);
}

export async function createPost(userId:string,input:{marketId?:string;thesisId?:string;body:string}){
  const body=input.body.trim();if(body.length<1||body.length>10000)throw new AppError("VALIDATION","Post body must be between 1 and 10000 characters");
  if(!input.marketId&&!input.thesisId)throw new AppError("VALIDATION","A post must belong to a market or thesis");
  if(input.marketId&&input.thesisId)throw new AppError("VALIDATION","A post cannot belong to both a market and a thesis");
  if(input.thesisId)await assertExists("theses",input.thesisId);
  await moderateIfConfigured(body);
  const marketId=input.marketId?await ensureMarketRecord(input.marketId):undefined;
  const result=await adminDb.from("posts").insert({author_id:userId,market_id:marketId??null,thesis_id:input.thesisId??null,body}).select(select).single();
  if(result.error)throw new AppError("DB_ERROR",result.error.message,500);
  return serializePost({...result.data,market_external_id:(result.data as any).markets?.external_id});
}
export async function listPosts(externalMarketId:string){
  const market=await adminDb.from("markets").select("id").eq("external_id",externalMarketId).maybeSingle();
  if(market.error)throw new AppError("DB_ERROR",market.error.message,500);
  if(!market.data)return [];
  const result=await adminDb.from("posts").select(select).eq("market_id",market.data.id).order("created_at",{ascending:false}).limit(100);
  if(result.error)throw new AppError("DB_ERROR",result.error.message,500);
  return (result.data??[]).map(row=>serializePost({...row,market_external_id:(row as any).markets?.external_id}));
}
export async function addComment(userId:string,input:{postId?:string;thesisId?:string;body:string}){
  const body=input.body.trim();if(body.length<1||body.length>5000)throw new AppError("VALIDATION","Comment body must be between 1 and 5000 characters");
  if((input.postId?1:0)+(input.thesisId?1:0)!==1)throw new AppError("VALIDATION","Exactly one comment target is required");
  if(input.postId)await assertExists("posts",input.postId); else await assertExists("theses",input.thesisId!);
  await moderateIfConfigured(body);
  const result=await adminDb.from("comments").insert({author_id:userId,post_id:input.postId??null,thesis_id:input.thesisId??null,body}).select("id,post_id,thesis_id,author_id,body,created_at,profiles:author_id(id,username,display_name,avatar_url,bio,created_at)").single();
  if(result.error)throw new AppError("DB_ERROR",result.error.message,500);
  return result.data;
}
