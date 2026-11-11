// Calendario di aggiornamento dei widget: a mezzanotte cambia "oggi", alla fine di un turno cambia il "prossimo turno".
import SwiftUI
import WidgetKit

struct ShiftEntry: TimelineEntry {
    let date: Date
    let data: ShiftData?
}

struct ShiftProvider: TimelineProvider {
    func placeholder(in context: Context) -> ShiftEntry { ShiftEntry(date: Date(), data: .demo) }

    func getSnapshot(in context: Context, completion: @escaping (ShiftEntry) -> Void) {
        completion(ShiftEntry(date: Date(), data: ShiftStore.load() ?? (context.isPreview ? .demo : nil)))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ShiftEntry>) -> Void) {
        let data = ShiftStore.load(), cal = Calendar.current, now = Date()
        var dates: [Date] = [now]
        for i in 1...7 {
            if let d = cal.date(byAdding: .day, value: i, to: cal.startOfDay(for: now)) { dates.append(d) }
        }
        for day in data?.days ?? [] {
            if let e = day.end, e > now, e < now.addingTimeInterval(7 * 86400) { dates.append(e) }
        }
        dates.sort()
        completion(Timeline(entries: dates.map { ShiftEntry(date: $0, data: data) }, policy: .atEnd))
    }
}

struct ShiftEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: ShiftEntry

    var layout: ShiftLayout {
        switch family {
        case .systemMedium, .systemLarge, .systemExtraLarge: return .medium
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
            .shiftWidgetBackground(layout == .small || layout == .medium)
    }
}
