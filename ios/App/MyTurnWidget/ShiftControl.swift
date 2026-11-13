// Tasto nel Centro di Controllo (iOS 18): mostra il prossimo turno ("Domani 06:00") e apre MyTurn sul mese di oggi.
import SwiftUI
import WidgetKit
import AppIntents

@available(iOS 18.0, *)
struct ShiftControl: ControlWidget {
    var body: some ControlWidgetConfiguration {
        StaticControlConfiguration(kind: "app.myturn.control", provider: ShiftControlProvider()) { value in
            ControlWidgetButton(action: OpenShiftsIntent()) {
                Label(value, systemImage: "calendar.badge.clock")
            }
        }
        .displayName("MyTurn")
        .description(LocalizedStringResource(stringLiteral: ShiftFallback.description))
    }
}

@available(iOS 18.0, *)
struct ShiftControlProvider: ControlValueProvider {
    var previewValue: String { "MyTurn" }
    func currentValue() async throws -> String {
        let now = Date()
        guard let d = ShiftStore.load(), let s = d.nextShift(now) else { return "MyTurn" }
        if d.current(now) != nil { return "\(s.t) → \(s.endText)" }
        return "\(d.label(s, now)) \(s.startText)"
    }
}
