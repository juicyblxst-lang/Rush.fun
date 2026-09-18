import {adminDb} from "../db/client.js";
import {AppError} from "../lib/errors.js";

async function assertReactionTarget(targetType:"thesis"|"post"|"comment",targetId:string){
  const table=targetType==="thesis"?"theses":targetType==="post"?"posts":"comments";
  const result=await adminDb.from(table).select("id").eq("id",targetId).maybeSingle();
  if(result.error)throw new AppError("DB_ERROR",result.error.message,500);
  if(!result.data)throw new AppError("NOT_FOUND","Reaction target not found",404);
}
export async function setReaction(userId:string,targetType:"thesis"|"post"|"comment",targetId:string,reaction="like"){
  await assertReactionTarget(targetType,targetId);
  const result=await adminDb.from("reactions").upsert({user_id:userId,target_type:targetType,target_id:targetId,reaction},{onConflict:"user_id,target_type,target_id"}).select().single();
  if(result.error)throw new AppError("DB_ERROR",result.error.message,500);
  return result.data;
}
export async function removeReaction(userId:string,targetType:"thesis"|"post"|"comment",targetId:string){
  const result=await adminDb.from("reactions").delete().eq("user_id",userId).eq("target_type",targetType).eq("target_id",targetId);
  if(result.error)throw new AppError("DB_ERROR",result.error.message,500);
  return {ok:true};
}
export async function getReactionStatus(userId:string,targetType:"thesis"|"post"|"comment",targetId:string){
  await assertReactionTarget(targetType,targetId);
  const [mine,count]=await Promise.all([
    adminDb.from("reactions").select("reaction").eq("user_id",userId).eq("target_type",targetType).eq("target_id",targetId).maybeSingle(),
    adminDb.from("reactions").select("id",{count:"exact",head:true}).eq("target_type",targetType).eq("target_id",targetId)
  ]);
  if(mine.error)throw new AppError("DB_ERROR",mine.error.message,500);
  if(count.error)throw new AppError("DB_ERROR",count.error.message,500);
  return {reacted:Boolean(mine.data),reaction:mine.data?.reaction,count:count.count??0};
}
export async function follow(userId:string,targetUserId:string){
  if(userId===targetUserId)throw new AppError("VALIDATION","You cannot follow yourself");
  const target=await adminDb.from("profiles").select("id").eq("id",targetUserId).maybeSingle();
  if(target.error)throw new AppError("DB_ERROR",target.error.message,500);
  if(!target.data)throw new AppError("NOT_FOUND","Profile not found",404);
  const result=await adminDb.from("follows").insert({follower_id:userId,following_id:targetUserId}).select().single();
  if(result.error&&result.error.code!=="23505")throw new AppError("DB_ERROR",result.error.message,500);
  return result.data??{follower_id:userId,following_id:targetUserId};
}
export async function unfollow(userId:string,targetUserId:string){
  if(userId===targetUserId)throw new AppError("VALIDATION","You cannot unfollow yourself");
  const result=await adminDb.from("follows").delete().eq("follower_id",userId).eq("following_id",targetUserId);
  if(result.error)throw new AppError("DB_ERROR",result.error.message,500);
  return {ok:true};
}
export async function getFollowStatus(userId:string,targetUserId:string){
  if(userId===targetUserId)return {following:false};
  const target=await adminDb.from("profiles").select("id").eq("id",targetUserId).maybeSingle();
  if(target.error)throw new AppError("DB_ERROR",target.error.message,500);
  if(!target.data)throw new AppError("NOT_FOUND","Profile not found",404);
  const result=await adminDb.from("follows").select("follower_id").eq("follower_id",userId).eq("following_id",targetUserId).maybeSingle();
  if(result.error)throw new AppError("DB_ERROR",result.error.message,500);
  return {following:Boolean(result.data)};
}