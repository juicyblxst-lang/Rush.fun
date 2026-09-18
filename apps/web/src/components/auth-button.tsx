"use client";
import {useEffect,useState} from "react";import {supabase,supabaseConfigured} from "../lib/supabase";
export function AuthButton(){
 const [email,setEmail]=useState("");const [session,setSession]=useState<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>(null);const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
 useEffect(()=>{if(!supabaseConfigured)return;supabase.auth.getSession().then(({data})=>setSession(data.session));const {data}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));return()=>data.subscription.unsubscribe();},[]);
 if(!supabaseConfigured)return <span className="muted">Sign-in is unavailable until Supabase is configured.</span>;
 if(session)return <button className="pill" onClick={async()=>{setBusy(true);const {error}=await supabase.auth.signOut();setMessage(error?.message??"");setBusy(false);}} disabled={busy}>{busy?"Signing out…":"Sign out"}</button>;
 return <form onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage("");const {error}=await supabase.auth.signInWithOtp({email});if(error)setMessage(error.message);else{setEmail("");setMessage("Check your email for the sign-in link.");}setBusy(false);}}><input className="input" type="email" required placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} disabled={busy}/><button className="pill" type="submit" disabled={busy}>{busy?"Sending…":"Sign in"}</button>{message&&<span className="muted">{message}</span>}</form>;
}