// Dati dei prossimi 14 giorni preparati dall'app (wgData in index.html), già tradotti.
// Usati da: app iPhone (plugin MyTurnNative), widget iPhone, app Apple Watch e complicazioni.
import Foundation
import SwiftUI

let MYTURN_GROUP = "group.app.myturn"
let MYTURN_KEY = "myturn-widget"

struct ShiftDay: Codable, Hashable {
    var d: String        // AAAA-MM-GG
    var wd: String       // giorno della settimana breve, nella lingua dell'app
    var dn: String       // numero del giorno
    var k: String        // w turno, r riposo, f ferie, p permesso, m malattia, "" niente
    var t: String        // nome del turno o del tipo di giorno
    var h: String        // orari, es. "06:00–14:00"
    var c: String        // colore, es. "#f2a900"
    var x: String?       // festività, secondo lavoro, reperibilità
    var s: Double?       // inizio del turno (ms)
    var e: Double?       // fine del turno (ms)

    var color: Color { Color(hex: c) }
    var start: Date? { s.map { Date(timeIntervalSince1970: $0 / 1000) } }
    var end: Date? { e.map { Date(timeIntervalSince1970: $0 / 1000) } }
    var isShift: Bool { k == "w" }
    /// ora d'inizio, es. "06:00"
    var startText: String { h.isEmpty ? "" : String(h.prefix(5)) }
}

struct ShiftStrings: Codable, Hashable {
    var today: String
    var tomorrow: String
    var next: String
    var free: String
    var app: String
}

struct ShiftData: Codable, Hashable {
    var v: Int
    var gen: Double
    var lang: String?
    var days: [ShiftDay]
    var s: ShiftStrings

    /// i giorni da `date` in avanti (oggi per primo)
    func from(_ date: Date) -> [ShiftDay] {
        let k = ShiftStore.key(date)
        return days.filter { $0.d >= k }
    }
    /// il turno in corso o il prossimo
    func nextShift(_ date: Date) -> ShiftDay? {
        days.first { $0.isShift && ($0.end ?? .distantPast) > date }
    }
    /// "Oggi", "Domani" oppure "gio 14"
    func label(_ day: ShiftDay, _ date: Date) -> String {
        let today = ShiftStore.key(date)
        let tomorrow = ShiftStore.key(Calendar.current.date(byAdding: .day, value: 1, to: date) ?? date)
        if day.d == today { return s.today }
        if day.d == tomorrow { return s.tomorrow }
        return "\(day.wd) \(day.dn)"
    }
}

enum ShiftStore {
    static var defaults: UserDefaults { UserDefaults(suiteName: MYTURN_GROUP) ?? .standard }
    static func load() -> ShiftData? {
        guard let s = defaults.string(forKey: MYTURN_KEY), let d = s.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(ShiftData.self, from: d)
    }
    static func save(_ json: String) { defaults.set(json, forKey: MYTURN_KEY) }
    static func key(_ date: Date) -> String {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = .current
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: date)
    }
}

/// Testi di riserva, quando l'app non ha ancora mandato nulla.
enum ShiftFallback {
    static var lang: String { String((Locale.preferredLanguages.first ?? "en").prefix(2)) }
    static var openApp: String {
        ["it": "Apri MyTurn per vedere i tuoi turni.", "fr": "Ouvrez MyTurn pour voir vos horaires.",
         "de": "Öffne MyTurn, um deine Schichten zu sehen.", "es": "Abre MyTurn para ver tus turnos.",
         "pt": "Abra o MyTurn para ver os seus turnos."][lang] ?? "Open MyTurn to see your shifts."
    }
    static var openPhone: String {
        ["it": "Apri MyTurn sull'iPhone: i turni arriveranno qui.", "fr": "Ouvrez MyTurn sur l'iPhone : vos horaires arriveront ici.",
         "de": "Öffne MyTurn auf dem iPhone: Deine Schichten erscheinen dann hier.", "es": "Abre MyTurn en el iPhone: tus turnos llegarán aquí.",
         "pt": "Abra o MyTurn no iPhone: os turnos vão aparecer aqui."][lang] ?? "Open MyTurn on your iPhone: your shifts will appear here."
    }
    static var description: String {
        ["it": "Il turno di oggi e dei prossimi giorni.", "fr": "Votre horaire du jour et des prochains jours.",
         "de": "Deine Schicht heute und in den nächsten Tagen.", "es": "Tu turno de hoy y de los próximos días.",
         "pt": "O seu turno de hoje e dos próximos dias."][lang] ?? "Today's shift and the next days."
    }
}

extension ShiftData {
    /// Dati di prova per le anteprime e le foto automatiche.
    static var demo: ShiftData {
        let cal = Calendar.current, t0 = cal.startOfDay(for: Date())
        let wd = DateFormatter(); wd.locale = Locale(identifier: "it_IT"); wd.dateFormat = "EEE"
        let plan: [(String, String, String, String, Int, Int)] = [
            ("w", "Mattina", "06:00–14:00", "#f2a900", 6, 14), ("w", "Mattina", "06:00–14:00", "#f2a900", 6, 14),
            ("w", "Pomeriggio", "14:00–22:00", "#ff6b3d", 14, 22), ("r", "Riposo", "", "#9aa1b2", 0, 0),
            ("w", "Notte", "22:00–06:00", "#6a6ff5", 22, 30), ("w", "Notte", "22:00–06:00", "#6a6ff5", 22, 30),
            ("r", "Riposo", "", "#9aa1b2", 0, 0), ("f", "Ferie", "", "#22b062", 0, 0)]
        var days: [ShiftDay] = []
        for i in 0..<14 {
            let d = cal.date(byAdding: .day, value: i, to: t0)!, p = plan[i % plan.count]
            var day = ShiftDay(d: ShiftStore.key(d), wd: wd.string(from: d), dn: String(cal.component(.day, from: d)),
                               k: p.0, t: p.1, h: p.2, c: p.3)
            if p.0 == "w" {
                day.s = d.addingTimeInterval(Double(p.4) * 3600).timeIntervalSince1970 * 1000
                day.e = d.addingTimeInterval(Double(p.5) * 3600).timeIntervalSince1970 * 1000
            }
            if i == 2 { day.x = "Reperibilità 20:00–08:00" }
            days.append(day)
        }
        return ShiftData(v: 1, gen: Date().timeIntervalSince1970 * 1000, lang: "it", days: days,
                         s: ShiftStrings(today: "Oggi", tomorrow: "Domani", next: "Prossimo turno", free: "Libero", app: "MyTurn"))
    }
}

extension Color {
    init(hex: String) {
        var v: UInt64 = 0
        Scanner(string: hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))).scanHexInt64(&v)
        self.init(red: Double((v >> 16) & 0xff) / 255, green: Double((v >> 8) & 0xff) / 255, blue: Double(v & 0xff) / 255)
    }
}
