package app.myturn;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Riceve dalla pagina (wgSync in index.html) i prossimi 14 giorni già tradotti e aggiorna il widget. */
@CapacitorPlugin(name = "MyTurnNative")
public class MyTurnNativePlugin extends Plugin {
    @PluginMethod
    public void setData(PluginCall call) {
        String json = call.getString("json");
        if (json == null) { call.reject("json mancante"); return; }
        getContext().getSharedPreferences(ShiftWidget.PREFS, Context.MODE_PRIVATE).edit().putString(ShiftWidget.KEY, json).apply();
        ShiftWidget.updateAll(getContext());
        call.resolve();
    }

    // --- sveglie
    private String alarmStateValue() {
        Context ctx = getContext();
        if (!NotificationManagerCompat.from(ctx).areNotificationsEnabled()) {
            boolean asked = ctx.getSharedPreferences(ShiftAlarms.PREFS, Context.MODE_PRIVATE).getBoolean("askedNotif", false);
            return asked ? "denied" : "prompt";
        }
        return ShiftAlarms.canExact(ctx) ? "granted" : "prompt";
    }

    @PluginMethod
    public void alarmState(PluginCall call) {
        JSObject r = new JSObject();
        r.put("state", alarmStateValue());
        call.resolve(r);
    }

    /** chiede il permesso delle notifiche e, se serve, apre l'impostazione "Sveglie e promemoria" */
    @PluginMethod
    public void alarmRequest(PluginCall call) {
        Context ctx = getContext();
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            ctx.getSharedPreferences(ShiftAlarms.PREFS, Context.MODE_PRIVATE).edit().putBoolean("askedNotif", true).apply();
            ActivityCompat.requestPermissions(getActivity(), new String[]{Manifest.permission.POST_NOTIFICATIONS}, 4243);
        } else if (!ShiftAlarms.canExact(ctx) && Build.VERSION.SDK_INT >= 31) {
            Intent i = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:" + ctx.getPackageName()));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            ctx.startActivity(i);
        }
        JSObject r = new JSObject();
        r.put("state", alarmStateValue());
        call.resolve(r);
    }

    @PluginMethod
    public void setAlarms(PluginCall call) {
        JSArray items = call.getArray("items", new JSArray());
        int n = ShiftAlarms.replace(getContext(), items, call.getString("stop", "Stop"), call.getString("snooze", "Snooze"));
        JSObject r = new JSObject();
        r.put("scheduled", n);
        call.resolve(r);
    }
}
