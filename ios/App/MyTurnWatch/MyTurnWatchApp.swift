// App per Apple Watch: il turno di oggi e dei prossimi giorni, ricevuti dall'iPhone.
import SwiftUI
import WatchConnectivity
import WidgetKit

@main
struct MyTurnWatchApp: App {
    @StateObject private var link = PhoneLink.shared
    var body: some Scene {
        WindowGroup { WatchHome().environmentObject(link) }
    }
}

/// Riceve i turni dall'iPhone (WatchConnectivity), li salva per le complicazioni e aggiorna lo schermo.
final class PhoneLink: NSObject, ObservableObject, WCSessionDelegate {
    static let shared = PhoneLink()
    @Published var data: ShiftData?

    override init() {
        super.init()
        data = ProcessInfo.processInfo.arguments.contains("-demo") ? .demo : ShiftStore.load()
        if WCSession.isSupported() {
            WCSession.default.delegate = self
            WCSession.default.activate()
        }
    }

    private func apply(_ ctx: [String: Any]) {
        guard let json = ctx["json"] as? String else { return }
        ShiftStore.save(json)
        let d = ShiftStore.load()
        DispatchQueue.main.async { self.data = d }
        WidgetCenter.shared.reloadAllTimelines()
    }

    func session(_ session: WCSession, activationDidCompleteWith state: WCSessionActivationState, error: Error?) {
        if !session.receivedApplicationContext.isEmpty { apply(session.receivedApplicationContext) }
    }
    func session(_ session: WCSession, didReceiveApplicationContext ctx: [String: Any]) { apply(ctx) }
}

struct WatchHome: View {
    @EnvironmentObject var link: PhoneLink

    var body: some View {
        TimelineView(.everyMinute) { tl in
            if let d = link.data {
                let days = d.from(tl.date)
                List {
                    WatchHero(data: d, date: tl.date)
                        .listRowBackground(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(Palette.bg(ShiftFocus(d, tl.date).tone, true)))
                    ForEach(Array(days.prefix(14)), id: \.d) { day in
                        WatchRow(data: d, day: day, date: tl.date)
                            .listRowBackground(RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .fill(day.k.isEmpty ? Palette.sunken(true) : Palette.bg(day.tone, true)))
                    }
                }
                .environment(\.locale, d.locale)
            } else {
                ScrollView {
                    VStack(spacing: 8) {
                        Text("MyTurn").font(.headline)
                        Text(ShiftFallback.openPhone).font(.footnote).multilineTextAlignment(.center).foregroundStyle(.secondary)
                    }.padding()
                }
            }
        }
    }
}

/// in alto: il turno in corso o il prossimo, con orari, barra e conto alla rovescia
private struct WatchHero: View {
    let data: ShiftData
    let date: Date
    var body: some View {
        let f = ShiftFocus(data, date), fg = Palette.fg(f.tone, true)
        VStack(alignment: .leading, spacing: 2) {
            Text(f.eyebrow(data, date).uppercased()).font(.system(size: 12, weight: .bold)).foregroundStyle(fg.opacity(0.8)).lineLimit(1)
            if let d = f.day {
                Text(d.t).font(.system(size: 22, weight: .heavy)).foregroundStyle(fg).lineLimit(1).minimumScaleFactor(0.7)
                Text(d.hoursText).font(.system(size: 16, weight: .semibold).monospacedDigit()).foregroundStyle(fg).lineLimit(1).minimumScaleFactor(0.7)
                if f.isNow, let a = d.start, let b = d.end, a < b {
                    Bar(value: min(1, max(0, date.timeIntervalSince(a) / b.timeIntervalSince(a))), color: fg).padding(.vertical, 4)
                }
                Countdown(data: data, focus: f, date: date).font(.system(size: 13, weight: .semibold)).foregroundStyle(fg.opacity(0.85))
            } else {
                Text(data.noneText).font(.system(size: 15, weight: .semibold)).foregroundStyle(fg)
            }
        }.padding(.vertical, 6)
    }
}

/// un giorno: colori del calendario, nome del turno e ora d'inizio
private struct WatchRow: View {
    let data: ShiftData
    let day: ShiftDay
    let date: Date
    var body: some View {
        let fg = day.k.isEmpty ? Palette.muted(true) : Palette.fg(day.tone, true)
        HStack(spacing: 8) {
            VStack(spacing: -1) {
                Text(day.wd.prefix(3).capitalized).font(.system(size: 11, weight: .semibold)).foregroundStyle(fg.opacity(0.8))
                Text(day.dn).font(.system(size: 17, weight: .bold).monospacedDigit())
                    .foregroundStyle(day.holiday ? Palette.holiday(true) : fg)
            }.frame(width: 30)
            VStack(alignment: .leading, spacing: 0) {
                if day.d == ShiftStore.key(date) {
                    Text(data.s.today).font(.system(size: 11, weight: .bold)).foregroundStyle(fg.opacity(0.8))
                }
                Text(day.t).font(.system(size: 16, weight: .bold)).foregroundStyle(fg).lineLimit(1).minimumScaleFactor(0.8)
                if day.isShift {
                    Text(day.hoursText).font(.system(size: 13, weight: .medium).monospacedDigit()).foregroundStyle(fg.opacity(0.9)).lineLimit(1).minimumScaleFactor(0.7)
                }
            }
            Spacer(minLength: 0)
        }.padding(.vertical, 2)
    }
}
