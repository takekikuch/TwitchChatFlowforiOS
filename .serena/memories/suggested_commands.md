# 推奨開発コマンド

## ビルドとテスト

### 標準ビルド（Xcode 16ベータ版推奨）
```bash
xcodebuild -project TwitchChatFlow.xcodeproj -scheme TwitchChatFlow -destination 'platform=iOS Simulator,name=iPhone 16 Pro,OS=18.4' build
```

### クリーンビルド
```bash
xcodebuild -project TwitchChatFlow.xcodeproj -scheme TwitchChatFlow -destination 'platform=iOS Simulator,name=iPhone 16 Pro,OS=18.4' clean build
```

## 拡張機能デバッグ手順
1. Xcodeでプロジェクトをビルド・実行
2. Safari > 開発 > [デバイス名] > [Twitchページ]
3. Web Inspectorでコンソールログ確認

## デバッグ確認項目

### 拡張機能読み込み確認
コンソールで以下のログを確認:
- `🎉 Twitch Chat Flow: Extension loaded!`

### 弾幕動作確認  
コンソールで以下のログを確認:
- `🎬 onDanmaku called with:`

## システムコマンド（Darwin環境）

### 基本ファイル操作
- `ls` - ディレクトリ内容表示
- `cd` - ディレクトリ移動
- `find` - ファイル検索
- `grep` - テキスト検索

### Git操作
- `git status` - 作業ツリー状態確認
- `git add` - ステージング
- `git commit` - コミット
- `git log` - コミット履歴確認

### プロジェクト固有
- プロジェクトディレクトリは `/Users/takekikuch/Desktop/App/TwitchChatFlowforiOS`
- Xcodeプロジェクトファイル: `TwitchChatFlow/TwitchChatFlow.xcodeproj`