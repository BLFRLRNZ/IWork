package app.myturn;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Sveglie vere prima dei turni: AlarmManager.setAlarmClock (compaiono come sveglia di sistema),
 * all'ora giusta AlarmReceiver mostra la sveglia a tutto schermo con la suoneria delle sveglie.
 * La pagina manda ogni volta l'elenco completo; l'elenco resta salvato per rimetterle dopo un riavvio.
 */
public class ShiftAlarms {
    static final String PREFS = "myturn-alarms";
    static final String CHANNEL = "myturn_alarm";
    private static final int BASE = 2000, MAX = 40, SNOOZE = 2999;

    static boolean canExact(Context ctx) {
        if (Build.VERSION.SDK_INT < 31) return true;
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        return am.canScheduleExactAlarms();
    }

    static void channel(Context ctx) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = ctx.getSystemService(NotificationManager.class);
        if (nm.getNotificationChannel(CHANNEL) != null) return;
        NotificationChannel ch = new NotificationChannel(CHANNEL, "Sveglie MyTurn", NotificationManager.IMPORTANCE_HIGH);
        Uri sound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
        if (sound == null) sound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
        ch.setSound(sound, new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
        ch.enableVibration(true);
        ch.setVibrationPattern(new long[]{0, 800, 600, 800, 600, 800});
        ch.setBypassDnd(true);
        ch.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
        nm.createNotificationChannel(ch);
    }

    private static PendingIntent fire(Context ctx, int code, JSONObject it, String stop, String snooze) {
        Intent i = new Intent(ctx, AlarmReceiver.class).setAction(AlarmReceiver.ACTION_FIRE);
        i.putExtra("title", it.optString("title", "MyTurn"));
        i.putExtra("body", it.optString("body", ""));
        i.putExtra("stop", stop);
        i.putExtra("snooze", snooze);
        return PendingIntent.getBroadcast(ctx, code, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static PendingIntent show(Context ctx) {
        Intent i = new Intent(ctx, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        return PendingIntent.getActivity(ctx, 99, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** cancella le sveglie messe prima e mette quelle nuove; restituisce quante ne ha messe */
    static int replace(Context ctx, JSONArray items, String stop, String snooze) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        int old = p.getInt("count", 0);
        for (int i = 0; i < Math.max(old, MAX); i++) {
            Intent x = new Intent(ctx, AlarmReceiver.class).setAction(AlarmReceiver.ACTION_FIRE);
            PendingIntent pi = PendingIntent.getBroadcast(ctx, BASE + i, x, PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE);
            if (pi != null) { am.cancel(pi); pi.cancel(); }
        }
        p.edit().putString("items", items.toString()).putString("stop", stop).putString("snooze", snooze).apply();
        if (!canExact(ctx)) { p.edit().putInt("count", 0).apply(); return 0; }
        long now = System.currentTimeMillis();
        int n = 0;
        for (int i = 0; i < items.length() && n < MAX; i++) {
            JSONObject it = items.optJSONObject(i);
            if (it == null) continue;
            long at = it.optLong("at", 0);
            if (at < now + 30000) continue;
            am.setAlarmClock(new AlarmManager.AlarmClockInfo(at, show(ctx)), fire(ctx, BASE + n, it, stop, snooze));
            n++;
        }
        p.edit().putInt("count", n).apply();
        return n;
    }

    /** dopo un riavvio o un aggiornamento dell'app */
    static void restore(Context ctx) {
        SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        try {
            replace(ctx, new JSONArray(p.getString("items", "[]")), p.getString("stop", "Stop"), p.getString("snooze", "Snooze"));
        } catch (Exception e) { /* niente da rimettere */ }
    }

    /** posticipa di 10 minuti */
    static void snooze(Context ctx, Intent from) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        try {
            JSONObject it = new JSONObject();
            it.put("title", from.getStringExtra("title"));
            it.put("body", from.getStringExtra("body"));
            long at = System.currentTimeMillis() + 10 * 60000L;
            if (canExact(ctx)) am.setAlarmClock(new AlarmManager.AlarmClockInfo(at, show(ctx)),
                fire(ctx, SNOOZE, it, from.getStringExtra("stop"), from.getStringExtra("snooze")));
        } catch (Exception e) { /* niente */ }
    }
}
