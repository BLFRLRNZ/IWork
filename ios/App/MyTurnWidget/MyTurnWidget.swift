// Widget per la schermata Home e la schermata di blocco dell'iPhone.
import SwiftUI
import WidgetKit

@main
struct MyTurnWidgets: WidgetBundle {
    var body: some Widget {
        MyTurnWidget()
        if #available(iOS 16.2, *) { ShiftLiveActivity() }
        if #available(iOS 18.0, *) { ShiftControl() }
    }
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
