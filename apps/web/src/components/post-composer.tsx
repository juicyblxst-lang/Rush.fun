"use client";
import {useState} from "react";
import {supabase,supabaseConfigured} from "../lib/supabase";
import {api} from "../lib/api";
export function PostComposer({marketId,onCreated}:{marketId:string;onCreated:(post:import("@rush/types").Post)=>void}){
  const [body,setBody]=useState("");const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
  return <form className="card form" onSubmit={async e=>{
    e.preventDefault();setMessage("");
    if(!supabaseConfigured){setMessage("Authentication is not configured.");return;}
    const {data}=await supabase.auth.getSession();if(!data.session){setMessage("Sign in before posting.");return;}
    setBusy(true);
    try{const post=await api.createPost(data.session.access_token,{marketId,body});setBody("");setMessage("Posted.");onCreated(post);}
    catch(error){setMessage(error instanceof Error?error.message:"Could not publish post.");}
    finally{setBusy(false);}
  }}>
    <div><b>Share your take</b><p className="muted">Add an observation, question, or counterargument about this market.</p></div>
    <textarea value={body} onChange={e=>setBody(e.target.value)} minLength={1} maxLength={10000} rows={4} placeholder="What are you seeing?" required/>
    <div className="stat"><span className="muted">{body.length}/10000</span><button className="primary" disabled={busy||body.trim().length===0}>{busy?"Posting…":"Post"}</button></div>
    {message&&<span className="muted">{message}</span>}
  </form>;
}