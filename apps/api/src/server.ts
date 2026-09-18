import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import {apiConfig} from "@rush/config";
import {AppError} from "./lib/errors.js";
import {marketRoutes} from "./routes/markets.js";
import {thesisRoutes} from "./routes/theses.js";
import {socialRoutes} from "./routes/social.js";
import {walletRoutes} from "./routes/wallet.js";
import {profileRoutes} from "./routes/profiles.js";
import {activityRoutes} from "./routes/activity.js";
import {agentRoutes} from "./routes/agents.js";
import {interactionRoutes} from "./routes/interactions.js";

export function buildServer(){
  const app=Fastify({logger:true,bodyLimit:1024*1024});
  app.register(helmet);
  app.register(cors,{origin:apiConfig.corsOrigin,credentials:true});
  app.register(rateLimit,{max:120,timeWindow:"1 minute",allowList:["127.0.0.1","::1"]});
  app.register(sensible);
  app.get("/health",async()=>({status:"ok",service:"rush-api",time:new Date().toISOString()}));
  app.register(marketRoutes);
  app.register(thesisRoutes);
  app.register(socialRoutes);
  app.register(walletRoutes);
  app.register(profileRoutes);
  app.register(activityRoutes);
  app.register(agentRoutes);
  app.register(interactionRoutes);
  app.setErrorHandler((error,request,reply)=>{
    request.log.error(error);
    const appError=error instanceof AppError?error:null;
    const status=(error as {statusCode?:number}).statusCode;
    const message=appError?.message??(status&&status<500?error.message:"Internal server error");
    reply.code(appError?.statusCode??status??500).send({code:appError?.code??(status&&status<500?"REQUEST_ERROR":"INTERNAL_ERROR"),message});
  });
  return app;
}
const isMain=process.argv[1]?.endsWith("/server.js");
if(isMain){
  const app=buildServer();
  app.listen({port:apiConfig.port,host:"0.0.0.0"}).catch(error=>{app.log.error(error);process.exit(1);});
}
