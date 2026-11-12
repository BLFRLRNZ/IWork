// Solo per le prove automatiche: con l'argomento -widgetSnapshot l'app disegna i widget con dati di prova
// e li salva come immagini in Documents (il workflow su GitHub le recupera dal simulatore).
#if DEBUG
import SwiftUI

enum WidgetSnapshot {
    @MainActor static func render() {
        ShiftRender.live = false
        let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let cal = Calendar.current, t0 = cal.startOfDay(for: Date())
        let during = t0.addingTimeInterval(10.5 * 3600)   // durante il turno di oggi (06–14)
        let before = t0.addingTimeInterval(-2.25 * 3600)  // la sera prima: il turno inizia tra 8 ore e un quarto
        let data = ShiftData.demo
        let items: [(String, ShiftLayout, CGSize, Date)] = [
            ("1-piccolo-prossimo", .small, CGSize(width: 170, height: 170), before),
            ("2-piccolo-in-corso", .small, CGSize(width: 170, height: 170), during),
            ("3-medio", .medium, CGSize(width: 364, height: 170), during),
            ("4-grande", .large, CGSize(width: 364, height: 382), before),
            ("5-blocco", .rect, CGSize(width: 172, height: 76), during),
            ("6-tondo", .circle, CGSize(width: 76, height: 76), during),
            ("7-riga", .inline, CGSize(width: 260, height: 26), before)]
        for dark in [false, true] {
            for (name, layout, size, date) in items {
                let home = [ShiftLayout.small, .medium, .large].contains(layout)
                if !home && dark { continue }
                let bg = home ? ShiftWidgetView.background(data, date, layout, dark: dark) : Color(white: 0.18)
                let view = ShiftWidgetView(data: data, date: date, layout: layout)
                    .padding(home ? 16 : 6)
                    .frame(width: size.width, height: size.height)
                    .background(bg)
                    .clipShape(RoundedRectangle(cornerRadius: home ? 22 : 12, style: .continuous))
                    .environment(\.colorScheme, home ? (dark ? .dark : .light) : .dark)
                    .foregroundStyle(home ? Color.primary : Color.white)
                let r = ImageRenderer(content: view)
                r.scale = 3
                if let png = r.uiImage?.pngData() {
                    let suffix = home ? (dark ? "-scuro" : "-chiaro") : ""
                    try? png.write(to: dir.appendingPathComponent("widget-\(name)\(suffix).png"))
                }
            }
        }
    }
}
#endif
