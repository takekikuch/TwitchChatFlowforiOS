import SafariServices
import Foundation

@available(iOS 15.0, *)
class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    
    func beginRequest(with context: NSExtensionContext) {
        let item = context.inputItems.first as? NSExtensionItem
        let message = item?.userInfo?[SFExtensionMessageKey]
        
        // Handle messages from content script
        if let messageDict = message as? [String: Any] {
            handleMessage(messageDict, context: context)
        } else {
            // Return empty response
            let response = NSExtensionItem()
            response.userInfo = [SFExtensionMessageKey: [:]]
            context.completeRequest(returningItems: [response], completionHandler: nil)
        }
    }
    
    private func handleMessage(_ message: [String: Any], context: NSExtensionContext) {
        let messageType = message["type"] as? String ?? ""
        
        switch messageType {
        case "getSettings":
            handleGetSettings(context: context)
        case "setSettings":
            if let settings = message["settings"] as? [String: Any] {
                handleSetSettings(settings: settings, context: context)
            } else {
                sendErrorResponse(context: context, error: "Invalid settings data")
            }
        default:
            sendErrorResponse(context: context, error: "Unknown message type")
        }
    }
    
    private func handleGetSettings(context: NSExtensionContext) {
        // Return default settings for now
        let defaultSettings: [String: Any] = [
            "mode": "default",
            "enabled": true,
            "showUsername": true,
            "fontSize": 24,
            "duration": 7,
            "opacity": 1,
            "danmakuDensity": 2,
            "textDecoration": "none",
            "bold": false,
            "font": "Default"
        ]
        
        let response = NSExtensionItem()
        response.userInfo = [SFExtensionMessageKey: [
            "type": "settingsResponse",
            "settings": defaultSettings
        ]]
        
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
    
    private func handleSetSettings(settings: [String: Any], context: NSExtensionContext) {
        // Store settings (for now just acknowledge)
        // In a full implementation, you would save to UserDefaults or Core Data
        
        let response = NSExtensionItem()
        response.userInfo = [SFExtensionMessageKey: [
            "type": "settingsUpdateResponse",
            "success": true
        ]]
        
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
    
    private func sendErrorResponse(context: NSExtensionContext, error: String) {
        let response = NSExtensionItem()
        response.userInfo = [SFExtensionMessageKey: [
            "type": "error",
            "message": error
        ]]
        
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
}