// Complicazioni per il quadrante dell'Apple Watch.
import SwiftUI
import WidgetKit

@main
struct MyTurnWatchWidgets: WidgetBundle {
    var body: some Widget { MyTurnComplication() }
}

struct MyTurnComplication: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "MyTurnComplication", provider: ShiftProvider()) { entry in
            ShiftEntryView(entry: entry)
        }
        .configurationDisplayName("MyTurn")
        .description(ShiftFallback.description)
        .supportedFamilies([.accessoryRectangular, .accessoryCircular, .accessoryInline, .accessoryCorner])
    }
}
