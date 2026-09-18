import {adminDb} from "../db/client.js";import {AppError} from "../lib/errors.js";import {profile as serializeProfile} from "../lib/serializers.js";
type RawActor={id:string;username:string;display_name:string;avatar_url?:string|null;bio?:string|null;created_at:string};
export async function communityActivity(limit=50){
 const [theses,posts,reactions,comments]=await Promise.all([
  adminDb.from("theses").select("id,market_id,title,created_at,profiles:author_id(id,username,display_name,avatar_url,bio,created_at),markets:market_id(external_id)").order("created_at",{ascending:false}).limit(limit),
  adminDb.from("posts").select("id,market_id,thesis_id,body,created_at,profiles:author_id(id,username,display_name,avatar_url,bio,created_at),markets:market_id(external_id)").order("created_at",{ascending:false}).limit(limit),
  adminDb.from("reactions").select("id,target_type,target_id,reaction,created_at,profiles:user_id(id,username,display_name,avatar_url,bio,created_at)").order("created_at",{ascending:false}).limit(limit),
  adminDb.from("comments").select("id,post_id,thesis_id,body,created_at,profiles:author_id(id,username,display_name,avatar_url,bio,created_at),posts:post_id(markets:market_id(external_id)),theses:thesis_id(markets:market_id(external_id))").order("created_at",{ascending:false}).limit(limit)
 ]);
 if(theses.error||posts.error||reactions.error||comments.error)throw new AppError("DB_ERROR",theses.error?.message??posts.error?.message??reactions.error?.message??comments.error?.message??"Could not load activity",500);
 const actor=(x:RawActor|RawActor[]|null|undefined)=>{const row=Array.isArray(x)?x[0]:x;return row?serializeProfile(row):undefined;};
 const items=[
  ...(theses.data??[]).map(x=>({id:"thesis:"+x.id,eventType:"thesis_published",createdAt:x.created_at,text:(actor((x as any).profiles)?.displayName??"Someone")+" posted a thesis about "+((x as any).markets?.external_id??"a market"),marketId:(x as any).markets?.external_id,targetId:x.id,targetType:"thesis" as const,actor:actor((x as any).profiles)})),
  ...(posts.data??[]).map(x=>({id:"post:"+x.id,eventType:"post_published",createdAt:x.created_at,text:(actor((x as any).profiles)?.displayName??"Someone")+" posted in a market discussion",marketId:(x as any).markets?.external_id,targetId:x.id,targetType:"post" as const,actor:actor((x as any).profiles)})),
  ...(comments.data??[]).map(x=>({id:"comment:"+x.id,eventType:"comment_added",createdAt:x.created_at,text:(actor((x as any).profiles)?.displayName??"Someone")+" commented on a market discussion",marketId:(x as any).posts?.markets?.external_id??(x as any).theses?.markets?.external_id,targetId:x.id,targetType:"comment" as const,actor:actor((x as any).profiles)})),
  ...(reactions.data??[]).map(x=>({id:"reaction:"+x.id,eventType:"reaction_added",createdAt:x.created_at,text:(actor((x as any).profiles)?.displayName??"Someone")+" liked a "+x.target_type,targetId:x.target_id,targetType:x.target_type,actor:actor((x as any).profiles)}))
 ];
 return items.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,limit);
}