package app.myturn;

import android.content.Context;
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
}
