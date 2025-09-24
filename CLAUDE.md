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

**⚠️ 重要**: この拡張機能は **2つの異なるポップアップシステム** を使用している

#### 1. popup.html（標準WebExtensionポップアップ）
- **ファイル**: `Resources/popup.html`
- **用途**: フォールバック用＋非Twitchページでの設定画面
- **表示方法**: 新しいタブで開く (`browser.tabs.create`)
- **実装**: `browser.i18n.getMessage()`による完全国際化対応
- **動作環境**: 標準的なWebExtension環境全般

#### 2. content.js内の動的ポップアップ（カスタム実装）
- **ファイル**: `content.js` の `showGlobalSettingsPopup()` 関数
- **用途**: **メインの設定UI** - Twitchページ上に直接オーバーレイ表示
- **表示方法**: JavaScriptで動的にHTML生成してTwitchページに注入
- **実装**: `browser.i18n.getMessage()`による完全国際化対応
- **動作環境**: 主にSafari iOS Extension向け

#### ポップアップ選択ロジック（background.js）

```javascript
browser.action.onClicked.addListener(async (tab) => {
    if (tab.url && tab.url.includes('twitch.tv')) {
        try {
            // メイン: content.js内のカスタムポップアップを表示
            await browser.tabs.sendMessage(tab.id, {
                action: 'showSettingsPopup'
            });
        } catch (error) {
            // フォールバック: popup.htmlを新しいタブで開く
            browser.tabs.create({
                url: browser.runtime.getURL('Resources/popup.html')
            });
        }
    } else {
        // Twitch以外: popup.htmlを新しいタブで開く
        browser.tabs.create({
            url: browser.runtime.getURL('Resources/popup.html')
        });
    }
});
```

#### 設定データ管理

- **browser.storage.local** ベースの永続化（Safari Extension制約によりlocalStorageは共有されない）
- **設定同期**: 両方のポップアップが同一の設定データを参照・更新
- **メッセージング**: `browser.tabs.sendMessage`でポップアップ↔コンテンツスクリプト間通信
- デフォルト設定: `fontSize: 24, duration: 7, opacity: 1, danmakuDensity: 2`
- CSSカスタムプロパティ経由でリアルタイム反映

### 重要なアーキテクチャ決定

**なぜ2つのポップアップシステムが必要なのか**:
1. **Safari iOS Extensionの制約**: 標準的な`default_popup`が正しく動作しない場合がある
2. **Twitch統合**: Twitchページ上で直接設定を変更したいユーザー体験
3. **互換性**: 他のブラウザ環境でも確実に動作させるためのフォールバック
4. **`manifest.json`で`default_popup`は意図的に設定しない**: カスタム実装を優先

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