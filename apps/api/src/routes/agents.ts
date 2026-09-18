import type {FastifyInstance} from "fastify";import {getUser} from "../auth.js";import {getPersistedMarketContext,generateAndPersistMarketContext} from "../services/agent-service.js";
export async function agentRoutes(app:FastifyInstance){
 app.get("/v1/markets/:marketId/context",async(request)=>getPersistedMarketContext((request.params as {marketId:string}).marketId));
 app.post("/v1/markets/:marketId/context/refresh",async(request,reply)=>{const user=await getUser(request);if(!user)return reply.code(401).send({code:"AUTH_REQUIRED",message:"Sign in to refresh market context"});return generateAndPersistMarketContext((request.params as {marketId:string}).marketId);});
}