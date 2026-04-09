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

## データスキーマ

aa-stock.json:
  version: 1
  items:
    - id: uuid
      title: モナー
      body: "  ∧_∧\n（´∀｀）"
      tags: [キャラ, 2ch]
      created_at: "2026-04-09"
      use_count: 0

aa-presets.json:
  version: 1
  presets:
    - id: preset-001
      name: Twitter/X
      url_pattern: "twitter.com|x.com"
      newline: LF
      space: full

aa-history.json:
  version: 1
  items:
    - id: uuid
      aa_id: uuid
      copied_at: "2026-04-09T10:00:00Z"
      preset_used: Twitter/X

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

## 実装済み機能

- Phase 1：Vercel API + GitHub 同期基盤 完了
- Phase 2：PWA（検索・ストック・コピー・プリセット選択）完了
- Phase 3：Chrome 拡張（popup完結・URL自動判定）完了
- Phase 4：補正プリセット自動判定 完了
- Phase 5：Gemini AA抽出API実装 完了
- Phase 5続き：AA検索・取得UXの設計 未解決

## 未解決課題：AA検索・取得

### 問題
主要なAAまとめサイト（aahub.org等）はSPA（JavaScript動的レンダリング）のため
サーバーサイドfetchではHTMLが空で返ってきてAAを取得できない。

### 検討した方法と結果

| 方法 | 結果 |
|---|---|
| Vercel関数からfetch | SPA非対応。静的サイトのみ取得可能 |
| aahub.org | Please enable JavaScript で取得不可 |
| ascii-art.net | カテゴリ一覧のみ、AA実体は別ページ |
| utf8art.com | SPA、取得不可 |

### 次回検討候補

1. Chrome拡張のcontent scriptでDOM直接読み取り
   - 拡張機能はJS実行後のDOMにアクセス可能
   - ユーザーがAAサイトを開いた状態でボタンを押すとストックに追加
   - 追加実装コストが低い（既存拡張の延長）

2. GitHub Actionsでバッチ収集（Puppeteer）
   - ヘッドレスブラウザで定期収集してJSONに保存
   - PWA・拡張はそのJSONを検索するだけ
   - データが溜まるほど強くなる

3. テキスト検索（Google Custom Search API等）経由
   - 検索結果からAAを抽出するアプローチ
   - 未検証

## 補正プリセット（初期値）

| 名前 | URLパターン | 改行 | スペース |
|---|---|---|---|
| Twitter/X | twitter.com\|x.com | LF | 全角 |
| LINE | line.me | LF | 全角 |
| 5ch | 5ch.net\|2ch.sc | CRLF | 全角 |
| Threads | threads.net | LF | 全角 |

## 開発メモ

- PowerShellではなくBashで作業すること（Codespaces環境）
- catコマンドでファイル書き込み、VSCodeで直接編集も可
- Vercel自動デプロイ：pushすると1〜2分で反映
- git pull --rebase origin main でコンフリクト解消
- package.json に "type": "module" が必須（@octokit/rest がESMのため）
- debug-fetch.js は本番公開前に削除すること
