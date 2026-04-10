# AA Copy Tool 引継ぎドキュメント

作成日：2026-04-10

## プロジェクト概要

アスキーアート（AA）を検索・ストック・コピーするツール。
PWA（スマホ対応）と Chrome 拡張（PC）の両対応。

## リポジトリ・デプロイ情報

| 項目 | 内容 |
|---|---|
| GitHub | https://github.com/goroyattemiyo/aa-copy-tool |
| Vercel | https://aa-copy-tool-goroyattemiyos-projects.vercel.app |
| PWA URL | https://aa-copy-tool-goroyattemiyos-projects.vercel.app/pwa/index.html |
| Visibility | Private（個人用フェーズ） |

## 技術スタック

| 役割 | 技術 |
|---|---|
| バックエンド | Vercel サーバーレス関数（ESM） |
| データ管理 | GitHub API（リポジトリ直接） |
| AI抽出 | Gemini 2.5 Flash Lite |
| AA生成 | Gemini 2.0 Flash Lite（generate-aa.js） |
| フロントエンド | Vanilla JS（PWA）、Chrome拡張 MV3 |
| デプロイ | Vercel（GitHub連携、自動デプロイ） |

## 環境変数（Vercel）

| 変数名 | 内容 |
|---|---|
| GITHUB_TOKEN | GitHub Personal Access Token（repoスコープ） |
| GITHUB_OWNER | goroyattemiyo |
| GITHUB_REPO | aa-copy-tool |
| GEMINI_API_KEY | Gemini API キー |

## ディレクトリ構成

    aa-copy-tool/
    ├── api/
    │   ├── stock.js        # AA ストック CRUD（GET/POST/DELETE）
    │   ├── history.js      # コピー履歴（GET/POST、直近50件）
    │   ├── presets.js      # 補正プリセット（GET/POST）
    │   ├── fetch-aa.js     # URL fetch + Gemini AA抽出
    │   ├── generate-aa.js  # テーマ指定AA生成（Gemini）
    │   └── debug-fetch.js  # デバッグ用（本番前に削除推奨）
    ├── data/
    │   ├── aa-stock.json
    │   ├── aa-history.json
    │   └── aa-presets.json
    ├── pwa/
    │   ├── index.html
    │   ├── app.js
    │   ├── style.css
    │   └── manifest.json
    ├── extension/
    │   ├── manifest.json
    │   ├── popup.html
    │   ├── popup.js
    │   └── style.css
    ├── DECISIONS.md
    ├── HANDOVER.md
    └── vercel.json

## API エンドポイント

| エンドポイント | メソッド | 内容 |
|---|---|---|
| /api/stock | GET | ストック一覧取得 |
| /api/stock | POST | ストック追加 |
| /api/stock?id=xxx | DELETE | ストック削除 |
| /api/history | GET | 履歴取得 |
| /api/history | POST | 履歴追加 |
| /api/presets | GET | プリセット一覧取得 |
| /api/presets | POST | プリセット追加 |
| /api/fetch-aa | POST | URL指定でAA抽出（Gemini） |
| /api/generate-aa | POST | テーマ指定でAA生成（Gemini） |

## 実装済み機能

- Phase 1：Vercel API + GitHub 同期基盤 完了
- Phase 2：PWA（検索・ストック・コピー・プリセット選択）完了
- Phase 3：Chrome 拡張（popup完結・URL自動判定）完了
- Phase 4：補正プリセット自動判定 完了
- Phase 5：Gemini AA抽出API実装 完了
- Phase 6：PWA「生成」タブ実装 完了（2026-04-10）

## 未解決課題

### AA生成品質
- Geminiが崩れたAAを返すことがある
- bodyの改行が正しく処理されていない場合がある
- renderCardでbodyをinnerHTMLに直接入れているためエスケープ問題の可能性あり

### 対策候補
1. プロンプトで「シンプルなAAのみ」に絞る
2. AA生成後にバリデーション（行数・文字数チェック）を追加
3. renderCardのbody表示をtextContentに変更してエスケープ処理を入れる

### タイムアウト
- Gemini 2.5 Flash Liteは重くタイムアウトすることがある
- vercel.jsonでmaxDuration: 30を設定済み
- 生成件数を3件・maxOutputTokens: 512に制限済み

## 開発メモ

- PowerShellではテンプレートリテラル（\\）や＄{}が展開されて壊れる
- JSファイルの編集はVSCodeで直接行うか、文字列結合（+）を使ったヒアドキュメントで
- Vercel自動デプロイ：pushすると1〜2分で反映
- git pull --rebase origin main でコンフリクト解消
- package.json に "type": "module" が必須（@octokit/rest がESMのため）
- debug-fetch.js は本番公開前に削除すること
- scripts/generate-aa.js と pwa/generate-tab.js は不要ファイル（削除してよい）
