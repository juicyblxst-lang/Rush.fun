import {createClient,type SupabaseClient} from "@supabase/supabase-js";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabase:SupabaseClient=createClient(url??"https://placeholder.invalid",key??"placeholder-publishable-key",{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
export const supabaseConfigured=Boolean(url&&key);
