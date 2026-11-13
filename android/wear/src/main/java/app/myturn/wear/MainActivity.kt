package app.myturn.wear

import android.content.pm.ApplicationInfo
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.PositionIndicator
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import androidx.wear.compose.material.Vignette
import androidx.wear.compose.material.VignettePosition
import com.google.android.gms.wearable.DataClient
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.delay

/** App per l'orologio: in alto il turno in corso o il prossimo, sotto i giorni seguenti con i colori del calendario. */
class MainActivity : ComponentActivity(), DataClient.OnDataChangedListener {
    private var data by mutableStateOf<ShiftData?>(null)
    private var demo = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // solo per le prove automatiche: dati di prova, anche per riquadro e complicazione
        demo = intent.getBooleanExtra("demo", false) && (applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0
        if (demo) { ShiftStore.save(this, ShiftStore.demoJson()); ShiftStore.refresh(this) }
        data = ShiftStore.load(this)
        setContent { WatchApp(data) }
    }

    override fun onResume() {
        super.onResume()
        if (demo) return
        try {
            val client = Wearable.getDataClient(this)
            client.addListener(this)
            // all'apertura legge l'ultimo invio del telefono, nel caso fosse arrivato con l'app chiusa
            client.dataItems.addOnSuccessListener { buf ->
                for (item in buf) if (item.uri.path == ShiftStore.PATH) ShiftStore.saveFrom(this, item)
                buf.release()
                data = ShiftStore.load(this)
            }
        } catch (e: Exception) { }
    }

    override fun onPause() {
        super.onPause()
        try { Wearable.getDataClient(this).removeListener(this) } catch (e: Exception) { }
    }

    override fun onDataChanged(events: DataEventBuffer) {
        for (ev in events) {
            if (ev.type == DataEvent.TYPE_CHANGED && ev.dataItem.uri.path == ShiftStore.PATH) ShiftStore.saveFrom(this, ev.dataItem)
        }
        data = ShiftStore.load(this)
    }
}

@Composable
fun WatchApp(data: ShiftData?) {
    MaterialTheme {
        val state = rememberScalingLazyListState()
        var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
        LaunchedEffect(Unit) {
            while (true) {
                delay(60_000L - System.currentTimeMillis() % 60_000L)
                now = System.currentTimeMillis()
            }
        }
        Scaffold(
            timeText = { TimeText() },
            vignette = { Vignette(vignettePosition = VignettePosition.TopAndBottom) },
            positionIndicator = { PositionIndicator(scalingLazyListState = state) },
        ) {
            if (data == null || data.days.isEmpty()) {
                Empty()
            } else {
                val f = data.focus(now)
                val today = ShiftStore.key(now)
                val rest = data.from(now).filter { it.d != f.day?.d }.take(13)
                ScalingLazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    state = state,
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 30.dp),
                    verticalArrangement = Arrangement.spacedBy(5.dp),
                ) {
                    item { Hero(data, f, now) }
                    items(rest) { day -> DayRow(data, day, today) }
                }
            }
        }
    }
}

/** il turno in corso o il prossimo: orari, barra di avanzamento e conto alla rovescia */
@Composable
fun Hero(data: ShiftData, f: Focus, now: Long) {
    val tone = Palette.of(f.day?.tn)
    val fg = tone.fg
    Column(
        Modifier.fillMaxWidth()
            .background(tone.bg, RoundedCornerShape(24.dp))
            .padding(horizontal = 16.dp, vertical = 11.dp),
    ) {
        Text(
            data.label(f, now).uppercase(data.locale), color = fg.copy(alpha = 0.8f),
            fontSize = 11.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis,
        )
        val d = f.day
        if (d == null) {
            Text(data.s.none, color = fg, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
        } else {
            Text(d.t, color = fg, fontSize = 21.sp, fontWeight = FontWeight.ExtraBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(d.hoursText, color = fg, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            if (f.isNow && d.e > d.s) {
                val frac = ((now - d.s).toFloat() / (d.e - d.s).toFloat()).coerceIn(0f, 1f)
                Box(
                    Modifier.padding(vertical = 6.dp).fillMaxWidth().height(5.dp)
                        .background(fg.copy(alpha = 0.22f), RoundedCornerShape(3.dp)),
                ) {
                    Box(Modifier.fillMaxWidth(frac).fillMaxHeight().background(fg, RoundedCornerShape(3.dp)))
                }
            } else {
                Spacer(Modifier.height(3.dp))
            }
            Text(
                data.countdown(f, now), color = fg.copy(alpha = 0.85f),
                fontSize = 12.sp, fontWeight = FontWeight.SemiBold, maxLines = 2,
            )
        }
    }
}

/** un giorno: data, nome del turno e orari */
@Composable
fun DayRow(data: ShiftData, day: Day, today: String) {
    val filled = day.k.isNotEmpty()
    val tone = Palette.of(day.tn)
    val fg: Color = if (filled) tone.fg else Palette.muted
    Row(
        Modifier.fillMaxWidth()
            .background(if (filled) tone.bg else Palette.sunken, RoundedCornerShape(18.dp))
            .padding(horizontal = 12.dp, vertical = 7.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.width(32.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(day.wdShort, color = fg.copy(alpha = 0.8f), fontSize = 10.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
            Text(
                day.dn, fontSize = 17.sp, fontWeight = FontWeight.Bold,
                color = if (day.ho) Palette.holiday else if (filled) fg else Palette.ink,
            )
        }
        Spacer(Modifier.width(8.dp))
        Column(Modifier.weight(1f)) {
            if (day.d == today) {
                Text(data.s.today, color = fg.copy(alpha = 0.8f), fontSize = 10.sp, fontWeight = FontWeight.Bold, maxLines = 1)
            }
            Text(day.t, color = fg, fontSize = 15.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            if (day.isShift) {
                Text(day.h, color = fg.copy(alpha = 0.9f), fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
    }
}

/** prima che arrivino i turni dal telefono */
@Composable
fun Empty() {
    Column(
        Modifier.fillMaxSize().padding(horizontal = 22.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("MyTurn", color = Palette.ink, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(6.dp))
        Text(stringResource(R.string.open_phone), color = Palette.muted, fontSize = 13.sp, textAlign = TextAlign.Center)
    }
}
