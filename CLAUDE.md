# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

iOS Safari Web Extension for displaying Twitch chat comments as Niconico-style danmaku (right-to-left flowing overlay). Chrome拡張機能をベースにiOS Safari用に移植したプロジェクト。

## アーキテクチャ

### 2つのTarget構成

1. **TwitchChatFlow (メインアプリ)**: Safari Extension をインストールするためのホストアプリ
2. **TwitchChatFlow Extension**: 実際のSafari Web Extension

### Safari Web Extension の核心部分

**ファイル分離の仕組み**:
- Extension root: `manifest.json`, `app.js`, `default.js`, `app.css` - Safari必須ファイル
- Resources/: アイコン、ポップアップ、バックグラウンドスクリプト - 従来の拡張機能ファイル

この分離は Safari Web Extension の制約により必要。

### 弾幕システムの動作

**3つの主要コンポーネント**:

1. **app.js** - チャット検出エンジン
   - 複数のCSSセレクターでTwitchのDOM変更に対応
   - MutationObserverベースでリアルタイム検出
   - `isDanmakuWorking()` でコンテナ状態監視

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

- localStorage ベースの永続化
- デフォルト設定: `fontSize: 24, duration: 7, opacity: 1, danmakuDensity: 2`
- CSSカスタムプロパティ経由でリアルタイム反映

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

- `content_scripts.css`: Extension root の "app.css" を参照
- `content_scripts.js`: Extension root の ["default.js", "app.js"] を参照（順序重要）
- Resourcesパスとrootパスの混在設計

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
- **CSS適用されない**: manifest.json の css パス確認、Extension root 配置確認

## プロジェクト履歴

Chrome拡張機能からの移植プロジェクト。参考/ ディレクトリに原版のChrome拡張機能コードが保存されている。