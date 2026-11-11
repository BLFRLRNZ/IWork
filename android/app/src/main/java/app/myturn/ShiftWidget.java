package app.myturn;

import android.app.Activity;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.view.Gravity;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.RemoteViews;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;
import org.json.JSONArray;
import org.json.JSONObject;

/** Widget per la schermata Home: il turno di oggi e i prossimi giorni. */
public class ShiftWidget extends AppWidgetProvider {
    static final String PREFS = "myturn-widget";
    static final String KEY = "data";
    private static final int[][] ROWS = {
        {R.id.r0, R.id.r0_day, R.id.r0_dot, R.id.r0_title, R.id.r0_time},
        {R.id.r1, R.id.r1_day, R.id.r1_dot, R.id.r1_title, R.id.r1_time},
        {R.id.r2, R.id.r2_day, R.id.r2_dot, R.id.r2_title, R.id.r2_time},
        {R.id.r3, R.id.r3_day, R.id.r3_dot, R.id.r3_title, R.id.r3_time}};

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

    private static String key(Calendar c) {
        SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
        return f.format(c.getTime());
    }

    private static int color(String hex) {
        try { return Color.parseColor(hex); } catch (Exception e) { return Color.GRAY; }
    }

    private static String start(JSONObject d) {
        String h = d.optString("h", "");
        return h.length() >= 5 ? h.substring(0, 5) : h;
    }

    static RemoteViews build(Context ctx, JSONObject data) {
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.myturn_widget);
        Intent open = new Intent(ctx, MainActivity.class);
        v.setOnClickPendingIntent(R.id.widget_root, PendingIntent.getActivity(ctx, 0, open,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        JSONArray days = data == null ? null : data.optJSONArray("days");
        JSONObject s = data == null ? null : data.optJSONObject("s");
        // dal giorno di oggi in avanti
        String today = key(Calendar.getInstance());
        int first = -1;
        if (days != null) for (int i = 0; i < days.length(); i++) {
            if (days.optJSONObject(i).optString("d").compareTo(today) >= 0) { first = i; break; }
        }
        if (first < 0 || s == null) {
            v.setTextViewText(R.id.today_label, "MyTurn");
            v.setTextViewText(R.id.today_title, ctx.getString(R.string.widget_open));
            v.setTextViewText(R.id.today_hours, "");
            v.setTextViewText(R.id.today_extra, "");
            v.setInt(R.id.today_bar, "setBackgroundColor", Color.TRANSPARENT);
            for (int[] r : ROWS) v.setViewVisibility(r[0], View.GONE);
            return v;
        }
        JSONObject d0 = days.optJSONObject(first);
        v.setTextViewText(R.id.today_label, (s.optString("today") + " · " + d0.optString("wd") + " " + d0.optString("dn")).toUpperCase(Locale.getDefault()));
        v.setTextViewText(R.id.today_title, d0.optString("t"));
        v.setTextViewText(R.id.today_hours, d0.optString("h"));
        v.setViewVisibility(R.id.today_hours, d0.optString("h").isEmpty() ? View.GONE : View.VISIBLE);
        v.setTextViewText(R.id.today_extra, d0.optString("x", ""));
        v.setViewVisibility(R.id.today_extra, d0.optString("x", "").isEmpty() ? View.GONE : View.VISIBLE);
        v.setInt(R.id.today_bar, "setBackgroundColor", color(d0.optString("c")));
        for (int r = 0; r < ROWS.length; r++) {
            int[] id = ROWS[r];
            JSONObject d = days.optJSONObject(first + 1 + r);
            if (d == null) { v.setViewVisibility(id[0], View.GONE); continue; }
            v.setViewVisibility(id[0], View.VISIBLE);
            v.setTextViewText(id[1], (r == 0 ? s.optString("tomorrow") : d.optString("wd") + " " + d.optString("dn")));
            v.setTextColor(id[2], color(d.optString("c")));
            v.setTextViewText(id[3], d.optString("t"));
            v.setTextViewText(id[4], start(d));
        }
        return v;
    }

    /** Anteprima per le prove automatiche (solo nelle versioni di prova): il widget al centro dello schermo. */
    static void showPreview(Activity a) {
        JSONObject data = load(a);
        if (data == null) data = demo();
        RemoteViews rv = build(a, data);
        FrameLayout box = new FrameLayout(a);
        box.setBackgroundColor(Color.parseColor("#5b6b8c"));
        View w = rv.apply(a, box);
        float dp = a.getResources().getDisplayMetrics().density;
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams((int) (340 * dp), (int) (190 * dp), Gravity.CENTER);
        box.addView(w, lp);
        a.setContentView(box);
    }

    private static JSONObject demo() {
        try {
            String[][] plan = {
                {"w", "Mattina", "06:00–14:00", "#f2a900"}, {"w", "Mattina", "06:00–14:00", "#f2a900"},
                {"w", "Pomeriggio", "14:00–22:00", "#ff6b3d"}, {"r", "Riposo", "", "#9aa1b2"},
                {"w", "Notte", "22:00–06:00", "#6a6ff5"}, {"f", "Ferie", "", "#22b062"}};
            JSONArray days = new JSONArray();
            Calendar c = Calendar.getInstance();
            SimpleDateFormat wd = new SimpleDateFormat("EEE", Locale.ITALIAN);
            for (int i = 0; i < 14; i++) {
                String[] p = plan[i % plan.length];
                JSONObject d = new JSONObject();
                d.put("d", key(c)); d.put("wd", wd.format(c.getTime())); d.put("dn", String.valueOf(c.get(Calendar.DAY_OF_MONTH)));
                d.put("k", p[0]); d.put("t", p[1]); d.put("h", p[2]); d.put("c", p[3]);
                if (i == 0) d.put("x", "Reperibilità 20:00–08:00");
                days.put(d);
                c.add(Calendar.DAY_OF_MONTH, 1);
            }
            JSONObject s = new JSONObject();
            s.put("today", "Oggi"); s.put("tomorrow", "Domani"); s.put("next", "Prossimo turno"); s.put("free", "Libero"); s.put("app", "MyTurn");
            JSONObject o = new JSONObject();
            o.put("v", 1); o.put("days", days); o.put("s", s);
            return o;
        } catch (Exception e) { return null; }
    }
}
