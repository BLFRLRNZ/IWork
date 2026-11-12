package app.myturn;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Dopo un riavvio (o un aggiornamento dell'app) Android dimentica le sveglie: le rimettiamo. */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context ctx, Intent in) {
        ShiftAlarms.restore(ctx);
        ShiftWidget.updateAll(ctx);
    }
}
