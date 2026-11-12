package app.myturn;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import androidx.core.app.NotificationCompat;

/** All'ora della sveglia: notifica a tutto schermo che suona finché non la fermi; pulsanti Ferma e Posticipa. */
public class AlarmReceiver extends BroadcastReceiver {
    static final String ACTION_FIRE = "app.myturn.ALARM_FIRE";
    static final String ACTION_STOP = "app.myturn.ALARM_STOP";
    static final String ACTION_SNOOZE = "app.myturn.ALARM_SNOOZE";
    static final int NOTIF = 4242;

    @Override
    public void onReceive(Context ctx, Intent in) {
        String a = in.getAction();
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (ACTION_STOP.equals(a)) { nm.cancel(NOTIF); return; }
        if (ACTION_SNOOZE.equals(a)) { nm.cancel(NOTIF); ShiftAlarms.snooze(ctx, in); return; }
        if (!ACTION_FIRE.equals(a)) return;
        show(ctx, in);
    }

    static void show(Context ctx, Intent in) {
        ShiftAlarms.channel(ctx);
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        String title = in.getStringExtra("title"), body = in.getStringExtra("body");
        String stop = in.getStringExtra("stop"), snooze = in.getStringExtra("snooze");
        Intent full = new Intent(ctx, AlarmActivity.class).putExtras(in).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_NO_USER_ACTION);
        PendingIntent fullPi = PendingIntent.getActivity(ctx, 1, full, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification n = new NotificationCompat.Builder(ctx, ShiftAlarms.CHANNEL)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title == null ? "MyTurn" : title)
            .setContentText(body == null ? "" : body)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true)
            .setAutoCancel(false)
            .setFullScreenIntent(fullPi, true)
            .setContentIntent(fullPi)
            .addAction(0, stop == null ? "Stop" : stop, action(ctx, ACTION_STOP, in, 2))
            .addAction(0, snooze == null ? "Snooze" : snooze, action(ctx, ACTION_SNOOZE, in, 3))
            .build();
        n.flags |= Notification.FLAG_INSISTENT; // la suoneria si ripete finché la sveglia non viene fermata
        nm.notify(NOTIF, n);
    }

    static PendingIntent action(Context ctx, String act, Intent from, int code) {
        Intent i = new Intent(ctx, AlarmReceiver.class).setAction(act).putExtras(from);
        return PendingIntent.getBroadcast(ctx, code, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
