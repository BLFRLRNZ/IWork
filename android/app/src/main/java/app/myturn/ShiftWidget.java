package app.myturn;

import android.app.Activity;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.res.ColorStateList;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.SystemClock;
import android.view.Gravity;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.RemoteViews;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Widget per la schermata Home, con i colori del calendario dell'app:
 * sopra il turno in corso o il prossimo (orari, barra, conto alla rovescia), sotto i prossimi 7 giorni.
 * Toccando un giorno si apre l'app su quel giorno (myturn://day/AAAA-MM-GG).
 */
public class ShiftWidget extends AppWidgetProvider {
    static final String PREFS = "myturn-widget";
    static final String KEY = "data";

    private static final int[][] TILES = {
        {R.id.t0, R.id.t0_bg, R.id.t0_ring, R.id.t0_wd, R.id.t0_dn, R.id.t0_tm},
        {R.id.t1, R.id.t1_bg, R.id.t1_ring, R.id.t1_wd, R.id.t1_dn, R.id.t1_tm},
        {R.id.t2, R.id.t2_bg, R.id.t2_ring, R.id.t2_wd, R.id.t2_dn, R.id.t2_tm},
        {R.id.t3, R.id.t3_bg, R.id.t3_ring, R.id.t3_wd, R.id.t3_dn, R.id.t3_tm},
        {R.id.t4, R.id.t4_bg, R.id.t4_ring, R.id.t4_wd, R.id.t4_dn, R.id.t4_tm},
        {R.id.t5, R.id.t5_bg, R.id.t5_ring, R.id.t5_wd, R.id.t5_dn, R.id.t5_tm},
        {R.id.t6, R.id.t6_bg, R.id.t6_ring, R.id.t6_wd, R.id.t6_dn, R.id.t6_tm}};

    // colori di index.html: {sfondo, testo} per tono, chiaro e scuro
    private static final Map<String, String[]> LIGHT = new HashMap<>();
    private static final Map<String, String[]> DARK = new HashMap<>();
    static {
        LIGHT.put("m", new String[]{"#ffe8ad", "#553800"}); DARK.put("m", new String[]{"#4d3a08", "#ffe2a2"});
        LIGHT.put("p", new String[]{"#ffd2c0", "#6b2407"}); DARK.put("p", new String[]{"#572712", "#ffd0ba"});
        LIGHT.put("n", new String[]{"#d9dbff", "#24256e"}); DARK.put("n", new String[]{"#27296e", "#d7d9ff"});
        LIGHT.put("f", new String[]{"#cbf1d8", "#0c4927"}); DARK.put("f", new String[]{"#0f4427", "#c0f1d0"});
        LIGHT.put("x", new String[]{"#e4e7ee", "#4a5267"}); DARK.put("x", new String[]{"#222632", "#b7bed0"});
    }

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        RemoteViews v = build(ctx, load(ctx));
        for (int id : ids) mgr.updateAppWidget(id, v);
    }

    static void updateAll(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, ShiftWidget.class));
        if (ids.length == 0) return;
        RemoteViews v = build(ctx, load(ctx));
        for (int id : ids) mgr.updateAppWidget(id, v);
    }

    private static JSONObject load(Context ctx) {
        try {
            String s = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, null);
            return s == null ? null : new JSONObject(s);
        } catch (Exception e) { return null; }
    }

    private static String key(Calendar c) { return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(c.getTime()); }
    private static int col(String hex) { try { return Color.parseColor(hex); } catch (Exception e) { return Color.GRAY; } }
    private static boolean dark(Context ctx) {
        return (ctx.getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
    }
    private static String[] tone(String t, boolean dark) {
        String[] c = (dark ? DARK : LIGHT).get(t == null || t.isEmpty() ? "x" : t);
        return c == null ? (dark ? DARK : LIGHT).get("x") : c;
    }
    private static String startOf(JSONObject d) { String h = d.optString("h", ""); return "w".equals(d.optString("k")) && h.length() >= 5 ? h.substring(0, 5) : ""; }
    private static String endOf(JSONObject d) { String h = d.optString("h", ""); return "w".equals(d.optString("k")) && h.length() >= 5 ? h.substring(h.length() - 5) : ""; }

    private static PendingIntent open(Context ctx, String day, int code) {
        Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(day == null ? "myturn://" : "myturn://day/" + day), ctx, MainActivity.class);
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(ctx, code, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static RemoteViews build(Context ctx, JSONObject data) {
        boolean dk = dark(ctx);
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.myturn_widget);
        v.setOnClickPendingIntent(R.id.widget_root, open(ctx, null, 100));
        JSONArray days = data == null ? null : data.optJSONArray("days");
        JSONObject s = data == null ? null : data.optJSONObject("s");
        String today = key(Calendar.getInstance());
        Calendar tc = Calendar.getInstance(); tc.add(Calendar.DAY_OF_MONTH, 1);
        String tomorrow = key(tc);
        int first = -1;
        if (days != null) for (int i = 0; i < days.length(); i++) {
            if (days.optJSONObject(i).optString("d").compareTo(today) >= 0) { first = i; break; }
        }
        String[] neutral = tone("x", dk);
        if (first < 0 || s == null) {
            v.setInt(R.id.hero_bg, "setColorFilter", col(neutral[0]));
            text(v, R.id.hero_eyebrow, "MyTurn", col(neutral[1]));
            text(v, R.id.hero_title, ctx.getString(R.string.widget_open), col(neutral[1]));
            v.setTextViewText(R.id.hero_hours, "");
            v.setViewVisibility(R.id.hero_count, View.GONE);
            v.setViewVisibility(R.id.strip, View.GONE);
            return v;
        }
        v.setViewVisibility(R.id.strip, View.VISIBLE);

        // turno in corso o prossimo
        long now = System.currentTimeMillis();
        JSONObject cur = null, nxt = null;
        for (int i = 0; i < days.length(); i++) {
            JSONObject d = days.optJSONObject(i);
            if (!"w".equals(d.optString("k"))) continue;
            long a = d.optLong("s", 0), b = d.optLong("e", 0);
            if (a <= now && now < b) { cur = d; break; }
            if (a > now) { nxt = d; break; }
        }
        JSONObject f = cur != null ? cur : nxt;
        String[] ft = tone(f == null ? "x" : f.optString("tn", "m"), dk);
        int fg = col(ft[1]);
        v.setInt(R.id.hero_bg, "setColorFilter", col(ft[0]));
        v.setOnClickPendingIntent(R.id.hero, open(ctx, f == null ? today : f.optString("d"), 101));
        if (f == null) {
            text(v, R.id.hero_eyebrow, s.optString("next").toUpperCase(Locale.getDefault()), fg);
            text(v, R.id.hero_title, s.optString("none", "—"), fg);
            v.setTextViewText(R.id.hero_hours, "");
            v.setViewVisibility(R.id.hero_progress, View.GONE);
            v.setViewVisibility(R.id.hero_count, View.GONE);
        } else {
            String fd = f.optString("d");
            String label = cur != null ? s.optString("now", s.optString("next"))
                : fd.equals(today) ? s.optString("today") : fd.equals(tomorrow) ? s.optString("tomorrow")
                : f.optString("wd") + " " + f.optString("dn");
            text(v, R.id.hero_eyebrow, label.toUpperCase(Locale.getDefault()), (fg & 0x00ffffff) | 0xC8000000);
            text(v, R.id.hero_title, f.optString("t"), fg);
            String h = f.optString("h");
            text(v, R.id.hero_hours, h.contains("·") ? h : startOf(f) + " → " + endOf(f), fg);
            long a = f.optLong("s", 0), b = f.optLong("e", 0);
            if (cur != null && b > a) {
                v.setViewVisibility(R.id.hero_progress, View.VISIBLE);
                v.setProgressBar(R.id.hero_progress, 1000, (int) (1000 * (now - a) / (b - a)), false);
                if (Build.VERSION.SDK_INT >= 31) {
                    v.setColorStateList(R.id.hero_progress, "setProgressTintList", ColorStateList.valueOf(fg));
                    v.setColorStateList(R.id.hero_progress, "setProgressBackgroundTintList", ColorStateList.valueOf((fg & 0x00ffffff) | 0x38000000));
                }
            } else {
                v.setViewVisibility(R.id.hero_progress, View.GONE);
            }
            // conto alla rovescia: il sistema lo aggiorna da solo ogni secondo
            long target = cur != null ? b : a;
            String tpl = s.optString(cur != null ? "ends" : "starts", "{x}").replace("%", "%%").replace("{x}", "%s");
            v.setViewVisibility(R.id.hero_count, View.VISIBLE);
            v.setTextColor(R.id.hero_count, fg);
            v.setChronometer(R.id.hero_count, SystemClock.elapsedRealtime() + (target - now), tpl, true);
            v.setChronometerCountDown(R.id.hero_count, true);
            schedule(ctx, target + 1000);
        }

        // i prossimi 7 giorni
        String ink = dk ? "#f3f4f8" : "#0d0f14", muted = dk ? "#8e95a8" : "#676e80", sunken = dk ? "#1d2029" : "#f1f2f6";
        for (int r = 0; r < TILES.length; r++) {
            int[] id = TILES[r];
            JSONObject d = days.optJSONObject(first + r);
            if (d == null) { v.setViewVisibility(id[0], View.INVISIBLE); continue; }
            v.setViewVisibility(id[0], View.VISIBLE);
            boolean filled = !d.optString("k").isEmpty();
            String[] t = tone(d.optString("tn", "x"), dk);
            int tfg = filled ? col(t[1]) : col(muted);
            v.setInt(id[1], "setColorFilter", col(filled ? t[0] : sunken));
            v.setViewVisibility(id[2], d.optString("d").equals(today) ? View.VISIBLE : View.GONE);
            String wd = d.optString("wd");
            wd = wd.length() > 3 ? wd.substring(0, 3) : wd;
            if (!wd.isEmpty()) wd = wd.substring(0, 1).toUpperCase(Locale.getDefault()) + wd.substring(1);
            text(v, id[3], wd, tfg);
            text(v, id[4], d.optString("dn"), d.optInt("ho", 0) == 1 ? col(dk ? "#ff8a7e" : "#cf3a2f") : (filled ? tfg : col(ink)));
            String tm = "w".equals(d.optString("k")) ? startOf(d) : filled ? first3(d.optString("t")) : "·";
            text(v, id[5], tm, tfg);
            v.setOnClickPendingIntent(id[0], open(ctx, d.optString("d"), 110 + r));
        }
        return v;
    }

    private static String first3(String s) { return s.length() > 3 ? s.substring(0, 3) : s; }

    private static void text(RemoteViews v, int id, String s, int color) {
        v.setTextViewText(id, s);
        v.setTextColor(id, color);
    }

    /** aggiorna il widget quando il turno inizia o finisce (passa da "prossimo" a "in corso" e poi al successivo) */
    private static void schedule(Context ctx, long at) {
        try {
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            Intent i = new Intent(ctx, ShiftWidget.class).setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            i.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS,
                AppWidgetManager.getInstance(ctx).getAppWidgetIds(new ComponentName(ctx, ShiftWidget.class)));
            PendingIntent pi = PendingIntent.getBroadcast(ctx, 7, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            am.set(AlarmManager.RTC, at, pi);
        } catch (Exception e) { /* il widget si aggiorna comunque ogni 30 minuti */ }
    }

    /** Anteprima per le prove automatiche (solo nelle versioni di prova): il widget al centro dello schermo. */
    static void showPreview(Activity a) {
        JSONObject data = load(a);
        if (data == null || !data.toString().contains("\"k\":\"w\"")) data = demo();
        RemoteViews rv = build(a, data);
        FrameLayout box = new FrameLayout(a);
        box.setBackgroundColor(Color.parseColor("#5b6b8c"));
        View w = rv.apply(a, box);
        float dp = a.getResources().getDisplayMetrics().density;
        box.addView(w, new FrameLayout.LayoutParams((int) (350 * dp), (int) (190 * dp), Gravity.CENTER));
        a.setContentView(box);
    }

    private static JSONObject demo() {
        try {
            Object[][] plan = {
                {"w", "Mattina", "m", 6, 14}, {"w", "Mattina", "m", 6, 14}, {"w", "Pomeriggio", "p", 14, 22},
                {"r", "Riposo", "x", 0, 0}, {"w", "Notte", "n", 22, 30}, {"w", "Notte", "n", 22, 30},
                {"r", "Riposo", "x", 0, 0}, {"f", "Ferie", "f", 0, 0}};
            JSONArray days = new JSONArray();
            Calendar c = Calendar.getInstance();
            c.set(Calendar.HOUR_OF_DAY, 0); c.set(Calendar.MINUTE, 0); c.set(Calendar.SECOND, 0); c.set(Calendar.MILLISECOND, 0);
            SimpleDateFormat wd = new SimpleDateFormat("EEE", Locale.ITALIAN);
            for (int i = 0; i < 14; i++) {
                Object[] p = plan[i % plan.length];
                JSONObject d = new JSONObject();
                d.put("d", key(c)); d.put("wd", wd.format(c.getTime())); d.put("dn", String.valueOf(c.get(Calendar.DAY_OF_MONTH)));
                d.put("k", p[0]); d.put("t", p[1]); d.put("tn", p[2]);
                if ("w".equals(p[0])) {
                    int a = (Integer) p[3], b = (Integer) p[4];
                    d.put("h", String.format(Locale.US, "%02d:00–%02d:00", a, b % 24));
                    d.put("s", c.getTimeInMillis() + a * 3600000L); d.put("e", c.getTimeInMillis() + b * 3600000L);
                } else d.put("h", "");
                if (i == 9) d.put("ho", 1);
                days.put(d);
                c.add(Calendar.DAY_OF_MONTH, 1);
            }
            JSONObject s = new JSONObject();
            s.put("today", "Oggi"); s.put("tomorrow", "Domani"); s.put("next", "Prossimo turno"); s.put("free", "Libero");
            s.put("app", "MyTurn"); s.put("now", "In turno adesso"); s.put("none", "Nessun turno in programma");
            s.put("starts", "Inizia tra {x}"); s.put("ends", "Finisce tra {x}");
            JSONObject o = new JSONObject();
            o.put("v", 1); o.put("days", days); o.put("s", s);
            return o;
        } catch (Exception e) { return null; }
    }
}
