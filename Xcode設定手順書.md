# TwitchChatFlow iOS Safari Extension - Xcode設定手順書

## 🐱 現在の状況
ファイル構造は完璧に整理されています！以下の手順でXcodeプロジェクトを完成させてください。

## 📁 現在のファイル構造
```
TwitchChatFlow/
├── TwitchChatFlow.xcodeproj/ (作成済みプロジェクト)
├── TwitchChatFlow/
│   ├── AppDelegate.swift ✅ 作成完了
│   ├── SceneDelegate.swift ✅ 作成完了
│   ├── ViewController.swift ✅ 作成完了
│   ├── Assets.xcassets/
│   └── Base.lproj/
│       ├── Main.storyboard ✅ 作成完了
│       └── LaunchScreen.storyboard ✅ 作成完了
└── TwitchChatFlow Extension/
    ├── SafariWebExtensionHandler.swift ✅ 作成完了
    ├── Info.plist ✅ 作成完了
    └── Resources/
        ├── manifest.json ✅ 機能完備
        ├── js/
        │   ├── app.js ✅ メッセージリスナー対応
        │   ├── default.js ✅ 弾幕エンジン
        │   └── background.js ✅ バックグラウンドスクリプト
        ├── css/app.css ✅ 弾幕スタイル
        ├── images/ ✅ アイコンファイル
        └── popup.html ✅ 設定ポップアップ
```

## 🔧 Xcode設定手順

### ステップ1: メインプロジェクトの設定

1. **Xcodeで TwitchChatFlow.xcodeproj を開く**

2. **古いSwiftUIファイルを削除**
   - `TwitchChatFlowApp.swift` （既に削除済み）
   - `ContentView.swift` （既に削除済み）

3. **新しいファイルをプロジェクトに追加**
   - 左のプロジェクトナビゲーターで「TwitchChatFlow」フォルダを右クリック
   - 「Add Files to "TwitchChatFlow"...」を選択
   - 以下のファイルを選択して追加：
     - `AppDelegate.swift`
     - `SceneDelegate.swift` 
     - `ViewController.swift`
     - `Base.lproj` フォルダ全体

4. **Info.plistを更新**
   - プロジェクトのInfo.plistを削除
   - 作成済みの `TwitchChatFlow/Info.plist` をプロジェクトに追加

5. **プロジェクト設定を変更**
   - プロジェクト設定で「TwitchChatFlow」target を選択
   - General > Deployment Info > Interface を **Storyboard** に変更
   - Main Interface を **Main** に設定

### ステップ2: Safari Extension Targetの追加

1. **新しいTargetを追加**
   - Project Navigator でプロジェクト名をクリック
   - 下部の「+」ボタンをクリック
   - **iOS > Safari Extension** を選択
   - Product Name: **TwitchChatFlow Extension**
   - Bundle Identifier: **com.takekikuch.TwitchChatFlow.Extension**
   - 「Finish」をクリック

2. **生成されたファイルを削除**
   - Xcodeが自動生成した以下のファイルを削除：
     - `SafariWebExtensionHandler.swift`
     - `Resources` フォルダ全体
     - `Info.plist`

3. **準備済みファイルを追加**
   - 「TwitchChatFlow Extension」targetを右クリック
   - 「Add Files to "TwitchChatFlow Extension"...」を選択
   - `TwitchChatFlow Extension` フォルダ全体を選択して追加
   - **Target Membershipで「TwitchChatFlow Extension」にチェック**

### ステップ3: プロジェクト設定

1. **Bundle Identifierの設定**
   - TwitchChatFlow target: `com.takekikuch.TwitchChatFlow`
   - TwitchChatFlow Extension target: `com.takekikuch.TwitchChatFlow.Extension`

2. **Deployment Targetの設定**
   - 両方のtargetで **iOS 15.0** に設定

3. **Development Teamの設定**
   - 両方のtargetでDevelopment Teamを設定

4. **Info.plist設定の確認**
   - Extension の Info.plist で以下が正しく設定されているか確認：
     ```xml
     <key>NSExtension</key>
     <dict>
         <key>NSExtensionPointIdentifier</key>
         <string>com.apple.Safari.web-extension</string>
         <key>NSExtensionPrincipalClass</key>
         <string>$(PRODUCT_MODULE_NAME).SafariWebExtensionHandler</string>
         <key>SFSafariWebsiteAccess</key>
         <dict>
             <key>Level</key>
             <string>Some</string>
             <key>Allowed Domains</key>
             <array>
                 <string>twitch.tv</string>
                 <string>*.twitch.tv</string>
             </array>
         </dict>
     </dict>
     ```

### ステップ4: ビルドとテスト

1. **Clean Build Folder**
   - Product > Clean Build Folder

2. **ビルド**
   - Scheme を「TwitchChatFlow」に設定
   - iOS Simulator を選択してビルド

3. **テスト**
   - iOS Simulatorでアプリを起動
   - Settings > Safari > Extensions で拡張機能を有効化
   - Twitch.tvで弾幕機能をテスト

## 🚨 注意点

- **Target Membership**: 各ファイルが正しいtargetに属していることを確認
- **Bundle Identifier**: メインアプリと拡張機能で一貫性を保つ
- **Deployment Target**: iOS 15.0以降に設定
- **Development Team**: 両方のtargetで同じチームを設定

## 🎉 完了後の確認

- [ ] アプリがビルドできる
- [ ] iOS Simulatorで起動できる
- [ ] Safari Settings で拡張機能が表示される
- [ ] Twitch.tvで弾幕が表示される
- [ ] 拡張機能タップで設定ポップアップが開く

何か問題があれば、Claudeに報告してください！🐱