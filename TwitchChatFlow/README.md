# Twitch Chat Flow for iOS Safari

Twitchのコメントをニコニコ動画風に画面上で右から左に流すiOS Safari拡張機能にゃ！

## 概要

このプロジェクトは、既存のChrome拡張機能をベースにiOS Safari用に移植したものです。最小限の機能でTwitchチャットの弾幕表示を実現します。

## 主な機能

- ✅ Twitchのチャットコメントを画面上で右から左に流す
- ✅ 複数のコメントを縦に分散配置
- ✅ アニメーション速度の調整
- ✅ iOS Safari での動作

## プロジェクト構成

```
TwitchChatFlow/
├── App/                          # メインiOSアプリ
│   ├── AppDelegate.swift
│   ├── SceneDelegate.swift
│   ├── ViewController.swift
│   └── Info.plist
├── Extension/                    # Safari Web Extension
│   ├── SafariWebExtensionHandler.swift
│   ├── Info.plist
│   └── Resources/
│       ├── manifest.json         # 拡張機能マニフェスト
│       ├── popup.html           # ポップアップUI
│       ├── js/
│       │   ├── app.js           # メインロジック
│       │   ├── default.js       # 弾幕アニメーション
│       │   └── background.js    # バックグラウンド処理
│       ├── css/
│       │   └── app.css          # スタイル・アニメーション定義
│       └── images/              # アイコン画像（要追加）
└── README.md
```

## Xcodeプロジェクトの作成手順

### 1. 新しいXcodeプロジェクトを作成

1. Xcodeを開く
2. "Create a new Xcode project" を選択
3. **iOS** タブを選択
4. **App** テンプレートを選択
5. プロジェクト情報を入力:
   - Product Name: `TwitchChatFlow`
   - Bundle Identifier: `com.yourname.TwitchChatFlow`
   - Language: `Swift`
   - Use Core Data: チェックなし
   - Include Tests: チェックなし

### 2. Safari Web Extension Targetを追加

1. プロジェクトナビゲータでプロジェクト名をクリック
2. **+** ボタンをクリックして新しいTargetを追加
3. **macOS** タブを選択して **Safari Extension** を選択
4. Target情報を入力:
   - Product Name: `TwitchChatFlow Extension`
   - Bundle Identifier: `com.yourname.TwitchChatFlow.Extension`
   - Language: `Swift`

### 3. ファイルの配置

#### メインアプリファイル
- `App/AppDelegate.swift` → プロジェクトの `AppDelegate.swift` を置き換え
- `App/SceneDelegate.swift` → プロジェクトの `SceneDelegate.swift` を置き換え  
- `App/ViewController.swift` → プロジェクトの `ViewController.swift` を置き換え
- `App/Info.plist` → メインアプリの `Info.plist` を更新

#### Safari Extension ファイル
- `Extension/SafariWebExtensionHandler.swift` → Extension Targetに追加
- `Extension/Info.plist` → Extension Targetの `Info.plist` を更新
- `Extension/Resources/` 内のすべてのファイル → Extension Target の Resources に追加

### 4. アイコンファイルの追加

以下のサイズのアイコンファイルを用意し、`Extension/Resources/images/` に配置:
- `icon-16.png` (16x16)
- `icon-48.png` (48x48)  
- `icon-128.png` (128x128)

### 5. Bundle Identifierの設定

1. プロジェクト設定で各Targetを選択
2. **Signing & Capabilities** タブを開く
3. Team を選択
4. Bundle Identifier が一意であることを確認

## 動作確認手順

### 1. Xcodeでビルド・実行

1. **TwitchChatFlow** スキーマを選択
2. iOS Simulatorまたは実機を選択
3. **⌘+R** でビルド・実行

### 2. Safari設定で拡張機能を有効化

#### iOS実機の場合:
1. 設定アプリを開く
2. **Safari** → **機能拡張** を選択
3. **Twitch Chat Flow** を有効にする
4. **twitch.tv** へのアクセスを許可

#### iOS Simulatorの場合:
1. Safari を開く
2. **Safari** メニュー → **設定...** を選択
3. **機能拡張** タブを選択
4. **Twitch Chat Flow** を有効にする

### 3. Twitchでテスト

1. Safariで [https://www.twitch.tv](https://www.twitch.tv) を開く
2. 任意のライブ配信を選択
3. チャットが流れているのを確認
4. 新しいコメントが画面上で右から左に流れることを確認

## トラブルシューティング

### 拡張機能が表示されない場合
- Xcodeでビルドが成功していることを確認
- Bundle Identifier が重複していないか確認
- iOS/macOS の対応バージョンを確認

### アニメーションが動作しない場合
- Safariの開発者コンソールでJavaScriptエラーを確認
- manifest.json の content_scripts 設定を確認
- CSS ファイルが正しく読み込まれているか確認

### 権限エラーが発生する場合
- Info.plist の `SFSafariWebsiteAccess` 設定を確認
- Twitchサイトへのアクセス権限が許可されているか確認

## 技術仕様

- **対応プラットフォーム**: iOS 14.0+, macOS 11.0+
- **開発言語**: Swift 5.0+, JavaScript ES6+
- **依存関係**: SafariServices.framework
- **ベース**: Chrome拡張機能からの移植

## 開発者向け情報

### 主要コンポーネント

1. **app.js**: Twitchページの解析とチャット検出
2. **default.js**: 弾幕アニメーションエンジン  
3. **app.css**: CSS アニメーション定義
4. **SafariWebExtensionHandler.swift**: ネイティブ・JS間通信

### カスタマイズ可能な設定

- `fontSize`: フォントサイズ (デフォルト: 24px)
- `duration`: アニメーション時間 (デフォルト: 7秒)
- `opacity`: 透明度 (デフォルト: 1.0)
- `danmakuDensity`: 弾幕密度 (デフォルト: 2)

## ライセンス

このプロジェクトはChrome拡張機能をベースにした教育・実験目的のものです。

## 貢献

バグ報告や機能改善の提案は GitHub Issues をご利用ください。

---
😸 Twitchでニコニコ動画みたいにコメントが流れるにゃ〜！