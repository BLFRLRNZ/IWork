// Lettura delle foto del foglio dei turni con il riconoscimento del testo di Apple (Vision), tutto sul telefono.
// Restituisce le parole con il loro riquadro in pixel (origine in alto a sinistra), come si aspetta imOcr in index.html.
import Foundation
import Vision
import CoreGraphics

enum ShiftOCR {
    static func words(_ cg: CGImage) throws -> [[String: Any]] {
        let req = VNRecognizeTextRequest()
        req.recognitionLevel = .accurate
        req.usesLanguageCorrection = false      // sigle come "M", "N", "RIP": niente correzioni
        if #available(iOS 16.0, *) { req.automaticallyDetectsLanguage = true }
        try VNImageRequestHandler(cgImage: cg, orientation: .up, options: [:]).perform([req])
        let W = Double(cg.width), H = Double(cg.height)
        var out: [[String: Any]] = []
        for obs in req.results ?? [] {
            guard let cand = obs.topCandidates(1).first else { continue }
            let s = cand.string
            var i = s.startIndex
            // una parola alla volta (separate da spazi), ognuna con il suo riquadro
            while i < s.endIndex {
                if s[i].isWhitespace { i = s.index(after: i); continue }
                var j = i
                while j < s.endIndex && !s[j].isWhitespace { j = s.index(after: j) }
                if let box = try? cand.boundingBox(for: i..<j) {
                    let b = box.boundingBox
                    out.append(["s": String(s[i..<j]), "x0": Double(b.minX) * W, "x1": Double(b.maxX) * W,
                                "y0": (1 - Double(b.maxY)) * H, "y1": (1 - Double(b.minY)) * H])
                }
                i = j
            }
        }
        return out
    }
}
