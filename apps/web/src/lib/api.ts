import type {Market,MarketActivity,Thesis,Post,Profile} from "@rush/types";
const base=process.env.NEXT_PUBLIC_API_URL??"http://localhost:4000";
async function request<T>(path:string,init?:RequestInit):Promise<T>{
  const response=await fetch(base+path,{...init,headers:{"Content-Type":"application/json",...(init?.headers??{})},cache:"no-store"});
  const body=await response.json().catch(()=>null);
  if(!response.ok)throw new Error(body?.message??response.statusText);
  return body as T;
}
export const api={
  markets:(q?:string)=>request<{items:Market[]}>(q?"/v1/markets?q="+encodeURIComponent(q):"/v1/markets"),
  market:(id:string)=>request<Market>("/v1/markets/"+encodeURIComponent(id)),
  activity:(id:string)=>request<{items:MarketActivity[]}>(`/v1/markets/${encodeURIComponent(id)}/activity`),
  theses:(id:string)=>request<{items:Thesis[]}>(`/v1/markets/${encodeURIComponent(id)}/theses`),
  posts:(id:string)=>request<{items:Post[]}>(`/v1/markets/${encodeURIComponent(id)}/posts`),
  thesisComments:(id:string)=>request<{items:Array<{id:string;body:string;created_at:string;profiles:{display_name:string}}}>(`/v1/theses/${encodeURIComponent(id)}/comments`),
  postComments:(id:string)=>request<{items:Array<{id:string;body:string;created_at:string;profiles:{display_name:string}}}>(`/v1/posts/${encodeURIComponent(id)}/comments`),
  profile:(username:string)=>request<{profile:Profile;posts:Post[]}>(`/v1/profiles/${encodeURIComponent(username)}`),
  communityActivity:()=>request<{items:Array<{id:string;agent:string;event_type:string;created_at:string}>}>("/v1/activity"),
  thesis:(id:string)=>request<Thesis>(`/v1/theses/${encodeURIComponent(id)}`),
  context:(id:string)=>request<{marketId:string;generatedAt:string;text:string}>(`/v1/markets/${encodeURIComponent(id)}/context`),
  createThesis:(token:string,input:unknown)=>request<Thesis>("/v1/theses",{method:"POST",headers:{Authorization:"Bearer "+token},body:JSON.stringify(input)}),
  createPost:(token:string,input:unknown)=>request<Post>("/v1/posts",{method:"POST",headers:{Authorization:"Bearer "+token},body:JSON.stringify(input)}),
  comment:(token:string,input:unknown)=>request("/v1/comments",{method:"POST",headers:{Authorization:"Bearer "+token},body:JSON.stringify(input)}),
  walletChallenge:(token:string,address:string)=>request<{challengeId:string;nonce:string;address:string;chain:"base";expiresAt:string;message:string}>("/v1/wallet/challenge",{method:"POST",headers:{Authorization:"Bearer "+token},body:JSON.stringify({address,chain:"base"})}),
  linkWallet:(token:string,address:string,challengeId:string,message:string,signature:string)=>request("/v1/wallet",{method:"POST",headers:{Authorization:"Bearer "+token},body:JSON.stringify({address,chain:"base",challengeId,message,signature})}),
  follow:(token:string,userId:string)=>request<unknown>("/v1/follows",{method:"POST",headers:{Authorization:"Bearer "+token},body:JSON.stringify({userId})}),
  unfollow:(token:string,userId:string)=>request<unknown>("/v1/follows/"+encodeURIComponent(userId),{method:"DELETE",headers:{Authorization:"Bearer "+token}}),
  react:(token:string,input:unknown)=>request<unknown>("/v1/reactions",{method:"POST",headers:{Authorization:"Bearer "+token},body:JSON.stringify(input)}),
  unreact:(token:string,targetType:string,targetId:string)=>request<unknown>("/v1/reactions/"+targetType+"/"+targetId,{method:"DELETE",headers:{Authorization:"Bearer "+token}})
};
