// Comandi per Siri, Comandi rapidi e Centro di Controllo (solo iPhone).
// OpenShiftsIntent apre l'app sul mese di oggi: serve anche all'estensione dei widget (tasto nel Centro di Controllo),
// per questo sta in Shared. "Prossimo turno" per Siri è in App/ShiftShortcuts.swift.
#if os(iOS)
import AppIntents
import Foundation

let MYTURN_OPEN_TODAY = "myturn-open-today"

@available(iOS 16.0, *)
struct OpenShiftsIntent: AppIntent {
    static var title: LocalizedStringResource = "Open MyTurn"
    static var openAppWhenRun: Bool = true
    func perform() async throws -> some IntentResult {
        ShiftStore.defaults.set(true, forKey: MYTURN_OPEN_TODAY)   // la pagina lo legge con takeLink e mostra oggi
        return .result()
    }
}

/// la frase detta da Siri: turno in corso o prossimo, con quanto manca
enum ShiftSpeech {
    static func next(_ now: Date) -> String {
        guard let d = ShiftStore.load() else { return ShiftFallback.openApp }
        switch ShiftFocus(d, now) {
        case .now(let s):
            return "\(d.nowText): \(s.t), \(s.startText)–\(s.endText). " + d.endsText.replacingOccurrences(of: "{x}", with: shiftSpan(now, s.end ?? now, d.locale)) + "."
        case .next(let s):
            return "\(d.label(s, now)): \(s.t), \(s.startText)–\(s.endText). " + d.startsText.replacingOccurrences(of: "{x}", with: shiftSpan(now, s.start ?? now, d.locale)) + "."
        case .none:
            return d.noneText
        }
    }
}
#endif
