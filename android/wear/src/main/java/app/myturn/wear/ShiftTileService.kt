package app.myturn.wear

import androidx.wear.protolayout.ActionBuilders
import androidx.wear.protolayout.ColorBuilders.argb
import androidx.wear.protolayout.DimensionBuilders.dp
import androidx.wear.protolayout.DimensionBuilders.expand
import androidx.wear.protolayout.DimensionBuilders.sp
import androidx.wear.protolayout.DimensionBuilders.wrap
import androidx.wear.protolayout.LayoutElementBuilders
import androidx.wear.protolayout.ModifiersBuilders
import androidx.wear.protolayout.ResourceBuilders
import androidx.wear.protolayout.TimelineBuilders
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.TileBuilders
import androidx.wear.tiles.TileService
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.WearableListenerService
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture

/** Riquadro (tile): il turno in corso o il prossimo e, sotto, i giorni seguenti come pallini colorati. */
class ShiftTileService : TileService() {
    override fun onTileRequest(requestParams: RequestBuilders.TileRequest): ListenableFuture<TileBuilders.Tile> {
        val data = ShiftStore.load(this)
        val now = System.currentTimeMillis()
        val timeline = TimelineBuilders.Timeline.Builder()
        // una schermata per ogni momento in cui cambia qualcosa (inizio e fine dei prossimi turni)
        val moments = mutableListOf(now)
        data?.days?.filter { it.isShift && it.e > now }?.take(3)?.forEach { d ->
            if (d.s > now) moments.add(d.s)
            moments.add(d.e)
        }
        moments.sort()
        for (i in moments.indices) {
            val validity = TimelineBuilders.TimeInterval.Builder().setStartMillis(if (i == 0) 0 else moments[i])
            if (i + 1 < moments.size) validity.setEndMillis(moments[i + 1])
            timeline.addTimelineEntry(
                TimelineBuilders.TimelineEntry.Builder()
                    .setLayout(LayoutElementBuilders.Layout.Builder().setRoot(layout(data, moments[i] + 1000)).build())
                    .setValidity(validity.build())
                    .build(),
            )
        }
        return Futures.immediateFuture(
            TileBuilders.Tile.Builder()
                .setResourcesVersion(RES)
                .setFreshnessIntervalMillis(30 * 60 * 1000L)
                .setTileTimeline(timeline.build())
                .build(),
        )
    }

    override fun onTileResourcesRequest(requestParams: RequestBuilders.ResourcesRequest): ListenableFuture<ResourceBuilders.Resources> =
        Futures.immediateFuture(ResourceBuilders.Resources.Builder().setVersion(RES).build())

    private fun text(s: String, size: Float, color: Int, bold: Boolean = false, lines: Int = 1) =
        LayoutElementBuilders.Text.Builder()
            .setText(s)
            .setMaxLines(lines)
            .setFontStyle(
                LayoutElementBuilders.FontStyle.Builder()
                    .setSize(sp(size))
                    .setColor(argb(color))
                    .setWeight(if (bold) LayoutElementBuilders.FONT_WEIGHT_BOLD else LayoutElementBuilders.FONT_WEIGHT_MEDIUM)
                    .build(),
            )
            .build()

    private fun spacer(h: Float) = LayoutElementBuilders.Spacer.Builder().setHeight(dp(h)).build()

    private fun layout(data: ShiftData?, at: Long): LayoutElementBuilders.LayoutElement {
        val open = ModifiersBuilders.Clickable.Builder()
            .setId("open")
            .setOnClick(
                ActionBuilders.LaunchAction.Builder()
                    .setAndroidActivity(
                        ActionBuilders.AndroidActivity.Builder()
                            .setPackageName(packageName)
                            .setClassName(MainActivity::class.java.name)
                            .build(),
                    )
                    .build(),
            )
            .build()
        val col = LayoutElementBuilders.Column.Builder()
            .setWidth(expand())
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
        if (data == null || data.days.isEmpty()) {
            col.addContent(text("MyTurn", 16f, Palette.inkArgb, bold = true))
            col.addContent(spacer(4f))
            col.addContent(text(getString(R.string.open_phone), 13f, Palette.mutedArgb, lines = 3))
        } else {
            val f = data.focus(at)
            val tone = Palette.of(f.day?.tn)
            // riquadro colorato del turno
            val card = LayoutElementBuilders.Column.Builder()
                .setWidth(expand())
                .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
                .setModifiers(
                    ModifiersBuilders.Modifiers.Builder()
                        .setBackground(
                            ModifiersBuilders.Background.Builder()
                                .setColor(argb(tone.bgArgb))
                                .setCorner(ModifiersBuilders.Corner.Builder().setRadius(dp(26f)).build())
                                .build(),
                        )
                        .setPadding(ModifiersBuilders.Padding.Builder().setAll(dp(10f)).build())
                        .build(),
                )
            card.addContent(text(data.label(f, at).uppercase(data.locale), 11f, tone.fgArgb, bold = true))
            val d = f.day
            if (d == null) {
                card.addContent(text(data.s.none, 14f, tone.fgArgb, lines = 2))
            } else {
                card.addContent(text(d.t, 19f, tone.fgArgb, bold = true))
                card.addContent(text(d.hoursText, 14f, tone.fgArgb))
            }
            col.addContent(card.build())
            col.addContent(spacer(8f))
            // i giorni seguenti: pallini con il colore del turno e il numero del giorno
            val row = LayoutElementBuilders.Row.Builder().setWidth(wrap())
            data.from(at).filter { it.d != d?.d }.take(5).forEachIndexed { i, day ->
                if (i > 0) row.addContent(LayoutElementBuilders.Spacer.Builder().setWidth(dp(4f)).build())
                val t = Palette.of(day.tn)
                val filled = day.k.isNotEmpty()
                row.addContent(
                    LayoutElementBuilders.Box.Builder()
                        .setWidth(dp(28f)).setHeight(dp(28f))
                        .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
                        .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
                        .setModifiers(
                            ModifiersBuilders.Modifiers.Builder()
                                .setBackground(
                                    ModifiersBuilders.Background.Builder()
                                        .setColor(argb(if (filled) t.bgArgb else Palette.sunkenArgb))
                                        .setCorner(ModifiersBuilders.Corner.Builder().setRadius(dp(14f)).build())
                                        .build(),
                                )
                                .build(),
                        )
                        .addContent(
                            text(
                                day.dn, 12f, bold = true,
                                color = if (day.ho) Palette.holidayArgb else if (filled) t.fgArgb else Palette.mutedArgb,
                            ),
                        )
                        .build(),
                )
            }
            col.addContent(row.build())
        }
        return LayoutElementBuilders.Box.Builder()
            .setWidth(expand()).setHeight(expand())
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
            .setModifiers(
                ModifiersBuilders.Modifiers.Builder()
                    .setClickable(open)
                    .setPadding(ModifiersBuilders.Padding.Builder().setStart(dp(18f)).setEnd(dp(18f)).build())
                    .build(),
            )
            .addContent(col.build())
            .build()
    }

    companion object {
        private const val RES = "1"
    }
}

/** Riceve i turni dal telefono anche quando l'app dell'orologio è chiusa. */
class DataListener : WearableListenerService() {
    override fun onDataChanged(events: DataEventBuffer) {
        for (ev in events) {
            if (ev.type == DataEvent.TYPE_CHANGED && ev.dataItem.uri.path == ShiftStore.PATH) ShiftStore.saveFrom(this, ev.dataItem)
        }
    }
}
