# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

iOS Safari Web Extension for displaying Twitch chat comments as Niconico-style danmaku (right-to-left flowing overlay). Chrome拡張機能をベースにiOS Safari用に移植したプロジェクト。

## アーキテクチャ

### 2つのTarget構成

1. **TwitchChatFlow (メインアプリ)**: Safari Extension をインストールするためのホストアプリ
2. **TwitchChatFlow Extension**: 実際のSafari Web Extension

### Safari Web Extension の核心部分

**ファイル構成**:
- `Resources/manifest.json`: 拡張機能の設定ファイル（Manifest V3）
- `Resources/content.js`: メインコンテンツスクリプト（チャット検出とメッセージング）
- `Resources/default.js`: 弾幕レンダリングエンジン
- `Resources/background.js`: バックグラウンドスクリプト（action.onClickedハンドラー）
- `Resources/popup.html`: 設定用ポップアップUI
- `Resources/app.css`: 弾幕アニメーション定義

### 弾幕システムの動作

**3つの主要コンポーネント**:

1. **content.js** - 統合チャット検出・メッセージングエンジン
   - 複数のCSSセレクターでTwitchのDOM変更に対応
   - `browser.runtime.onMessage` でポップアップとの通信
   - `browser.storage.local` での設定同期
   - グローバルポップアップ表示機能

2. **default.js** - 弾幕レンダリングエンジン
   - `window._twitchChatDanmaku['default']` でグローバル登録
   - スタック管理で垂直位置調整
   - CSS Custom Properties (`--stack`, `--length`) でアニメーション制御

3. **app.css** - アニメーション定義
   - `@keyframes danmaku-move-default` で右から左の移動
   - `transform: translate3d()` でハードウェアアクセラレーション

### DOM セレクター戦略

Twitchの頻繁なDOM変更に対応するため、複数フォールバックセレクターを使用:

```javascript
const CHAT_CONTAINER_SELECTORS = [
  '[data-test-selector="chat-scrollable-area__message-container"]', // 最新
  '.chat-scrollable-area__message-container', // フォールバック
  // ... その他のフォールバック
];
```

### 設定システム

- **browser.storage.local** ベースの永続化（Safari Extension制約によりlocalStorageは共有されない）
- **ポップアップUI**: 拡張機能アイコンタップで表示、設定即座反映
- **メッセージング**: ポップアップ ↔ コンテンツスクリプト間で設定同期
- デフォルト設定: `fontSize: 24, duration: 7, opacity: 1, danmakuDensity: 2`
- CSSカスタムプロパティ経由でリアルタイム反映

### 重要なアーキテクチャ決定

**ポップアップ表示方式**:
- `manifest.json` で `default_popup` は設定しない
- `browser.action.onClicked` イベントでコンテンツスクリプト内のポップアップを表示
- これによりSafari ExtensionのiOS制約を回避

## 開発時の注意点

### XcodeGen設定の重要な部分 (project.yml)

```yaml
sources:
  - path: TwitchChatFlow/Extension
    excludes:
      - "Resources/**"  #重複ファイル参照を回避
resources:
  - path: TwitchChatFlow/Extension/Resources
  - path: TwitchChatFlow/Extension/manifest.json  # Extensionルートから明示的に含める
  - path: TwitchChatFlow/Extension/app.js
  - path: TwitchChatFlow/Extension/default.js
  - path: TwitchChatFlow/Extension/app.css
```

### manifest.json の Safari 固有設定

- **Manifest V3** 形式使用
- `content_scripts.js`: `["default.js", "content.js"]` の順序が重要（defaultが先）
- `action.default_popup` は設定せず、クリックイベントで動的ポップアップ表示
- `permissions`: `["storage", "activeTab", "tabs"]` でブラウザAPI使用
- `host_permissions`: `["*://*.twitch.tv/*"]` でTwitchサイトアクセス

### デバッグ

Safari の Web Inspector でコンテンツスクリプトをデバッグ:
1. Safari > 開発 > [デバイス名] > [ページ名]
2. コンソールで `🎉 Twitch Chat Flow: Extension loaded!` 確認
3. 弾幕動作確認: `🎬 onDanmaku called with:` ログ

### iOS 15.0+ 要件

- `SFExtensionMessageKey` API制約により iOS 15.0+ 必須
- `@available(iOS 15.0, *)` アノテーション必要

## トラブルシューティング

- **弾幕が途中で消える**: `isDanmakuWorking()` の頻繁な再初期化が原因。monitoring interval を調整
- **チャット検出されない**: Twitch DOM変更により新しいセレクターが必要
- **設定が保存されない**: Safari Extensionでは`localStorage`が共有されないため、`browser.storage.local`使用必須
- **ポップアップが表示されない**: `manifest.json`で`default_popup`と`action.onClicked`は競合する
- **メッセージが届かない**: content script と background script の通信にはtabs.sendMessage使用

### アイコン管理

**iOS 18 Liquid Glass対応**:
- `AppIcon_liquid.icon`ファイルはTwitchChatFlowディレクトリ直下に配置
- Xcode 16ベータ版が必要（通常版ではコンパイルエラー）
- App Icons and Launch Screen設定で "AppIcon_liquid" を指定

**Safari拡張機能アイコン**:
- `TwitchChatFlow Extension/Resources/images/`内のアイコンファイル
- manifest.jsonで16px、48px、128pxを参照
- 追加サイズ（64px、96px、256px、512px）も生成済み

## 開発コマンド

### ビルドとテスト
```bash
# 標準ビルド（Xcode 16ベータ版推奨）
xcodebuild -project TwitchChatFlow.xcodeproj -scheme TwitchChatFlow -destination 'platform=iOS Simulator,name=iPhone 16 Pro,OS=18.4' build

# クリーンビルド
xcodebuild -project TwitchChatFlow.xcodeproj -scheme TwitchChatFlow -destination 'platform=iOS Simulator,name=iPhone 16 Pro,OS=18.4' clean build
```

### 拡張機能デバッグ
1. Xcodeでプロジェクトをビルド・実行
2. Safari > 開発 > [デバイス名] > [Twitchページ]
3. Web Inspectorでコンソールログ確認

## プロジェクト履歴

Chrome拡張機能からの移植プロジェクト。参考/ ディレクトリに原版のChrome拡張機能コードが保存されている。