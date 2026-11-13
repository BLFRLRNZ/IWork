package app.myturn.wear

import android.app.PendingIntent
import android.content.Intent
import android.graphics.drawable.Icon
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationText
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.CountDownTimeReference
import androidx.wear.watchface.complications.data.LongTextComplicationData
import androidx.wear.watchface.complications.data.MonochromaticImage
import androidx.wear.watchface.complications.data.NoDataComplicationData
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.RangedValueComplicationData
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.data.TimeDifferenceComplicationText
import androidx.wear.watchface.complications.data.TimeDifferenceStyle
import androidx.wear.watchface.complications.datasource.ComplicationDataSourceService
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.ComplicationDataSourceService.ComplicationRequestListener
import java.time.Instant
import java.util.concurrent.TimeUnit

/**
 * Complicazione per il quadrante:
 * breve = ora d'inizio del prossimo turno (o quanto manca alla fine di quello in corso), con il giorno sopra;
 * lunga = nome del turno e orari; con barra = avanzamento del turno in corso.
 */
class ShiftComplicationService : ComplicationDataSourceService() {
    override fun onComplicationRequest(request: ComplicationRequest, listener: ComplicationRequestListener) {
        listener.onComplicationData(build(request.complicationType, ShiftStore.load(this), System.currentTimeMillis()))
    }

    override fun getPreviewData(type: ComplicationType): ComplicationData? =
        build(type, ShiftStore.parse(ShiftStore.demoJson()), System.currentTimeMillis())

    private fun plain(s: String): ComplicationText = PlainComplicationText.Builder(s).build()

    private fun build(type: ComplicationType, data: ShiftData?, now: Long): ComplicationData? {
        val tap = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        val icon = MonochromaticImage.Builder(Icon.createWithResource(this, R.drawable.ic_shift)).build()
        val f = data?.focus(now)
        val d = f?.day
        if (data == null || f == null || d == null) {
            val none = data?.s?.none ?: getString(R.string.open_phone)
            return when (type) {
                ComplicationType.SHORT_TEXT -> ShortTextComplicationData.Builder(plain("—"), plain(none))
                    .setMonochromaticImage(icon).setTapAction(tap).build()
                ComplicationType.LONG_TEXT -> LongTextComplicationData.Builder(plain(none), plain(none))
                    .setTitle(plain("MyTurn")).setTapAction(tap).build()
                ComplicationType.RANGED_VALUE -> RangedValueComplicationData.Builder(0f, 0f, 1f, plain(none))
                    .setText(plain("—")).setMonochromaticImage(icon).setTapAction(tap).build()
                else -> NoDataComplicationData()
            }
        }
        val desc = plain(data.label(f, now) + ": " + d.t + " " + d.hoursText)
        // conto alla rovescia che l'orologio aggiorna da solo
        val left = TimeDifferenceComplicationText.Builder(TimeDifferenceStyle.SHORT_DUAL_UNIT, CountDownTimeReference(Instant.ofEpochMilli(d.e)))
            .setMinimumTimeUnit(TimeUnit.MINUTES).build()
        return when (type) {
            ComplicationType.SHORT_TEXT ->
                if (f.isNow) ShortTextComplicationData.Builder(left, desc).setTitle(plain("→" + d.end)).setTapAction(tap).build()
                else ShortTextComplicationData.Builder(plain(d.start), desc).setTitle(plain(short(data.dayLabel(d, now)))).setTapAction(tap).build()
            ComplicationType.LONG_TEXT -> LongTextComplicationData.Builder(plain(d.t + " · " + d.hoursText), desc)
                .setTitle(plain(data.label(f, now))).setTapAction(tap).build()
            ComplicationType.RANGED_VALUE -> {
                val frac = if (f.isNow && d.e > d.s) ((now - d.s).toFloat() / (d.e - d.s)).coerceIn(0f, 1f) else 0f
                RangedValueComplicationData.Builder(frac, 0f, 1f, desc)
                    .setText(if (f.isNow) left else plain(d.start))
                    .setMonochromaticImage(icon).setTapAction(tap).build()
            }
            else -> NoDataComplicationData()
        }
    }

    /** il titolo delle complicazioni brevi ha poco spazio */
    private fun short(s: String) = if (s.length <= 7) s else s.take(6) + "."
}
