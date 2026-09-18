import type {FastifyInstance} from "fastify";
import {getUser} from "../auth.js";
import {getProfileView} from "../services/profile-service.js";
export async function profileRoutes(app:FastifyInstance){
  app.get("/v1/profiles/:username",async(request,reply)=>{
    const user=await getUser(request);
    const result=await getProfileView((request.params as {username:string}).username,user?.id);
    if(!result)return reply.code(404).send({code:"NOT_FOUND",message:"Profile not found"});
    return result;
  });
}