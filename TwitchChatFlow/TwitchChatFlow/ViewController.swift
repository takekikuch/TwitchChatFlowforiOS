//
//  ViewController.swift
//  TwitchChatFlow
//
//  Created by 菊池タケル on 2025/08/16.
//

import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate, WKScriptMessageHandler {

    @IBOutlet var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        self.webView.navigationDelegate = self
        self.webView.scrollView.isScrollEnabled = true
        self.webView.scrollView.bounces = true
        self.webView.scrollView.alwaysBounceVertical = true

        self.webView.configuration.userContentController.add(self, name: "controller")

        self.webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // Override point for customization.
    }
    
    // 外部リンクをSafariで開くための処理
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        // リンクタップの場合
        if navigationAction.navigationType == .linkActivated {
            // 外部URL（https://）の場合はSafariで開く
            if let url = navigationAction.request.url,
               url.absoluteString.hasPrefix("https://") {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
                decisionHandler(.cancel) // WebView内では開かない
                return
            }
        }
        decisionHandler(.allow) // 通常のナビゲーションは許可
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        // Override point for customization.
    }

}
