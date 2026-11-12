package app.myturn;

import android.app.Activity;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.text.DateFormat;
import java.util.Date;

/** Schermata della sveglia, anche sopra la schermata di blocco: ora, turno, Ferma e Posticipa. */
public class AlarmActivity extends Activity {
    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        if (Build.VERSION.SDK_INT >= 27) { setShowWhenLocked(true); setTurnScreenOn(true); }
        else getWindow().addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        Intent in = getIntent();
        float dp = getResources().getDisplayMetrics().density;
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER);
        box.setBackgroundColor(Color.parseColor("#0a0b10"));
        box.setPadding((int) (28 * dp), (int) (28 * dp), (int) (28 * dp), (int) (28 * dp));
        TextView clock = text(DateFormat.getTimeInstance(DateFormat.SHORT).format(new Date()), 64, true, "#f3f4f8");
        TextView title = text(in.getStringExtra("title"), 24, true, "#ffe2a2");
        TextView body = text(in.getStringExtra("body"), 17, false, "#b7bed0");
        box.addView(clock); box.addView(title); box.addView(body);
        Button stop = button(in.getStringExtra("stop"), "#ffe8ad", "#553800");
        Button snooze = button(in.getStringExtra("snooze"), "#222632", "#f3f4f8");
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, (int) (58 * dp));
        lp.topMargin = (int) (14 * dp);
        LinearLayout.LayoutParams first = new LinearLayout.LayoutParams(lp);
        first.topMargin = (int) (48 * dp);
        box.addView(stop, first); box.addView(snooze, lp);
        stop.setOnClickListener(v -> { ((NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE)).cancel(AlarmReceiver.NOTIF); finish(); });
        snooze.setOnClickListener(v -> { ((NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE)).cancel(AlarmReceiver.NOTIF); ShiftAlarms.snooze(this, in); finish(); });
        setContentView(box);
    }

    private TextView text(String s, int sp, boolean bold, String color) {
        TextView t = new TextView(this);
        t.setText(s == null ? "" : s);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        t.setTextColor(Color.parseColor(color));
        t.setGravity(Gravity.CENTER);
        if (bold) t.setTypeface(t.getTypeface(), android.graphics.Typeface.BOLD);
        t.setPadding(0, (int) (6 * getResources().getDisplayMetrics().density), 0, 0);
        return t;
    }

    private Button button(String s, String bg, String fg) {
        Button b = new Button(this);
        b.setText(s == null ? "" : s);
        b.setAllCaps(false);
        b.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18);
        b.setTextColor(Color.parseColor(fg));
        GradientDrawable d = new GradientDrawable();
        d.setColor(Color.parseColor(bg));
        d.setCornerRadius(18 * getResources().getDisplayMetrics().density);
        b.setBackground(d);
        return b;
    }
}
