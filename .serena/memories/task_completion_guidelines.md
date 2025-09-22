# タスク完了時のガイドライン

## 開発タスク完了後の必須チェック項目

### 1. ビルド確認
```bash
# 標準ビルドコマンド実行
xcodebuild -project TwitchChatFlow.xcodeproj -scheme TwitchChatFlow -destination 'platform=iOS Simulator,name=iPhone 16 Pro,OS=18.4' build
```

### 2. 拡張機能動作テスト
1. Xcodeでプロジェクトをビルド・実行
2. Safari で Twitch サイトにアクセス
3. Safari > 開発 > [デバイス名] > [Twitchページ] でWeb Inspector起動
4. コンソールで必要なログが出力されることを確認:
   - `🎉 Twitch Chat Flow: Extension loaded!` 
   - `🎬 onDanmaku called with:` (弾幕動作時)

### 3. Safari Extension設定確認
- 拡張機能アイコンタップでポップアップが表示される
- 設定変更が即座に反映される
- browser.storage.local での設定永続化が機能する

### 4. 特別な注意事項

#### iOS制約対応確認
- `@available(iOS 15.0, *)` アノテーションが適切に使用されている
- Safari ExtensionのiOS制約に適合している

#### Twitch DOM対応確認
- 複数のCSSセレクターフォールバック戦略が機能している
- DOM変更に対して適切に対応できている

#### Manifest V3準拠確認
- content_scripts.js の読み込み順序が正しい: `["default.js", "content.js"]`
- action.default_popup は使用せず、動的ポップアップ表示を使用
- 必要な permissions と host_permissions が設定されている

### 5. アイコン・アセット確認
- iOS 18 Liquid Glass対応アイコンが適切に配置されている
- Safari拡張機能アイコン（16px, 48px, 128px）が正しく参照されている

### 6. デバッグ情報の確認
- 適切なデバッグログが出力されている
- エラーや警告がコンソールに表示されていない

### 7. コミット前チェック
- CLAUDE.md の内容と一致しているか確認
- 日本語コメントが適切に記載されているか確認
- 技術的制約やトラブルシューティング情報が更新されているか確認

## 問題発生時の対処
### よくある問題と解決策
- **弾幕が途中で消える**: `isDanmakuWorking()` の頻繁な再初期化が原因。monitoring interval を調整
- **チャット検出されない**: Twitch DOM変更により新しいセレクターが必要
- **設定が保存されない**: Safari Extensionでは`localStorage`が共有されないため、`browser.storage.local`使用必須
- **ポップアップが表示されない**: `manifest.json`で`default_popup`と`action.onClicked`は競合する
- **メッセージが届かない**: content script と background script の通信にはtabs.sendMessage使用