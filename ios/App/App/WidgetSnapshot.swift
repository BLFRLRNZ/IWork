// Solo per le prove automatiche: con l'argomento -widgetSnapshot l'app disegna i widget con dati di prova
// e li salva come immagini in Documents (il workflow su GitHub le recupera dal simulatore).
#if DEBUG
import SwiftUI

enum WidgetSnapshot {
    @MainActor static func render() {
        let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let items: [(String, ShiftLayout, CGSize, Bool)] = [
            ("1-piccolo", .small, CGSize(width: 170, height: 170), true),
            ("2-medio", .medium, CGSize(width: 364, height: 170), true),
            ("3-blocco", .rect, CGSize(width: 172, height: 76), false),
            ("4-tondo", .circle, CGSize(width: 76, height: 76), false),
            ("5-riga", .inline, CGSize(width: 260, height: 26), false)]
        for dark in [false, true] {
            for (name, layout, size, home) in items {
                let bg: Color = home ? (dark ? Color(white: 0.11) : .white) : Color(white: dark ? 0.0 : 0.25)
                let view = ShiftWidgetView(data: .demo, date: Date(), layout: layout)
                    .padding(home ? 16 : 6)
                    .frame(width: size.width, height: size.height)
                    .background(bg)
                    .clipShape(RoundedRectangle(cornerRadius: home ? 22 : 12))
                    .environment(\.colorScheme, home ? (dark ? .dark : .light) : .dark)
                    .foregroundStyle(home ? Color.primary : Color.white)
                let r = ImageRenderer(content: view)
                r.scale = 3
                if let png = r.uiImage?.pngData() {
                    try? png.write(to: dir.appendingPathComponent("widget-\(name)-\(dark ? "scuro" : "chiaro").png"))
                }
            }
        }
    }
}
#endif
