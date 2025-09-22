# コードスタイルと規約

## 全般的な規約
- 日本語コメントを使用
- 機能説明や重要な注意点は日本語で記述

## JavaScript/TypeScript
- タブインデント使用
- 日本語コメント使用例: `// 擬似フルスクリーン関連の変数`
- 即座実行関数パターン: `(() => { ... })()`
- camelCase命名規則
- コンスト宣言での明確なスコープ管理

### 変数・関数命名
- 変数: `isPseudoFullscreen`, `danmakuContainer`
- 関数: 動詞から開始（`onDanmaku`, `isDanmakuWorking`）

## CSS
- Block Comment スタイル: `/* Danmaku Container Base Styles */`
- kebab-case for CSS classes: `#danmaku-container`
- 明確なセクション分け

## Swift
- iOS 15.0+ 対応のため `@available(iOS 15.0, *)` アノテーション使用
- Standard Swift naming conventions
- AppDelegate, ViewController等の標準パターン使用

## ファイル構成規約

### Safari Extension Resources
- manifest.json: Manifest V3 形式
- content_scripts.js の順序重要: `["default.js", "content.js"]` (defaultが先)
- action.default_popup は設定せず、動的ポップアップ表示使用

### 設定値
- permissions: `["storage", "activeTab", "tabs"]`
- host_permissions: `["*://*.twitch.tv/*"]`
- デフォルト設定: `fontSize: 24, duration: 7, opacity: 1, danmakuDensity: 2`

## コメント規約
- 機能説明は日本語
- 技術的な制約事項は詳細に記載
- デバッグ用ログには絵文字を使用（🎉, 🎬）

## 設計パターン
- Twitchの頻繁なDOM変更に対応するフォールバックセレクター戦略
- browser.storage.local での設定永続化（Safari Extension制約対応）
- CSS Custom Properties でのリアルタイム設定反映