// Aspetto dei widget (iPhone) e delle complicazioni (Apple Watch), con i colori del calendario dell'app.
// Le stesse viste servono all'app iPhone per le foto automatiche (WidgetSnapshot, solo in Debug).
import SwiftUI
import WidgetKit

enum ShiftLayout { case small, medium, large, rect, circle, inline, corner }

/// false solo nelle foto automatiche: lì conti alla rovescia e barre si calcolano dalla data passata
enum ShiftRender { static var live = true }

// MARK: - colori (gli stessi di index.html)

enum Palette {
    private static let light: [String: (String, String)] = [
        "m": ("#ffe8ad", "#553800"), "p": ("#ffd2c0", "#6b2407"), "n": ("#d9dbff", "#24256e"),
        "f": ("#cbf1d8", "#0c4927"), "x": ("#e4e7ee", "#4a5267")]
    private static let dark: [String: (String, String)] = [
        "m": ("#4d3a08", "#ffe2a2"), "p": ("#572712", "#ffd0ba"), "n": ("#27296e", "#d7d9ff"),
        "f": ("#0f4427", "#c0f1d0"), "x": ("#222632", "#b7bed0")]
    static func bg(_ tone: String, _ dark: Bool) -> Color { Color(hex: (dark ? Palette.dark : light)[tone]?.0 ?? "#e4e7ee") }
    static func fg(_ tone: String, _ dark: Bool) -> Color { Color(hex: (dark ? Palette.dark : light)[tone]?.1 ?? "#4a5267") }
    static func surface(_ dark: Bool) -> Color { Color(hex: dark ? "#14161c" : "#ffffff") }
    static func sunken(_ dark: Bool) -> Color { Color(hex: dark ? "#1d2029" : "#f1f2f6") }
    static func ink(_ dark: Bool) -> Color { Color(hex: dark ? "#f3f4f8" : "#0d0f14") }
    static func muted(_ dark: Bool) -> Color { Color(hex: dark ? "#8e95a8" : "#676e80") }
    static func holiday(_ dark: Bool) -> Color { Color(hex: dark ? "#ff8a7e" : "#cf3a2f") }
}

// MARK: - stato: turno in corso, prossimo turno, nessun turno

enum ShiftFocus {
    case now(ShiftDay), next(ShiftDay), none

    init(_ data: ShiftData, _ date: Date) {
        if let c = data.current(date) { self = .now(c) }
        else if let n = data.upcoming(date) { self = .next(n) }
        else { self = .none }
    }
    var day: ShiftDay? {
        switch self { case .now(let d), .next(let d): return d; case .none: return nil }
    }
    var isNow: Bool { if case .now = self { return true } else { return false } }
    var tone: String { day?.tone ?? "x" }

    /// "IN TURNO ADESSO", "OGGI", "DOMANI", "GIO 14"
    func eyebrow(_ data: ShiftData, _ date: Date) -> String {
        switch self {
        case .now: return data.nowText
        case .next(let d): return data.label(d, date)
        case .none: return data.s.next
        }
    }
}

/// tempo che manca, es. "2 h 10 min", nella lingua dell'app
func shiftSpan(_ from: Date, _ to: Date, _ locale: Locale) -> String {
    let f = DateComponentsFormatter()
    var cal = Calendar.current; cal.locale = locale
    f.calendar = cal
    f.unitsStyle = .abbreviated
    f.maximumUnitCount = 2
    f.zeroFormattingBehavior = .dropAll   // "4 h" invece di "4 h 0 min"
    f.allowedUnits = to.timeIntervalSince(from) >= 86400 ? [.day, .hour] : [.hour, .minute]
    return f.string(from: max(60, to.timeIntervalSince(from))) ?? ""
}

/// "Inizia tra 2 h 10 min" / "Finisce tra 45 min": nei widget il sistema lo aggiorna da solo
struct Countdown: View {
    let data: ShiftData
    let focus: ShiftFocus
    let date: Date

    var body: some View {
        switch focus {
        case .now(let d): line(data.endsText, d.end ?? date)
        case .next(let d): line(data.startsText, d.start ?? date)
        case .none: Text("")
        }
    }

    private func line(_ template: String, _ target: Date) -> Text {
        let parts = template.components(separatedBy: "{x}")
        let before = Text(parts.first ?? ""), after = Text(parts.count > 1 ? parts[1] : "")
        if ShiftRender.live && target.timeIntervalSince(date) < 86400 {
            return before + Text(target, style: .relative) + after
        }
        return before + Text(shiftSpan(date, target, data.locale)) + after
    }
}

/// barra di avanzamento del turno in corso
struct ShiftProgress: View {
    let day: ShiftDay
    let date: Date
    let color: Color
    var circular = false

    var body: some View {
        if let a = day.start, let b = day.end, a < b {
            if ShiftRender.live {
                if circular {
                    ProgressView(timerInterval: a...b, countsDown: false, label: { EmptyView() }, currentValueLabel: { EmptyView() })
                        .progressViewStyle(.circular).tint(color)
                } else {
                    ProgressView(timerInterval: a...b, countsDown: false, label: { EmptyView() }, currentValueLabel: { EmptyView() })
                        .progressViewStyle(.linear).tint(color)
                }
            } else {
                let v = min(1, max(0, date.timeIntervalSince(a) / b.timeIntervalSince(a)))
                if circular { Ring(value: v, color: color) }
                else { Bar(value: v, color: color) }
            }
        }
    }
}

/// anello disegnato (per le foto)
struct Ring: View {
    let value: Double
    let color: Color
    var body: some View {
        ZStack {
            Circle().stroke(color.opacity(0.25), lineWidth: 4)
            Circle().trim(from: 0, to: value).stroke(color, style: StrokeStyle(lineWidth: 4, lineCap: .round)).rotationEffect(.degrees(-90))
        }.padding(2)
    }
}

/// barra disegnata (per le foto e per l'orologio)
struct Bar: View {
    let value: Double
    let color: Color
    var body: some View {
        GeometryReader { g in
            ZStack(alignment: .leading) {
                Capsule().fill(color.opacity(0.22))
                Capsule().fill(color).frame(width: max(4, g.size.width * value))
            }
        }.frame(height: 4)
    }
}

// MARK: - vista principale

struct ShiftWidgetView: View {
    let data: ShiftData?
    let date: Date
    let layout: ShiftLayout
    @Environment(\.colorScheme) private var scheme
    @Environment(\.widgetRenderingMode) private var mode

    var body: some View {
        Group {
            if let data = data {
                switch layout {
                case .small: SmallView(data: data, date: date, dark: scheme == .dark, tinted: mode != .fullColor)
                case .medium: MediumView(data: data, date: date, dark: scheme == .dark, tinted: mode != .fullColor)
                case .large: LargeView(data: data, date: date, dark: scheme == .dark, tinted: mode != .fullColor)
                case .rect: RectView(data: data, date: date)
                case .circle: CircleView(data: data, date: date)
                case .inline: InlineView(data: data, date: date)
                case .corner: CornerView(data: data, date: date)
                }
            } else {
                EmptyStateView(layout: layout)
            }
        }
        .environment(\.locale, data?.locale ?? .current)
    }

    /// sfondo del widget: il colore del turno per il piccolo, la superficie dell'app per gli altri
    static func background(_ data: ShiftData?, _ date: Date, _ layout: ShiftLayout, dark: Bool) -> Color {
        guard let data = data else { return Palette.surface(dark) }
        switch layout {
        case .small: return Palette.bg(ShiftFocus(data, date).tone, dark)
        case .medium, .large: return Palette.surface(dark)
        default: return .clear
        }
    }

    static func link(_ data: ShiftData?, _ date: Date) -> URL? {
        guard let data = data else { return nil }
        return (ShiftFocus(data, date).day ?? data.today(date))?.deepLink
    }
}

private struct EmptyStateView: View {
    let layout: ShiftLayout
    var body: some View {
        switch layout {
        case .small, .medium, .large:
            VStack(alignment: .leading, spacing: 6) {
                Text("MyTurn").font(.system(size: 17, weight: .bold))
                Text(ShiftFallback.openApp).font(.system(size: 13)).foregroundStyle(.secondary)
                Spacer(minLength: 0)
            }.frame(maxWidth: .infinity, alignment: .leading)
        case .inline: Text("MyTurn")
        default: Text("MyTurn").font(.system(size: 11, weight: .semibold))
        }
    }
}

// MARK: - schermata Home

/// il riquadro del turno: in corso o prossimo, con orari e conto alla rovescia
private struct HeroBlock: View {
    let data: ShiftData
    let date: Date
    let dark: Bool
    var big = false
    var compact = false

    var body: some View {
        let f = ShiftFocus(data, date), fg = Palette.fg(f.tone, dark)
        VStack(alignment: .leading, spacing: 0) {
            Text(f.eyebrow(data, date).uppercased())
                .font(.system(size: 11, weight: .bold)).tracking(0.4).foregroundStyle(fg.opacity(0.78)).lineLimit(1)
            if let d = f.day {
                if compact {
                    HStack(alignment: .firstTextBaseline, spacing: 8) {
                        Text(d.t).font(.system(size: 19, weight: .heavy)).foregroundStyle(fg).lineLimit(1).minimumScaleFactor(0.7)
                        Spacer(minLength: 4)
                        Text(d.hoursText).font(.system(size: 16, weight: .bold).monospacedDigit()).foregroundStyle(fg)
                            .lineLimit(1).minimumScaleFactor(0.6).layoutPriority(1)
                    }.padding(.top, 2)
                } else {
                    Text(d.t).font(.system(size: big ? 24 : 20, weight: .heavy)).foregroundStyle(fg)
                        .lineLimit(1).minimumScaleFactor(0.7).padding(.top, 3)
                    Text(d.hoursText).font(.system(size: big ? 17 : 15, weight: .semibold).monospacedDigit()).foregroundStyle(fg)
                        .lineLimit(1).minimumScaleFactor(0.6)
                }
                Spacer(minLength: compact ? 3 : 4)
                if f.isNow { ShiftProgress(day: d, date: date, color: fg).padding(.bottom, 5) }
                Countdown(data: data, focus: f, date: date)
                    .font(.system(size: 12, weight: .semibold)).foregroundStyle(fg.opacity(0.85)).lineLimit(1).minimumScaleFactor(0.7)
            } else {
                Spacer(minLength: 4)
                Text(data.noneText).font(.system(size: 15, weight: .semibold)).foregroundStyle(fg).lineLimit(3)
                Spacer(minLength: 0)
            }
        }.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

private struct SmallView: View {
    let data: ShiftData
    let date: Date
    let dark: Bool
    let tinted: Bool
    var body: some View {
        HeroBlock(data: data, date: date, dark: dark).widgetAccentable(tinted)
    }
}

/// un giorno come nel calendario: riquadro colorato, giorno, numero, ora d'inizio
private struct DayTile: View {
    let data: ShiftData
    let day: ShiftDay
    let date: Date
    let dark: Bool
    let tinted: Bool
    var height: CGFloat = 58

    var body: some View {
        let isToday = day.d == ShiftStore.key(date)
        let filled = !day.k.isEmpty
        let bg = tinted ? Color.primary.opacity(filled ? 0.16 : 0.06) : (filled ? Palette.bg(day.tone, dark) : Palette.sunken(dark))
        let fg = tinted ? Color.primary : (filled ? Palette.fg(day.tone, dark) : Palette.muted(dark))
        let num = day.holiday && !tinted ? Palette.holiday(dark) : fg
        VStack(spacing: 1) {
            Text(day.wd.prefix(3).capitalized).font(.system(size: 10, weight: .semibold)).foregroundStyle(fg.opacity(0.8)).lineLimit(1)
            Text(day.dn).font(.system(size: 16, weight: .bold).monospacedDigit()).foregroundStyle(num)
            Text(day.isShift ? day.startText : (filled ? String(day.t.prefix(3)) : "·"))
                .font(.system(size: 10.5, weight: .semibold).monospacedDigit()).foregroundStyle(fg).lineLimit(1).minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity, minHeight: height, maxHeight: height)
        .background(RoundedRectangle(cornerRadius: 10, style: .continuous).fill(bg))
        .overlay(RoundedRectangle(cornerRadius: 10, style: .continuous).strokeBorder(Palette.ink(dark), lineWidth: isToday && !tinted ? 2 : 0))
    }
}

private struct HeroTile: View {
    let data: ShiftData
    let date: Date
    let dark: Bool
    let tinted: Bool
    var big = false
    var compact = false
    var body: some View {
        let f = ShiftFocus(data, date)
        HeroBlock(data: data, date: date, dark: dark, big: big, compact: compact)
            .padding(.horizontal, 12).padding(.vertical, compact ? 8 : 10)
            .background(RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(tinted ? Color.primary.opacity(0.14) : Palette.bg(f.tone, dark)))
            .widgetAccentable(tinted)
    }
}

private struct MediumView: View {
    let data: ShiftData
    let date: Date
    let dark: Bool
    let tinted: Bool
    var body: some View {
        let days = Array(data.from(date).prefix(7))
        VStack(spacing: 6) {
            Link(destination: ShiftWidgetView.link(data, date) ?? URL(string: "myturn://")!) {
                HeroTile(data: data, date: date, dark: dark, tinted: tinted, compact: true)
            }
            HStack(spacing: 4) {
                ForEach(days, id: \.d) { d in
                    Link(destination: d.deepLink ?? URL(string: "myturn://")!) {
                        DayTile(data: data, day: d, date: date, dark: dark, tinted: tinted, height: 54)
                    }
                }
            }
        }
    }
}

private struct LargeView: View {
    let data: ShiftData
    let date: Date
    let dark: Bool
    let tinted: Bool
    var body: some View {
        let days = Array(data.from(date).prefix(14))
        let week1 = Array(days.prefix(7)), week2 = Array(days.dropFirst(7))
        let f = ShiftFocus(data, date)
        let later = data.days.filter { $0.isShift && ($0.start ?? .distantPast) > (f.day?.start ?? date) }.prefix(5)
        VStack(alignment: .leading, spacing: 8) {
            Link(destination: ShiftWidgetView.link(data, date) ?? URL(string: "myturn://")!) {
                HeroTile(data: data, date: date, dark: dark, tinted: tinted, big: true).frame(height: 118)
            }
            ForEach([week1, week2], id: \.first?.d) { week in
                HStack(spacing: 4) {
                    ForEach(week, id: \.d) { d in
                        Link(destination: d.deepLink ?? URL(string: "myturn://")!) {
                            DayTile(data: data, day: d, date: date, dark: dark, tinted: tinted, height: 58)
                        }
                    }
                }
            }
            VStack(alignment: .leading, spacing: 5) {
                ForEach(Array(later), id: \.d) { d in
                    HStack(spacing: 8) {
                        Circle().fill(tinted ? Color.primary : Color(hex: d.c)).frame(width: 8, height: 8)
                        Text(data.label(d, date)).font(.system(size: 13, weight: .semibold)).foregroundStyle(Palette.muted(dark))
                            .frame(width: 64, alignment: .leading).lineLimit(1).minimumScaleFactor(0.7)
                        Text(d.t).font(.system(size: 13, weight: .bold)).foregroundStyle(Palette.ink(dark)).lineLimit(1)
                        Spacer(minLength: 4)
                        Text(d.hoursText).font(.system(size: 13, weight: .medium).monospacedDigit()).foregroundStyle(Palette.muted(dark)).lineLimit(1)
                    }
                }
            }.padding(.horizontal, 2)
            Spacer(minLength: 0)
        }
    }
}

// MARK: - schermata di blocco e Apple Watch (il sistema li colora da solo)

private struct RectView: View {
    let data: ShiftData
    let date: Date
    var body: some View {
        let f = ShiftFocus(data, date)
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 4) {
                Text(f.eyebrow(data, date).uppercased()).font(.system(size: 11, weight: .bold)).lineLimit(1)
                if case .next(let d) = f { Text(d.startText).font(.system(size: 11, weight: .bold).monospacedDigit()) }
            }.widgetAccentable()
            if let d = f.day {
                Text(d.t).font(.system(size: 16, weight: .heavy)).lineLimit(1).minimumScaleFactor(0.7)
                if f.isNow {
                    ShiftProgress(day: d, date: date, color: .primary).padding(.vertical, 3)
                }
                Countdown(data: data, focus: f, date: date).font(.system(size: 12, weight: .medium)).lineLimit(1).minimumScaleFactor(0.7)
            } else {
                Text(data.noneText).font(.system(size: 13, weight: .semibold)).lineLimit(2)
            }
        }.frame(maxWidth: .infinity, alignment: .leading)
    }
}

private struct CircleView: View {
    let data: ShiftData
    let date: Date
    var body: some View {
        let f = ShiftFocus(data, date)
        ZStack {
            AccessoryWidgetBackground()
            if let d = f.day {
                if f.isNow { ShiftProgress(day: d, date: date, color: .primary, circular: true).padding(2) }
                VStack(spacing: -1) {
                    Text(f.isNow ? "→" : (data.label(d, date) == data.s.today ? data.s.today : String(d.wd.prefix(3))))
                        .font(.system(size: 10, weight: .bold)).lineLimit(1).minimumScaleFactor(0.5).widgetAccentable()
                    Text(f.isNow ? d.endText : d.startText).font(.system(size: 15, weight: .heavy).monospacedDigit()).minimumScaleFactor(0.6)
                }.padding(6)
            } else {
                Text("—").font(.system(size: 16, weight: .bold))
            }
        }
    }
}

private struct InlineView: View {
    let data: ShiftData
    let date: Date
    var body: some View {
        switch ShiftFocus(data, date) {
        case .now(let d): Text("\(d.t) → \(d.endText)")
        case .next(let d): Text("\(data.label(d, date)) \(d.startText) · \(d.t)")
        case .none: Text(data.noneText)
        }
    }
}

private struct CornerView: View {
    let data: ShiftData
    let date: Date
    var body: some View {
        let f = ShiftFocus(data, date)
        #if os(watchOS)
        Text(f.isNow ? (f.day?.endText ?? "—") : (f.day?.startText ?? "—"))
            .font(.system(size: 18, weight: .bold).monospacedDigit()).widgetAccentable()
            .widgetLabel {
                if let d = f.day, f.isNow, let a = d.start, let b = d.end, a < b, ShiftRender.live {
                    ProgressView(timerInterval: a...b, countsDown: false, label: { Text(d.t) }, currentValueLabel: { EmptyView() })
                } else {
                    Text(f.day.map { "\(data.label($0, date)) · \($0.t)" } ?? data.s.next)
                }
            }
        #else
        Text(f.day?.startText ?? "—")
        #endif
    }
}

extension View {
    /// sfondo dei widget: da iOS 17 / watchOS 10 lo gestisce il sistema
    @ViewBuilder func shiftWidgetBackground(_ color: Color, padded: Bool) -> some View {
        if #available(iOS 17.0, watchOS 10.0, *) {
            self.containerBackground(for: .widget) { color }
        } else {
            self.padding(padded ? 16 : 0).background(color)
        }
    }
}
