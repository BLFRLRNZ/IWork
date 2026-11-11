// Il controller di Capacitor con in più il plugin MyTurnNative (registrato a mano: è codice dell'app, non un pacchetto).
import UIKit
import Capacitor

class MyTurnViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(MyTurnNativePlugin())
    }
}
