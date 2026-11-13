package app.myturn.wear

import android.content.ComponentName
import android.content.Context
import android.icu.text.MeasureFormat
import android.icu.util.Measure
import android.icu.util.MeasureUnit
import androidx.compose.ui.graphics.Color
import androidx.wear.tiles.TileService
import androidx.wear.watchface.complications.datasource.ComplicationDataSourceUpdateRequester
import com.google.android.gms.wearable.DataItem
import com.google.android.gms.wearable.DataMapItem
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

/** Un giorno come lo prepara wgData() in index.html. */
data class Day(
    val d: String, val wd: String, val dn: String, val k: String, val t: String, val h: String,
    val tn: String, val ho: Boolean, val s: Long, val e: Long, val x: String,
) {
    val isShift get() = k == "w"
    /** "06:00 → 14:00", oppure gli orari così come sono se il turno è spezzato */
    val hoursText: String
        get() = if (!isShift || h.length < 5) h else if (h.contains("·")) h else h.take(5) + " → " + h.takeLast(5)
    val start get() = if (isShift && h.length >= 5) h.take(5) else ""
    val end get() = if (isShift && h.length >= 5) h.takeLast(5) else ""
    val wdShort: String
        get() = wd.take(3).replaceFirstChar { it.titlecase(Locale.getDefault()) }
}

/** Frasi già tradotte nella lingua dell'app sul telefono. */
data class Texts(
    val today: String, val tomorrow: String, val next: String, val free: String,
    val now: String, val none: String, val starts: String, val ends: String,
)

class Focus(val day: Day?, val isNow: Boolean)

class ShiftData(val days: List<Day>, val s: Texts, val lang: String) {
    val locale: Locale get() = if (lang.isEmpty()) Locale.getDefault() else Locale.forLanguageTag(lang)

    /** il turno in corso, altrimenti il prossimo */
    fun focus(now: Long): Focus {
        for (d in days) {
            if (!d.isShift) continue
            if (d.s <= now && now < d.e) return Focus(d, true)
            if (d.s > now) return Focus(d, false)
        }
        return Focus(null, false)
    }

    /** i giorni da oggi in poi */
    fun from(now: Long): List<Day> {
        val today = ShiftStore.key(now)
        return days.filter { it.d >= today }
    }

    /** "IN TURNO ADESSO", "OGGI", "DOMANI" oppure "ven 14" */
    fun label(f: Focus, now: Long): String {
        val d = f.day ?: return s.next
        if (f.isNow) return s.now
        return dayLabel(d, now)
    }

    fun dayLabel(d: Day, now: Long): String = when (d.d) {
        ShiftStore.key(now) -> s.today
        ShiftStore.key(now + 86_400_000L) -> s.tomorrow
        else -> d.wd + " " + d.dn
    }

    /** "Inizia tra 2 h 10 min" / "Finisce tra 45 min" */
    fun countdown(f: Focus, now: Long): String {
        val d = f.day ?: return ""
        val target = if (f.isNow) d.e else d.s
        val tpl = if (f.isNow) s.ends else s.starts
        return tpl.replace("{x}", span(now, target))
    }

    fun span(from: Long, to: Long): String {
        val mins = maxOf(1L, (to - from + 59_999L) / 60_000L)
        val parts = ArrayList<Measure>()
        if (mins >= 1440) {
            parts.add(Measure(mins / 1440, MeasureUnit.DAY))
            if ((mins % 1440) / 60 > 0) parts.add(Measure((mins % 1440) / 60, MeasureUnit.HOUR))
        } else {
            if (mins >= 60) parts.add(Measure(mins / 60, MeasureUnit.HOUR))
            if (mins % 60 > 0) parts.add(Measure(mins % 60, MeasureUnit.MINUTE))
        }
        return try {
            MeasureFormat.getInstance(locale, MeasureFormat.FormatWidth.SHORT).formatMeasures(*parts.toTypedArray())
        } catch (e: Exception) {
            if (mins >= 60) "${mins / 60} h ${mins % 60} min" else "$mins min"
        }
    }
}

/** Colori del calendario dell'app (tema scuro): sfondo e testo per tono. */
object Palette {
    class Tone(val bg: Color, val fg: Color, val bgArgb: Int, val fgArgb: Int)
    private fun tone(bg: Long, fg: Long) = Tone(Color(bg), Color(fg), bg.toInt(), fg.toInt())
    private val tones = mapOf(
        "m" to tone(0xFF4D3A08, 0xFFFFE2A2),
        "p" to tone(0xFF572712, 0xFFFFD0BA),
        "n" to tone(0xFF27296E, 0xFFD7D9FF),
        "f" to tone(0xFF0F4427, 0xFFC0F1D0),
        "x" to tone(0xFF222632, 0xFFB7BED0),
    )
    fun of(t: String?): Tone = tones[if (t.isNullOrEmpty()) "x" else t] ?: tones.getValue("x")
    val ink = Color(0xFFF3F4F8)
    val muted = Color(0xFF8E95A8)
    val sunken = Color(0xFF1D2029)
    val holiday = Color(0xFFFF8A7E)
    val sunkenArgb = 0xFF1D2029.toInt()
    val inkArgb = 0xFFF3F4F8.toInt()
    val mutedArgb = 0xFF8E95A8.toInt()
    val holidayArgb = 0xFFFF8A7E.toInt()
}

/** I turni ricevuti dal telefono, salvati sull'orologio per app, riquadro e complicazione. */
object ShiftStore {
    const val PATH = "/myturn/data"
    private const val PREFS = "myturn-wear"
    private const val KEY = "data"

    fun key(ms: Long): String = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(ms)

    fun load(ctx: Context): ShiftData? =
        parse(ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, null))

    fun save(ctx: Context, json: String) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY, json).apply()
    }

    /** un elemento del Data Layer arrivato dal telefono: lo salva e aggiorna riquadro e complicazione */
    fun saveFrom(ctx: Context, item: DataItem) {
        val json = DataMapItem.fromDataItem(item).dataMap.getString("json") ?: return
        save(ctx, json)
        refresh(ctx)
    }

    fun refresh(ctx: Context) {
        try { TileService.getUpdater(ctx).requestUpdate(ShiftTileService::class.java) } catch (e: Exception) { }
        try {
            ComplicationDataSourceUpdateRequester.create(ctx, ComponentName(ctx, ShiftComplicationService::class.java)).requestUpdateAll()
        } catch (e: Exception) { }
    }

    fun parse(json: String?): ShiftData? {
        if (json.isNullOrEmpty()) return null
        return try {
            val o = JSONObject(json)
            val arr = o.optJSONArray("days") ?: JSONArray()
            val days = (0 until arr.length()).mapNotNull { i ->
                val d = arr.optJSONObject(i) ?: return@mapNotNull null
                Day(
                    d.optString("d"), d.optString("wd"), d.optString("dn"), d.optString("k"), d.optString("t"),
                    d.optString("h"), d.optString("tn", "x"), d.optInt("ho", 0) == 1,
                    d.optLong("s", 0), d.optLong("e", 0), d.optString("x"),
                )
            }
            val s = o.optJSONObject("s") ?: JSONObject()
            ShiftData(
                days,
                Texts(
                    s.optString("today", "Today"), s.optString("tomorrow", "Tomorrow"), s.optString("next", "Next shift"),
                    s.optString("free", "Free"), s.optString("now", "On shift now"), s.optString("none", "No shifts planned"),
                    s.optString("starts", "Starts in {x}"), s.optString("ends", "Ends in {x}"),
                ),
                o.optString("lang", ""),
            )
        } catch (e: Exception) {
            null
        }
    }

    /** dati di prova per le foto automatiche (solo nelle versioni di prova) */
    fun demoJson(): String {
        val plan = listOf(
            arrayOf("w", "Mattina", "m", 6, 14), arrayOf("w", "Mattina", "m", 6, 14), arrayOf("w", "Pomeriggio", "p", 14, 22),
            arrayOf("r", "Riposo", "x", 0, 0), arrayOf("w", "Notte", "n", 22, 30), arrayOf("w", "Notte", "n", 22, 30),
            arrayOf("r", "Riposo", "x", 0, 0), arrayOf("f", "Ferie", "f", 0, 0),
        )
        val c = Calendar.getInstance()
        c.set(Calendar.HOUR_OF_DAY, 0); c.set(Calendar.MINUTE, 0); c.set(Calendar.SECOND, 0); c.set(Calendar.MILLISECOND, 0)
        val wd = SimpleDateFormat("EEE", Locale.ITALIAN)
        val days = JSONArray()
        // il turno di oggi è iniziato da 2 ore: così si vedono anche la barra e il conto alla rovescia
        val now = System.currentTimeMillis()
        val nowStart = now - now % 3_600_000L - 2 * 3_600_000L
        for (i in 0 until 14) {
            val p = plan[i % plan.size]
            val d = JSONObject()
            d.put("d", key(c.timeInMillis)); d.put("wd", wd.format(c.time)); d.put("dn", c.get(Calendar.DAY_OF_MONTH).toString())
            d.put("k", p[0]); d.put("t", p[1]); d.put("tn", p[2])
            if (i == 0) {
                val hh = SimpleDateFormat("HH:mm", Locale.US)
                val tn = Calendar.getInstance().apply { timeInMillis = nowStart }.get(Calendar.HOUR_OF_DAY).let { if (it < 12) "m" else if (it < 18) "p" else "n" }
                d.put("k", "w"); d.put("tn", tn); d.put("t", mapOf("m" to "Mattina", "p" to "Pomeriggio", "n" to "Notte").getValue(tn))
                d.put("h", hh.format(nowStart) + "–" + hh.format(nowStart + 8 * 3_600_000L))
                d.put("s", nowStart); d.put("e", nowStart + 8 * 3_600_000L)
            } else if (p[0] == "w") {
                val a = p[3] as Int
                val b = p[4] as Int
                d.put("h", String.format(Locale.US, "%02d:00–%02d:00", a, b % 24))
                d.put("s", c.timeInMillis + a * 3_600_000L); d.put("e", c.timeInMillis + b * 3_600_000L)
            } else d.put("h", "")
            if (i == 9) d.put("ho", 1)
            days.put(d)
            c.add(Calendar.DAY_OF_MONTH, 1)
        }
        val s = JSONObject()
        s.put("today", "Oggi"); s.put("tomorrow", "Domani"); s.put("next", "Prossimo turno"); s.put("free", "Libero")
        s.put("now", "In turno adesso"); s.put("none", "Nessun turno in programma")
        s.put("starts", "Inizia tra {x}"); s.put("ends", "Finisce tra {x}")
        val o = JSONObject()
        o.put("v", 1); o.put("lang", "it"); o.put("days", days); o.put("s", s)
        return o.toString()
    }
}
