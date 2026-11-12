// Calendario di aggiornamento dei widget: cambia all'inizio e alla fine di ogni turno e a mezzanotte.
// I conti alla rovescia e le barre si aggiornano da soli tra un momento e l'altro.
import SwiftUI
import WidgetKit

struct ShiftEntry: TimelineEntry {
    let date: Date
    let data: ShiftData?
    var relevance: TimelineEntryRelevance? = nil
}

struct ShiftProvider: TimelineProvider {
    func placeholder(in context: Context) -> ShiftEntry { ShiftEntry(date: Date(), data: .demo) }

    func getSnapshot(in context: Context, completion: @escaping (ShiftEntry) -> Void) {
        completion(ShiftEntry(date: Date(), data: ShiftStore.load() ?? (context.isPreview ? .demo : nil)))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ShiftEntry>) -> Void) {
        let data = ShiftStore.load(), cal = Calendar.current, now = Date()
        var dates: Set<Date> = [now]
        for i in 1...7 {
            if let d = cal.date(byAdding: .day, value: i, to: cal.startOfDay(for: now)) { dates.insert(d) }
        }
        for day in data?.days ?? [] where day.isShift {
            for t in [day.start, day.end].compactMap({ $0 }) where t > now && t < now.addingTimeInterval(7 * 86400) {
                dates.insert(t)
                // nelle ultime 3 ore prima dell'inizio l'orologio mette il turno in cima (Smart Stack)
                if t == day.start { dates.insert(t.addingTimeInterval(-3 * 3600)) }
            }
        }
        let entries = dates.filter { $0 >= now }.sorted().map { d in
            ShiftEntry(date: d, data: data, relevance: relevance(data, d))
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }

    private func relevance(_ data: ShiftData?, _ date: Date) -> TimelineEntryRelevance? {
        guard let data = data else { return nil }
        if let c = data.current(date), let e = c.end { return TimelineEntryRelevance(score: 100, duration: e.timeIntervalSince(date)) }
        if let n = data.upcoming(date), let s = n.start, s.timeIntervalSince(date) <= 3 * 3600 {
            return TimelineEntryRelevance(score: 80, duration: s.timeIntervalSince(date))
        }
        return TimelineEntryRelevance(score: 1)
    }
}

struct ShiftEntryView: View {
    @Environment(\.widgetFamily) var family
    @Environment(\.colorScheme) var scheme
    let entry: ShiftEntry

    var layout: ShiftLayout {
        switch family {
        case .systemMedium: return .medium
        case .systemLarge, .systemExtraLarge: return .large
        case .accessoryRectangular: return .rect
        case .accessoryCircular: return .circle
        case .accessoryInline: return .inline
        #if os(watchOS)
        case .accessoryCorner: return .corner
        #endif
        default: return .small
        }
    }

    var body: some View {
        ShiftWidgetView(data: entry.data, date: entry.date, layout: layout)
            .shiftWidgetBackground(ShiftWidgetView.background(entry.data, entry.date, layout, dark: scheme == .dark),
                                   padded: layout == .small || layout == .medium || layout == .large)
            .widgetURL(ShiftWidgetView.link(entry.data, entry.date))
    }
}
