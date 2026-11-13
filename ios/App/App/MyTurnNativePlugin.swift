// Ponte tra la pagina dell'app (wgSync in index.html) e il codice nativo:
// salva i prossimi turni nell'App Group, aggiorna i widget e li manda all'Apple Watch.
import Foundation
import UIKit
import Capacitor
import WidgetKit
import WatchConnectivity

@objc(MyTurnNativePlugin)
public class MyTurnNativePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "MyTurnNativePlugin"
    public let jsName = "MyTurnNative"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setData", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "alarmState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "alarmRequest", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setAlarms", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "ocr", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "takeLink", returnType: CAPPluginReturnPromise)
    ]

    override public func load() { WatchLink.shared.start() }

    @objc func setData(_ call: CAPPluginCall) {
        guard let json = call.getString("json") else { call.reject("json mancante"); return }
        ShiftStore.save(json)
        WidgetCenter.shared.reloadAllTimelines()
        WatchLink.shared.send(json)
        ShiftLive.update()
        if #available(iOS 18.0, *) { ControlCenter.shared.reloadAllControls() }
        call.resolve()
    }

    // foglio dei turni: parole lette dalla foto (Vision), vedi imOcr in index.html
    @objc func ocr(_ call: CAPPluginCall) {
        guard let b64 = call.getString("data"), let data = Data(base64Encoded: b64),
              let img = UIImage(data: data), let cg = img.cgImage else { call.reject("immagine"); return }
        DispatchQueue.global(qos: .userInitiated).async {
            do { call.resolve(["words": try ShiftOCR.words(cg)]) } catch { call.reject("ocr") }
        }
    }

    // aperta dal Centro di Controllo: la pagina mostra il mese di oggi
    @objc func takeLink(_ call: CAPPluginCall) {
        let d = ShiftStore.defaults
        if d.bool(forKey: MYTURN_OPEN_TODAY) { d.set(false, forKey: MYTURN_OPEN_TODAY); call.resolve(["url": "myturn://today"]) }
        else { call.resolve([:]) }
    }

    // sveglie (AlarmKit, iOS 26+)
    @objc func alarmState(_ call: CAPPluginCall) {
        call.resolve(["state": ShiftAlarms.state()])
    }

    @objc func alarmRequest(_ call: CAPPluginCall) {
        Task { call.resolve(["state": await ShiftAlarms.request()]) }
    }

    @objc func setAlarms(_ call: CAPPluginCall) {
        let items = (call.getArray("items") ?? []).compactMap { $0 as? [String: Any] }
        let stop = call.getString("stop") ?? "Stop", snooze = call.getString("snooze") ?? "Snooze"
        Task { call.resolve(["scheduled": await ShiftAlarms.replace(items, stop: stop, snooze: snooze)]) }
    }
}

/// Collegamento con l'app dell'Apple Watch: manda sempre l'ultima versione dei turni.
final class WatchLink: NSObject, WCSessionDelegate {
    static let shared = WatchLink()

    func start() {
        guard WCSession.isSupported() else { return }
        WCSession.default.delegate = self
        WCSession.default.activate()
    }

    func send(_ json: String) {
        guard WCSession.isSupported() else { return }
        let s = WCSession.default
        guard s.activationState == .activated, s.isPaired, s.isWatchAppInstalled else { return }
        try? s.updateApplicationContext(["json": json])
    }

    func session(_ session: WCSession, activationDidCompleteWith state: WCSessionActivationState, error: Error?) {
        if state == .activated, let json = ShiftStore.defaults.string(forKey: MYTURN_KEY) { send(json) }
    }
    func sessionDidBecomeInactive(_ session: WCSession) {}
    func sessionDidDeactivate(_ session: WCSession) { WCSession.default.activate() }
}
