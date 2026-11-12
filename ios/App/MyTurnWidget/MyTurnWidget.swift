// Widget per la schermata Home e la schermata di blocco dell'iPhone.
import SwiftUI
import WidgetKit

@main
struct MyTurnWidgets: WidgetBundle {
    var body: some Widget { MyTurnWidget() }
}

struct MyTurnWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "MyTurnWidget", provider: ShiftProvider()) { entry in
            ShiftEntryView(entry: entry)
        }
        .configurationDisplayName("MyTurn")
        .description(ShiftFallback.description)
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryRectangular, .accessoryCircular, .accessoryInline])
    }
}
