import Cocoa
import WebKit

class AppDelegate: NSObject, NSApplicationDelegate {
    var window: NSWindow!
    
    func applicationDidFinishLaunching(_ aNotification: Notification) {
        // Tell macOS to treat this script as a normal GUI App
        NSApp.setActivationPolicy(.regular)
        
        // Create the window
        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1280, height: 800),
            styleMask: [.titled, .closable, .resizable, .miniaturizable],
            backing: .buffered,
            defer: false
        )
        window.center()
        window.title = "Localhost Preview (http://localhost:8081)"
        
        // Create WebKit View
        let webView = WKWebView(frame: window.contentView!.bounds)
        webView.autoresizingMask = [.width, .height]
        
        // Enable Safari Web Inspector (Right click -> Inspect Element)
        webView.configuration.preferences.setValue(true, forKey: "developerExtrasEnabled")
        
        // Load Localhost
        if let url = URL(string: "http://localhost:8081") {
            webView.load(URLRequest(url: url))
        }
        
        window.contentView?.addSubview(webView)
        window.makeKeyAndOrderFront(nil)
        
        // Force window to front
        NSApp.activate(ignoringOtherApps: true)
    }
    
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true // Quit process when window is closed
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
