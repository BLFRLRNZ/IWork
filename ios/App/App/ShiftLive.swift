// Avvia, aggiorna o chiude la Live Activity del turno (Dynamic Island e schermata di blocco).
// La chiama il plugin a ogni setData: un turno in corso, oppure che inizia entro 3 ore.
// Le Live Activity si possono avviare solo con l'app aperta: per questo si aggiorna quando l'app manda i dati.
import Foundation
#if canImport(ActivityKit)
import ActivityKit
#endif

enum ShiftLive {
    static func update() {
        #if canImport(ActivityKit)
        guard #available(iOS 16.2, *) else { return }
        let now = Date()
        let running = Activity<ShiftActivityAttributes>.activities
        guard ActivityAuthorizationInfo().areActivitiesEnabled,
              let data = ShiftStore.load(),
              let day = data.days.first(where: { $0.isShift && ($0.end ?? .distantPast) > now && ($0.start ?? .distantFuture) < now.addingTimeInterval(3 * 3600) }),
              let a = day.start, let b = day.end, a < b else {
            Task { for act in running { await act.end(nil, dismissalPolicy: .immediate) } }
            return
        }
        let state = ShiftLiveState(title: day.t, hours: day.hoursText, tone: day.tone, start: a, end: b,
                                   label: data.label(day, now), nowText: data.nowText, startText: day.startText)
        let content = ActivityContent(state: state, staleDate: b)
        Task {
            var kept = false
            for act in running {
                if !kept && act.attributes.day == day.d { await act.update(content); kept = true }
                else { await act.end(nil, dismissalPolicy: .immediate) }
            }
            if !kept { _ = try? Activity<ShiftActivityAttributes>.request(attributes: ShiftActivityAttributes(day: day.d), content: content, pushType: nil) }
        }
        #endif
    }
}
