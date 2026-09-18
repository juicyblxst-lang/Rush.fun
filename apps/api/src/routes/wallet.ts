import type {FastifyInstance} from "fastify";
import {z} from "zod";
import {getUser} from "../auth.js";
import {createWalletChallenge,linkWallet} from "../services/wallet-service.js";

const address=z.string().regex(/^0x[a-fA-F0-9]{40}$/);

export async function walletRoutes(app:FastifyInstance){
  app.post("/v1/wallet/challenge",async(request,reply)=>{
    const user=await getUser(request);
    if(!user)return reply.code(401).send({code:"AUTH_REQUIRED",message:"Sign in before linking a wallet"});
    const parsed=z.object({address,chain:z.literal("base")}).safeParse(request.body);
    if(!parsed.success)return reply.code(400).send({code:"VALIDATION",message:parsed.error.message});
    return createWalletChallenge(user.id,parsed.data.address,parsed.data.chain);
  });
  app.post("/v1/wallet",async(request,reply)=>{
    const user=await getUser(request);
    if(!user)return reply.code(401).send({code:"AUTH_REQUIRED",message:"Sign in before linking a wallet"});
    const parsed=z.object({
      address,chain:z.literal("base"),challengeId:z.string().uuid(),message:z.string().min(1).max(500),
      signature:z.string().regex(/^0x[0-9a-fA-F]+$/)
    }).safeParse(request.body);
    if(!parsed.success)return reply.code(400).send({code:"VALIDATION",message:parsed.error.message});
    return linkWallet(user.id,parsed.data.address,parsed.data.chain,parsed.data.challengeId,parsed.data.message,parsed.data.signature as `0x${string}`);
  });
}
