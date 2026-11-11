// Ponte tra la pagina dell'app (wgSync in index.html) e il codice nativo:
// salva i prossimi turni nell'App Group, aggiorna i widget e li manda all'Apple Watch.
import Foundation
import Capacitor
import WidgetKit
import WatchConnectivity

@objc(MyTurnNativePlugin)
public class MyTurnNativePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "MyTurnNativePlugin"
    public let jsName = "MyTurnNative"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setData", returnType: CAPPluginReturnPromise)
    ]

    override public func load() { WatchLink.shared.start() }

    @objc func setData(_ call: CAPPluginCall) {
        guard let json = call.getString("json") else { call.reject("json mancante"); return }
        ShiftStore.save(json)
        WidgetCenter.shared.reloadAllTimelines()
        WatchLink.shared.send(json)
        call.resolve()
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
