"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import type {Thesis} from "@rush/types";
import {api} from "../../../lib/api";
import {ReactionButton} from "../../../components/reaction-button";
import {CommentThread} from "../../../components/comment-thread";
export default function ThesisPage({params}:{params:Promise<{thesisId:string}>}){
 const [thesis,setThesis]=useState<Thesis|null>(null);const [error,setError]=useState("");
 useEffect(()=>{params.then(p=>api.thesis(p.thesisId).then(setThesis).catch(e=>setError(e instanceof Error?e.message:"Thesis not found.")));},[params]);
 if(error)return <main className="page"><div className="empty">{error}</div></main>;
 if(!thesis)return <main className="page"><div className="empty">Loading thesis…</div></main>;
 return <main className="page"><div className="eyebrow">{thesis.stance} thesis</div><h1>{thesis.title}</h1><p className="muted">By <Link href={"/profile/"+thesis.author.username}>@{thesis.author.username}</Link> · {new Date(thesis.createdAt).toLocaleString()}</p><div className="card"><p>{thesis.body}</p></div><div className="stat"><span>{thesis.reactions} likes</span><span>{thesis.comments} comments</span></div><ReactionButton targetType="thesis" targetId={thesis.id} initialCount={thesis.reactions}/><section><h2>Discussion</h2><CommentThread targetType="thesis" targetId={thesis.id}/></section><Link className="pill" href={"/markets/"+encodeURIComponent(thesis.marketId)}>Back to market</Link></main>;
}