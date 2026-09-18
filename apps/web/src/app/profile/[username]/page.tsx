"use client";
import {useEffect,useState} from "react";
import type {Post,Profile} from "@rush/types";
import {api} from "../../../lib/api";
import {supabase,supabaseConfigured} from "../../../lib/supabase";

export default function ProfilePage({params}:{params:Promise<{username:string}>}){
  const [profile,setProfile]=useState<Profile|null>(null); const [posts,setPosts]=useState<Post[]>([]);
  const [following,setFollowing]=useState(false); const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
  useEffect(()=>{params.then(p=>api.profile(p.username).then(data=>{setProfile(data.profile);setPosts(data.posts);}).catch(()=>setProfile(null)));},[params]);
  const toggleFollow=async()=>{
    if(!profile||!supabaseConfigured){setMessage("Sign in to follow profiles.");return;}
    const {data}=await supabase.auth.getSession(); if(!data.session){setMessage("Sign in to follow profiles.");return;}
    setBusy(true);setMessage("");
    try{if(following){await api.unfollow(data.session.access_token,profile.id);setFollowing(false);}else{await api.follow(data.session.access_token,profile.id);setFollowing(true);}}
    catch(error){setMessage(error instanceof Error?error.message:"Could not update follow.");}
    finally{setBusy(false);}
  };
  if(!profile)return <main className="page"><div className="empty">Loading or profile not found.</div></main>;
  return <main className="page"><div className="eyebrow">Profile</div><div className="section-head"><div><h1>{profile.displayName}</h1><p className="muted">@{profile.username}</p></div><button className="pill" disabled={busy} onClick={toggleFollow}>{busy?"Saving…":following?"Following":"Follow"}</button></div>{message&&<p className="muted">{message}</p>}{profile.bio&&<p>{profile.bio}</p>}<h2>Posts</h2>{posts.length===0?<div className="empty">No posts yet.</div>:<div className="feed">{posts.map(p=><article key={p.id}><p>{p.body}</p><div className="muted">{new Date(p.createdAt).toLocaleString()}</div></article>)}</div>}</main>;
}
