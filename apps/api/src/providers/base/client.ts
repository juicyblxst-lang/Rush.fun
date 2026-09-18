export class GeckoTerminalClient{
 constructor(private readonly baseUrl:string){}
 async get<T>(path:string):Promise<T>{
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);
  try{
   for(let attempt=0;attempt<3;attempt++){
    const res=await fetch(this.baseUrl.replace(/\/$/,"")+path,{headers:{Accept:"application/json;version=20230203"},signal:controller.signal});
    if(res.ok)return await res.json() as T;
    const retryable=res.status===429||res.status>=500;
    if(!retryable||attempt===2)throw new Error("GeckoTerminal HTTP "+res.status);
    const retryAfter=Number(res.headers.get("retry-after")??"1");await new Promise(resolve=>setTimeout(resolve,Math.min(Math.max(retryAfter,1),5)*1000));
   }
   throw new Error("GeckoTerminal request failed");
  }catch(error){if(error instanceof DOMException&&error.name==="AbortError")throw new Error("GeckoTerminal request timed out");throw error;}
  finally{clearTimeout(timeout);}
 }
}