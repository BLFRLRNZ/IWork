// Manda i promemoria dei turni. La chiama il cron del database ogni minuto.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function config() {
  const { data, error } = await sb.from("app_config").select("k,v");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((r) => [r.k, r.v])) as Record<string, string>;
}

Deno.serve(async (req) => {
  const C = await config();
  if (!C.cron_secret || req.headers.get("x-cron-secret") !== C.cron_secret) return new Response("no", { status: 401 });
  webpush.setVapidDetails(C.vapid_subject, C.vapid_public, C.vapid_private);

  const { data: due, error } = await sb.rpc("due_reminders");
  if (error) return new Response(error.message, { status: 500 });
  let sent = 0, gone = 0;
  const subsOf = new Map<string, { id: number; endpoint: string; p256dh: string; auth: string }[]>();
  for (const r of due ?? []) {
    if (!subsOf.has(r.user_id)) {
      const { data } = await sb.from("push_subs").select("id,endpoint,p256dh,auth").eq("user_id", r.user_id);
      subsOf.set(r.user_id, data ?? []);
    }
    const payload = JSON.stringify({ title: r.title, body: r.body, tag: `${r.kind}-${r.start_at}`, url: "./" });
    for (const s of subsOf.get(r.user_id)!) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 3600, urgency: "high" });
        sent++;
        await sb.from("push_subs").update({ last_ok: new Date().toISOString() }).eq("id", s.id);
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) { await sb.from("push_subs").delete().eq("id", s.id); gone++; }
      }
    }
    await sb.from("shifts").update({ notified_at: new Date().toISOString() })
      .eq("user_id", r.user_id).eq("start_at", r.start_at).eq("kind", r.kind);
  }
  return Response.json({ due: due?.length ?? 0, sent, gone });
});
