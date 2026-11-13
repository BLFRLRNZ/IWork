// Turno sulla Dynamic Island e sulla schermata di blocco. Le viste sono in Shared/ShiftActivity.swift.
import SwiftUI
import WidgetKit
#if canImport(ActivityKit)
import ActivityKit

@available(iOS 16.2, *)
struct ShiftLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: ShiftActivityAttributes.self) { context in
            ShiftLiveLockView(state: context.state, date: .now)
                .activityBackgroundTint(context.state.bg)
                .activitySystemActionForegroundColor(context.state.fg)
                .widgetURL(URL(string: "myturn://day/\(context.attributes.day)"))
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) { ShiftIslandLeading(state: context.state, date: .now) }
                DynamicIslandExpandedRegion(.trailing) { ShiftIslandTrailing(state: context.state, date: .now) }
                DynamicIslandExpandedRegion(.bottom) { ShiftIslandBottom(state: context.state, date: .now) }
            } compactLeading: {
                ShiftBadge(state: context.state)
            } compactTrailing: {
                LiveTimer(state: context.state, date: .now)
                    .font(.system(size: 14, weight: .semibold)).foregroundStyle(context.state.fg)
                    .frame(maxWidth: 60)
            } minimal: {
                ShiftBadge(state: context.state)
            }
            .widgetURL(URL(string: "myturn://day/\(context.attributes.day)"))
            .keylineTint(context.state.fg)
        }
    }
}
#endif
