// Sveglie vere prima dei turni con AlarmKit (iOS 26 e successivi).
// La pagina (alSync in index.html) manda ogni volta l'elenco completo: qui si cancellano le sveglie dei turni e si rimettono.
// "Posticipa" mette una nuova sveglia tra 10 minuti (SnoozeShiftAlarm), che non viene cancellata quando si riapre l'app.
import Foundation
import SwiftUI
#if canImport(AlarmKit)
import AlarmKit
import ActivityKit
import AppIntents
#endif

#if canImport(AlarmKit)
@available(iOS 26.0, *)
struct ShiftAlarmMeta: AlarmMetadata {
    var shift: String
}

/// pulsante "Posticipa" della sveglia: un'altra sveglia tra 10 minuti
@available(iOS 26.0, *)
struct SnoozeShiftAlarm: LiveActivityIntent {
    static var title: LocalizedStringResource = "Posticipa"
    static var openAppWhenRun: Bool = false
    @Parameter(title: "Turno") var shift: String
    @Parameter(title: "Ferma") var stop: String
    @Parameter(title: "Posticipa") var snooze: String
    @Parameter(title: "Colore") var color: String
    init() {}
    init(shift: String, stop: String, snooze: String, color: String) {
        self.shift = shift; self.stop = stop; self.snooze = snooze; self.color = color
    }
    func perform() async throws -> some IntentResult {
        if let id = await ShiftAlarms.schedule(title: shift, at: Date().addingTimeInterval(600), stop: stop, snooze: snooze, color: color) {
            ShiftAlarms.keepSnooze(id)
        }
        return .result()
    }
}
#endif

enum ShiftAlarms {
    private static let snoozeKey = "myturn-alarm-snooze"

    /// "granted", "denied", "prompt" oppure "unsupported" (prima di iOS 26)
    static func state() -> String {
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            switch AlarmManager.shared.authorizationState {
            case .authorized: return "granted"
            case .denied: return "denied"
            default: return "prompt"
            }
        }
        #endif
        return "unsupported"
    }

    static func request() async -> String {
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            do {
                let s = try await AlarmManager.shared.requestAuthorization()
                return s == .authorized ? "granted" : "denied"
            } catch { return "denied" }
        }
        #endif
        return "unsupported"
    }

    private static func num(_ v: Any?) -> Double? {
        if let n = v as? NSNumber { return n.doubleValue }
        if let d = v as? Double { return d }
        if let i = v as? Int { return Double(i) }
        return nil
    }

    static func keepSnooze(_ id: UUID) {
        var ids = UserDefaults.standard.stringArray(forKey: snoozeKey) ?? []
        ids.append(id.uuidString)
        UserDefaults.standard.set(Array(ids.suffix(10)), forKey: snoozeKey)
    }

    #if canImport(AlarmKit)
    /// mette una sveglia; restituisce il suo identificativo
    @available(iOS 26.0, *)
    static func schedule(title: String, at date: Date, stop: String, snooze: String, color: String) async -> UUID? {
        let alert = AlarmPresentation.Alert(
            title: LocalizedStringResource(stringLiteral: title),
            stopButton: AlarmButton(text: LocalizedStringResource(stringLiteral: stop), textColor: .white, systemImageName: "stop.fill"),
            secondaryButton: AlarmButton(text: LocalizedStringResource(stringLiteral: snooze), textColor: .white, systemImageName: "zzz"),
            secondaryButtonBehavior: .custom)
        let attributes = AlarmAttributes<ShiftAlarmMeta>(
            presentation: AlarmPresentation(alert: alert),
            metadata: ShiftAlarmMeta(shift: title),
            tintColor: Color(hex: color))
        let config = AlarmManager.AlarmConfiguration<ShiftAlarmMeta>(
            countdownDuration: nil, schedule: .fixed(date), attributes: attributes,
            stopIntent: nil,
            secondaryIntent: SnoozeShiftAlarm(shift: title, stop: stop, snooze: snooze, color: color),
            sound: .default)
        let id = UUID()
        do { _ = try await AlarmManager.shared.schedule(id: id, configuration: config); return id } catch { return nil }
    }
    #endif

    /// sostituisce le sveglie dei turni (lascia quelle posticipate); items: [{at (ms), title, color}]
    static func replace(_ items: [[String: Any]], stop: String, snooze: String) async -> Int {
        #if canImport(AlarmKit)
        if #available(iOS 26.0, *) {
            let m = AlarmManager.shared
            guard m.authorizationState == .authorized else { return 0 }
            let current = (try? m.alarms) ?? []
            let snoozed = Set(UserDefaults.standard.stringArray(forKey: snoozeKey) ?? [])
            let alive = current.map { $0.id.uuidString }.filter { snoozed.contains($0) }
            UserDefaults.standard.set(alive, forKey: snoozeKey)
            for a in current where !snoozed.contains(a.id.uuidString) { try? m.cancel(id: a.id) }
            var n = 0
            for it in items {
                guard let at = num(it["at"]), let title = it["title"] as? String else { continue }
                let date = Date(timeIntervalSince1970: at / 1000)
                if date < Date().addingTimeInterval(30) { continue }
                if await schedule(title: title, at: date, stop: stop, snooze: snooze, color: (it["color"] as? String) ?? "#5b5ff0") != nil { n += 1 }
            }
            return n
        }
        #endif
        return 0
    }
}
