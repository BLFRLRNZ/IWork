// Turno sulla Dynamic Island e sulla schermata di blocco (Live Activity), solo iPhone.
// L'app la avvia quando un turno è in corso o inizia entro 3 ore (App/ShiftLive.swift); la disegna l'estensione
// dei widget (MyTurnWidget/ShiftLiveActivity.swift). Le viste sono qui perché servono anche alle foto automatiche.
#if os(iOS)
import SwiftUI
#if canImport(ActivityKit)
import ActivityKit
#endif

struct ShiftLiveState: Codable, Hashable {
    var title: String       // "Mattina"
    var hours: String       // "06:00 → 14:00"
    var tone: String        // m, p, n
    var start: Date
    var end: Date
    var label: String       // "Oggi", "Domani"
    var nowText: String     // "In turno adesso"
    var startText: String   // "06:00"
}

#if canImport(ActivityKit)
@available(iOS 16.1, *)
struct ShiftActivityAttributes: ActivityAttributes {
    typealias ContentState = ShiftLiveState
    var day: String         // AAAA-MM-GG del turno
}
#endif

extension ShiftLiveState {
    var fg: Color { Palette.fg(tone, true) }
    var bg: Color { Palette.bg(tone, true) }
    func started(_ date: Date) -> Bool { date >= start }
    func eyebrow(_ date: Date) -> String { started(date) ? nowText : label }
}

/// conto alla rovescia alla fine del turno (lo aggiorna il sistema); prima dell'inizio, l'ora d'inizio
struct LiveTimer: View {
    let state: ShiftLiveState
    let date: Date
    var body: some View {
        if !state.started(date) { Text(state.startText).monospacedDigit() }
        else if ShiftRender.live { Text(timerInterval: state.start...max(state.start, state.end), countsDown: true).monospacedDigit() }
        else {
            let m = Int(max(0, state.end.timeIntervalSince(date))) / 60
            Text(String(format: "%d:%02d:%02d", m / 60, m % 60, 0)).monospacedDigit()
        }
    }
}

/// barra dall'inizio alla fine del turno: parte da sola all'ora d'inizio
struct LiveBar: View {
    let state: ShiftLiveState
    let date: Date
    var body: some View {
        if ShiftRender.live {
            ProgressView(timerInterval: state.start...max(state.start, state.end), countsDown: false, label: { EmptyView() }, currentValueLabel: { EmptyView() })
                .progressViewStyle(.linear).tint(state.fg)
        } else {
            Bar(value: min(1, max(0, date.timeIntervalSince(state.start) / max(1, state.end.timeIntervalSince(state.start)))), color: state.fg)
        }
    }
}

/// schermata di blocco
struct ShiftLiveLockView: View {
    let state: ShiftLiveState
    let date: Date
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .center, spacing: 10) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(state.eyebrow(date).uppercased()).font(.system(size: 12, weight: .bold)).foregroundStyle(state.fg.opacity(0.75)).lineLimit(1)
                    Text(state.title).font(.system(size: 22, weight: .heavy)).foregroundStyle(state.fg).lineLimit(1)
                    Text(state.hours).font(.system(size: 15, weight: .semibold)).foregroundStyle(state.fg.opacity(0.9)).lineLimit(1)
                }
                Spacer(minLength: 6)
                LiveTimer(state: state, date: date).font(.system(size: 32, weight: .bold)).foregroundStyle(state.fg).lineLimit(1).minimumScaleFactor(0.6)
            }
            LiveBar(state: state, date: date).frame(height: 6)
        }
        .padding(16)
    }
}

/// pallino con l'iniziale del turno (Dynamic Island compatta e minima)
struct ShiftBadge: View {
    let state: ShiftLiveState
    var body: some View {
        ZStack {
            Circle().fill(state.fg)
            Text(String(state.title.prefix(1)).uppercased()).font(.system(size: 13, weight: .heavy)).foregroundStyle(state.bg)
        }
        .frame(width: 22, height: 22)
    }
}

struct ShiftIslandLeading: View {
    let state: ShiftLiveState
    let date: Date
    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(state.eyebrow(date).uppercased()).font(.system(size: 11, weight: .bold)).foregroundStyle(state.fg.opacity(0.75)).lineLimit(1)
            Text(state.title).font(.system(size: 18, weight: .heavy)).foregroundStyle(state.fg).lineLimit(1)
        }
        .padding(.leading, 6)
    }
}

struct ShiftIslandTrailing: View {
    let state: ShiftLiveState
    let date: Date
    var body: some View {
        LiveTimer(state: state, date: date).font(.system(size: 26, weight: .bold)).foregroundStyle(state.fg)
            .lineLimit(1).minimumScaleFactor(0.6).padding(.trailing, 6)
    }
}

struct ShiftIslandBottom: View {
    let state: ShiftLiveState
    let date: Date
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(state.hours).font(.system(size: 14, weight: .semibold)).foregroundStyle(.white.opacity(0.85)).lineLimit(1)
            LiveBar(state: state, date: date).frame(height: 6)
        }
        .padding(.horizontal, 6)
    }
}
#endif
