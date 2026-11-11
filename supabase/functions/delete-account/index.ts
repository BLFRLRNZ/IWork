// Elimina l'account di chi lo chiede e, a cascata, tutti i suoi dati sul server.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
  const { data: u } = await sb.auth.getUser(jwt);
  if (!u?.user) return new Response("no", { status: 401, headers: CORS });
  const { error } = await sb.auth.admin.deleteUser(u.user.id);
  if (error) return new Response(error.message, { status: 500, headers: CORS });
  return Response.json({ deleted: true }, { headers: CORS });
});
