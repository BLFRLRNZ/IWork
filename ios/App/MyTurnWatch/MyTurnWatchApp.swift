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
                    if let today = days.first {
                        WatchToday(data: d, day: today).listRowBackground(Color.clear)
                    }
                    ForEach(Array(days.dropFirst().prefix(13)), id: \.d) { day in
                        WatchRow(data: d, day: day, date: tl.date)
                    }
                }
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

private struct WatchToday: View {
    let data: ShiftData
    let day: ShiftDay
    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text("\(data.s.today) · \(day.wd) \(day.dn)".uppercased()).font(.system(size: 12, weight: .semibold)).foregroundStyle(.secondary)
            HStack(alignment: .top, spacing: 7) {
                RoundedRectangle(cornerRadius: 2).fill(day.color).frame(width: 4)
                VStack(alignment: .leading, spacing: 1) {
                    Text(day.t).font(.system(size: 20, weight: .bold)).lineLimit(2)
                    if !day.h.isEmpty { Text(day.h).font(.system(size: 15).monospacedDigit()) }
                    if let x = day.x { Text(x).font(.system(size: 12)).foregroundStyle(.secondary) }
                }
            }.fixedSize(horizontal: false, vertical: true)
        }.padding(.vertical, 4)
    }
}

private struct WatchRow: View {
    let data: ShiftData
    let day: ShiftDay
    let date: Date
    var body: some View {
        HStack(spacing: 7) {
            Circle().fill(day.color).frame(width: 8, height: 8)
            VStack(alignment: .leading, spacing: 0) {
                Text(data.label(day, date)).font(.system(size: 12)).foregroundStyle(.secondary)
                Text(day.t).font(.system(size: 15, weight: .semibold)).lineLimit(1)
            }
            Spacer(minLength: 2)
            Text(day.startText).font(.system(size: 14).monospacedDigit())
        }
    }
}
