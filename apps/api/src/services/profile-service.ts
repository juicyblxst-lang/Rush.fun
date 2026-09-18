import {adminDb} from "../db/client.js";
import {AppError} from "../lib/errors.js";
import {post as serializePost,profile as serializeProfile} from "../lib/serializers.js";

export async function getProfile(username:string){
  const result=await adminDb.from("profiles").select("id,username,display_name,avatar_url,bio,created_at").eq("username",username).maybeSingle();
  if(result.error)throw new AppError("DB_ERROR",result.error.message,500);
  return result.data?serializeProfile(result.data):null;
}
export async function getProfilePosts(userId:string){
  const result=await adminDb.from("posts").select("id,market_id,thesis_id,author_id,body,created_at,profiles:author_id(id,username,display_name,avatar_url,bio,created_at),reactions:reactions(count),comments:comments(count),markets:market_id(external_id)").eq("author_id",userId).order("created_at",{ascending:false}).limit(50);
  if(result.error)throw new AppError("DB_ERROR",result.error.message,500);
  return (result.data??[]).map(row=>serializePost({...row,market_external_id:(row as any).markets?.external_id}));
}
async function relationCount(column:"follower_id"|"following_id",userId:string){
  const result=await adminDb.from("follows").select("follower_id",{count:"exact",head:true}).eq(column,userId);
  if(result.error)throw new AppError("DB_ERROR",result.error.message,500);
  return result.count??0;
}
export async function getProfileView(username:string,viewerId?:string){
  const profile=await getProfile(username);
  if(!profile)return null;
  const [posts,followerCount,followingCount,following]=await Promise.all([
    getProfilePosts(profile.id),
    relationCount("following_id",profile.id),
    relationCount("follower_id",profile.id),
    viewerId&&viewerId!==profile.id
      ? adminDb.from("follows").select("follower_id").eq("follower_id",viewerId).eq("following_id",profile.id).maybeSingle()
      : Promise.resolve({data:null,error:null})
  ]);
  if(following.error)throw new AppError("DB_ERROR",following.error.message,500);
  return {profile,posts,viewer:{authenticated:Boolean(viewerId),isSelf:viewerId===profile.id,isFollowing:Boolean(following.data),followerCount,followingCount}};
}