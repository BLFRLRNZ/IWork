package app.myturn;

import android.content.pm.ApplicationInfo;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // plugin dell'app (non è un pacchetto npm): passa i turni al widget
        registerPlugin(MyTurnNativePlugin.class);
        super.onCreate(savedInstanceState);
        // solo per le prove automatiche: mostra l'anteprima del widget con dati di prova
        if ((getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0
                && getIntent().getBooleanExtra("widgetPreview", false)) {
            ShiftWidget.showPreview(this);
        }
        // solo per le prove automatiche: la sveglia come la vede chi la riceve
        if ((getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0
                && getIntent().getBooleanExtra("alarmPreview", false)) {
            android.content.Intent a = new android.content.Intent().putExtra("title", "Mattina alle 06:00")
                .putExtra("body", "Turno alle 06:00").putExtra("stop", "Ferma").putExtra("snooze", "Posticipa");
            AlarmReceiver.show(this, a);
            startActivity(new android.content.Intent(this, AlarmActivity.class).putExtras(a));
        }
    }
}
