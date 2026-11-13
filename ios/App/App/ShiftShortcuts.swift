// "Ehi Siri, prossimo turno su MyTurn": risponde con il turno in corso o il prossimo, senza aprire l'app.
// Frasi e titoli tradotti in AppShortcuts.xcstrings e Localizable.xcstrings (it, fr, de, es, pt).
import AppIntents
import Foundation

@available(iOS 16.0, *)
struct NextShiftIntent: AppIntent {
    static var title: LocalizedStringResource = "Next shift"
    static var description = IntentDescription("Tells you your current or next shift.")
    func perform() async throws -> some IntentResult & ProvidesDialog {
        .result(dialog: IntentDialog(stringLiteral: ShiftSpeech.next(Date())))
    }
}

@available(iOS 16.0, *)
struct MyTurnShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(intent: NextShiftIntent(), phrases: [
            "What's my next shift in \(.applicationName)",
            "Next shift in \(.applicationName)",
            "When do I work in \(.applicationName)"
        ])
        AppShortcut(intent: OpenShiftsIntent(), phrases: [
            "Open my shifts in \(.applicationName)"
        ])
    }
}
