# 技術スタックとアーキテクチャ

## 技術スタック
- **iOS**: Swift (iOS 15.0+)
- **Safari Web Extension**: Manifest V3
- **フロントエンド**: JavaScript, CSS, HTML
- **開発環境**: Xcode 16ベータ版推奨
- **ビルドシステム**: Xcode プロジェクト

## アーキテクチャ概要

### 2つのTarget構成
1. **TwitchChatFlow (メインアプリ)**: Safari Extension をインストールするためのホストアプリ
2. **TwitchChatFlow Extension**: 実際のSafari Web Extension

### Safari Web Extension の核心コンポーネント

#### ファイル構成
- `Resources/manifest.json`: 拡張機能の設定ファイル（Manifest V3）
- `Resources/content.js`: メインコンテンツスクリプト（チャット検出とメッセージング）
- `Resources/default.js`: 弾幕レンダリングエンジン
- `Resources/background.js`: バックグラウンドスクリプト（action.onClickedハンドラー）
- `Resources/popup.html`: 設定用ポップアップUI
- `Resources/app.css`: 弾幕アニメーション定義

#### 3つの主要コンポーネント

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