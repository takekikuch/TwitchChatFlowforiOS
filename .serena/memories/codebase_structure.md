# コードベース構造

## プロジェクトルート構造
```
TwitchChatFlowforiOS/
├── 参考/                          # Chrome拡張機能の原版コード
├── TwitchChatFlow.xcodeproj/       # Xcodeプロジェクト設定
├── TwitchChatFlow/                 # メインアプリディレクトリ
├── TwitchChatFlow Extension/       # Safari拡張機能ディレクトリ
├── CLAUDE.md                       # プロジェクト詳細ドキュメント
└── firebase-debug.log             # Firebase関連ログ
```

## メインアプリ構造 (TwitchChatFlow/)
```
TwitchChatFlow/
├── TwitchChatFlow/                 # iOS ホストアプリ
│   ├── AppDelegate.swift          # アプリデリゲート
│   ├── SceneDelegate.swift        # シーンデリゲート
│   ├── ViewController.swift       # メインビューコントローラー
│   ├── Info.plist                 # アプリ情報
│   ├── PrivacyInfo.xcprivacy      # プライバシー情報
│   ├── Assets.xcassets/           # アプリアイコン・画像アセット
│   ├── AppIcon_liquid.icon/       # iOS 18 Liquid Glass対応アイコン
│   ├── Base.lproj/                # 基本ローカライゼーション
│   ├── ja.lproj/                  # 日本語ローカライゼーション
│   └── Resources/                 # 説明用画像・HTMLファイル
├── TwitchChatFlowTests/           # 単体テスト
├── TwitchChatFlowUITests/         # UIテスト
└── TwitchChatFlow.xcodeproj/      # Xcodeプロジェクト設定
```

## Safari拡張機能構造 (TwitchChatFlow Extension/)
```
TwitchChatFlow Extension/
├── SafariWebExtensionHandler.swift   # Safari拡張機能ハンドラー
├── Info.plist                        # 拡張機能情報
└── Resources/                         # Web拡張機能リソース
    ├── manifest.json                  # Manifest V3設定
    ├── background.js                  # バックグラウンドスクリプト
    ├── content.js                     # コンテンツスクリプト（メイン）
    ├── default.js                     # 弾幕レンダリングエンジン
    ├── app.css                        # 弾幕アニメーションCSS
    ├── popup.html                     # 設定ポップアップHTML
    └── images/                        # 拡張機能アイコン
        ├── icon-16.png
        ├── icon-48.png
        ├── icon-128.png
        └── ... (その他サイズ)
```

## 重要なファイルの役割

### Safari Web Extension核心ファイル
- **manifest.json**: Manifest V3形式の拡張機能設定
- **content.js**: チャット検出・メッセージング・DOM操作の統合エンジン
- **default.js**: 弾幕レンダリング・アニメーション制御エンジン
- **background.js**: 拡張機能アイコンクリック処理
- **app.css**: 弾幕の右から左への移動アニメーション定義
- **popup.html**: リアルタイム設定変更UI

### iOS ホストアプリ核心ファイル
- **AppDelegate.swift**: アプリライフサイクル管理
- **ViewController.swift**: Safari拡張機能インストール説明UI
- **SafariWebExtensionHandler.swift**: Safari拡張機能とiOSアプリ間通信

### 設定・アセットファイル
- **Assets.xcassets/**: 標準アプリアイコン
- **AppIcon_liquid.icon/**: iOS 18 Liquid Glass対応アイコン
- **ja.lproj/**: 日本語ローカライゼーション
- **Resources/images/**: 拡張機能アイコン（16px, 48px, 128px + 追加サイズ）

## 参考ディレクトリ
Chrome拡張機能の原版コードが保存されており、Safari版への移植の参考として使用