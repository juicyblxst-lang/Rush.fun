import {ProviderUnavailable} from "../provider.js";
export class BitqueryClient{
 constructor(private readonly apiKey:string,private readonly endpoint="https://streaming.bitquery.io/graphql"){if(!apiKey)throw new ProviderUnavailable("stonkfun","BITQUERY_API_KEY is not configured");}
 async query<T>(query:string):Promise<T>{
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
  try{
   const res=await fetch(this.endpoint,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+this.apiKey},body:JSON.stringify({query}),signal:controller.signal});
   if(!res.ok)throw new ProviderUnavailable("stonkfun","Bitquery returned HTTP "+res.status);
   const body=await res.json() as {data?:T;errors?:Array<{message:string}>};
   if(body.errors?.length)throw new ProviderUnavailable("stonkfun",body.errors.map(e=>e.message).join("; "));
   if(!body.data)throw new ProviderUnavailable("stonkfun","Bitquery returned no data");
   return body.data;
  }catch(error){if(error instanceof DOMException&&error.name==="AbortError")throw new ProviderUnavailable("stonkfun","Bitquery request timed out");throw error;}
  finally{clearTimeout(timeout);}
 }
}