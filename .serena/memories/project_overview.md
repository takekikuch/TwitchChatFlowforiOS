# TwitchChatFlowforiOS プロジェクト概要

## プロジェクトの目的
iOS Safari Web Extension for displaying Twitch chat comments as Niconico-style danmaku (right-to-left flowing overlay). Chrome拡張機能をベースにiOS Safari用に移植したプロジェクト。

## 主な機能
- Twitchチャットコメントをニコニコ動画風の弾幕（右から左に流れるオーバーレイ）として表示
- Safari Web Extension として実装
- iOS 15.0+ 対応
- リアルタイム設定変更機能

## プロジェクト構成
- **メインアプリ** (TwitchChatFlow): Safari Extension をインストールするためのホストアプリ
- **Safari Web Extension** (TwitchChatFlow Extension): 実際の拡張機能

## 技術的背景
- Chrome拡張機能からの移植プロジェクト
- 参考/ディレクトリに原版のChrome拡張機能コードが保存されている
- Safari ExtensionのiOS制約を考慮した設計

## iOS 18 対応
- iOS 18 Liquid Glass対応アイコンを含む
- Xcode 16ベータ版でのビルドを推奨