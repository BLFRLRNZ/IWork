// Notifica di prova per l'utente che la chiede (dalla scheda Promemoria).
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
  const { data: u } = await sb.auth.getUser(jwt);
  if (!u?.user) return new Response("no", { status: 401, headers: CORS });
  const { title = "MyTurn", body = "" } = await req.json().catch(() => ({}));
  const { data: cfg } = await sb.from("app_config").select("k,v");
  const C = Object.fromEntries((cfg ?? []).map((r) => [r.k, r.v])) as Record<string, string>;
  webpush.setVapidDetails(C.vapid_subject, C.vapid_public, C.vapid_private);
  const { data: subs } = await sb.from("push_subs").select("id,endpoint,p256dh,auth").eq("user_id", u.user.id);
  let sent = 0;
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({ title: String(title).slice(0, 120), body: String(body).slice(0, 240), tag: "test", url: "./" }), { TTL: 600, urgency: "high" });
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) await sb.from("push_subs").delete().eq("id", s.id);
    }
  }
  return Response.json({ sent, devices: subs?.length ?? 0 }, { headers: CORS });
});
