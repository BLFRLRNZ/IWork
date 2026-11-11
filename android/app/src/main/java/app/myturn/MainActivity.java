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
    }
}
