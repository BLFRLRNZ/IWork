// Aspetto dei widget (iPhone) e delle complicazioni (Apple Watch). Le stesse viste servono
// all'app iPhone per le foto automatiche (WidgetSnapshot, solo in Debug).
import SwiftUI
import WidgetKit

enum ShiftLayout { case small, medium, rect, circle, inline, corner }

struct ShiftWidgetView: View {
    let data: ShiftData?
    let date: Date
    let layout: ShiftLayout

    var body: some View {
        if let data = data {
            switch layout {
            case .small: SmallView(data: data, date: date)
            case .medium: MediumView(data: data, date: date)
            case .rect: RectView(data: data, date: date)
            case .circle: CircleView(data: data, date: date)
            case .inline: Text(inlineText(data))
            case .corner: CornerView(data: data, date: date)
            }
        } else {
            switch layout {
            case .small, .medium:
                VStack(alignment: .leading, spacing: 6) {
                    Text("MyTurn").font(.headline)
                    Text(ShiftFallback.openApp).font(.caption).foregroundStyle(.secondary)
                    Spacer(minLength: 0)
                }.frame(maxWidth: .infinity, alignment: .leading)
            case .inline: Text("MyTurn")
            default: VStack { Text("MyTurn").font(.caption2) }
            }
        }
    }

    private func inlineText(_ d: ShiftData) -> String {
        guard let n = d.nextShift(date) else { return "\(d.s.next): —" }
        return "\(d.label(n, date)) \(n.startText) · \(n.t)"
    }
}

/// barra colorata del turno
private struct Bar: View {
    let color: Color
    var body: some View { RoundedRectangle(cornerRadius: 2).fill(color).frame(width: 4) }
}

private struct SmallView: View {
    let data: ShiftData
    let date: Date
    var body: some View {
        let days = data.from(date)
        VStack(alignment: .leading, spacing: 0) {
            if let today = days.first {
                Text("\(data.s.today) · \(today.wd) \(today.dn)".uppercased())
                    .font(.system(size: 11, weight: .semibold)).foregroundStyle(.secondary).lineLimit(1)
                Spacer(minLength: 6)
                HStack(alignment: .top, spacing: 8) {
                    Bar(color: today.color)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(today.t).font(.system(size: 19, weight: .bold)).lineLimit(2).minimumScaleFactor(0.8)
                        if !today.h.isEmpty {
                            Text(today.h).font(.system(size: 14, weight: .medium).monospacedDigit()).lineLimit(2).minimumScaleFactor(0.7)
                        }
                    }
                }.fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 6)
                if days.count > 1 {
                    let tm = days[1]
                    HStack(spacing: 5) {
                        Circle().fill(tm.color).frame(width: 7, height: 7)
                        Text("\(data.s.tomorrow): \(tm.t)\(tm.startText.isEmpty ? "" : " " + tm.startText)")
                            .font(.system(size: 12)).foregroundStyle(.secondary).lineLimit(1).minimumScaleFactor(0.8)
                    }
                }
            } else {
                Text(ShiftFallback.openApp).font(.caption)
            }
        }.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
}

private struct MediumView: View {
    let data: ShiftData
    let date: Date
    var body: some View {
        let days = data.from(date)
        HStack(spacing: 14) {
            SmallTodayBlock(data: data, days: days)
            VStack(alignment: .leading, spacing: 7) {
                ForEach(Array(days.dropFirst().prefix(4)), id: \.d) { day in
                    HStack(spacing: 7) {
                        Text("\(day.wd) \(day.dn)").font(.system(size: 12, weight: .medium)).foregroundStyle(.secondary)
                            .frame(width: 46, alignment: .leading).lineLimit(1).minimumScaleFactor(0.7)
                        Circle().fill(day.color).frame(width: 7, height: 7)
                        Text(day.t).font(.system(size: 13, weight: .semibold)).lineLimit(1)
                        Spacer(minLength: 2)
                        Text(day.startText).font(.system(size: 12).monospacedDigit()).foregroundStyle(.secondary)
                    }
                }
                Spacer(minLength: 0)
            }.frame(maxWidth: .infinity)
        }
    }
}

private struct SmallTodayBlock: View {
    let data: ShiftData
    let days: [ShiftDay]
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if let today = days.first {
                Text(data.s.today.uppercased()).font(.system(size: 11, weight: .semibold)).foregroundStyle(.secondary)
                Text("\(today.wd) \(today.dn)").font(.system(size: 11)).foregroundStyle(.secondary)
                Spacer(minLength: 6)
                HStack(alignment: .top, spacing: 8) {
                    Bar(color: today.color)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(today.t).font(.system(size: 18, weight: .bold)).lineLimit(2).minimumScaleFactor(0.8)
                        if !today.h.isEmpty {
                            Text(today.h).font(.system(size: 13, weight: .medium).monospacedDigit()).lineLimit(2).minimumScaleFactor(0.7)
                        }
                    }
                }.fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 0)
                if let x = today.x {
                    Text(x).font(.system(size: 11)).foregroundStyle(.secondary).lineLimit(2)
                }
            }
        }.frame(width: 120, alignment: .leading).frame(maxHeight: .infinity, alignment: .topLeading)
    }
}

/// schermata di blocco e Apple Watch: il turno in corso o il prossimo
private struct RectView: View {
    let data: ShiftData
    let date: Date
    var body: some View {
        if let n = data.nextShift(date) {
            VStack(alignment: .leading, spacing: 1) {
                Text(data.label(n, date)).font(.system(size: 12, weight: .semibold)).widgetAccentable().lineLimit(1)
                Text(n.t).font(.system(size: 16, weight: .bold)).lineLimit(1)
                Text(n.h).font(.system(size: 13).monospacedDigit()).lineLimit(1).minimumScaleFactor(0.7)
            }.frame(maxWidth: .infinity, alignment: .leading)
        } else {
            VStack(alignment: .leading, spacing: 1) {
                Text(data.s.next).font(.system(size: 12, weight: .semibold)).widgetAccentable()
                Text("—").font(.system(size: 16, weight: .bold))
            }.frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

private struct CircleView: View {
    let data: ShiftData
    let date: Date
    var body: some View {
        ZStack {
            AccessoryWidgetBackground()
            if let n = data.nextShift(date) {
                VStack(spacing: 0) {
                    Text(data.label(n, date) == data.s.today ? data.s.today : n.wd)
                        .font(.system(size: 10, weight: .semibold)).lineLimit(1).minimumScaleFactor(0.6).widgetAccentable()
                    Text(n.startText).font(.system(size: 15, weight: .bold).monospacedDigit()).minimumScaleFactor(0.6)
                }.padding(4)
            } else {
                Text("—").font(.system(size: 16, weight: .bold))
            }
        }
    }
}

private struct CornerView: View {
    let data: ShiftData
    let date: Date
    var body: some View {
        #if os(watchOS)
        let n = data.nextShift(date)
        Text(n?.startText ?? "—").font(.system(size: 18, weight: .bold).monospacedDigit()).widgetAccentable()
            .widgetLabel { Text(n.map { "\(data.label($0, date)) · \($0.t)" } ?? data.s.next) }
        #else
        Text(data.nextShift(date)?.startText ?? "—")
        #endif
    }
}

extension View {
    /// sfondo dei widget: da iOS 17 / watchOS 10 lo gestisce il sistema
    @ViewBuilder func shiftWidgetBackground(_ padded: Bool) -> some View {
        if #available(iOS 17.0, watchOS 10.0, *) {
            #if os(iOS)
            self.containerBackground(for: .widget) { Color(uiColor: .systemBackground) }
            #else
            self.containerBackground(for: .widget) { Color.clear }
            #endif
        } else {
            self.padding(padded ? 16 : 0)
        }
    }
}
