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
| PWA URL | https://aa-copy-tool-goroyattemiyos-projects.vercel.app/pwa/splash.html |
| Visibility | Private（個人用フェーズ） |

## 技術スタック

| 役割 | 技術 |
|---|---|
| バックエンド | Vercel サーバーレス関数（ESM） |
| データ管理 | GitHub API（リポジトリ直接） |
| フロントエンド | Vanilla JS（PWA）、Chrome拡張 MV3 |
| デプロイ | Vercel（GitHub連携、自動デプロイ） |

## 環境変数（Vercel）

| 変数名 | 内容 |
|---|---|
| GITHUB_TOKEN | GitHub Personal Access Token（repoスコープ） |
| GITHUB_OWNER | goroyattemiyo |
| GITHUB_REPO | aa-copy-tool |
| GEMINI_API_KEY | Gemini API キー（現在未使用） |

## ディレクトリ構成

    aa-copy-tool/
    ├── api/
    │   ├── stock.js        # AA ストック CRUD（GET/POST/DELETE）
    │   ├── history.js      # コピー履歴（GET/POST、直近50件）
    │   ├── presets.js      # 補正プリセット（GET/POST）
    │   └── fetch-aa.js     # URL fetch + Gemini AA抽出（現在未使用）
    ├── data/
    │   ├── aa-stock.json   # 81件のAAストック
    │   ├── aa-history.json
    │   └── aa-presets.json
    ├── pwa/
    │   ├── splash.html     # スプラッシュ画面（起動時に表示）
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

## タブ構成（PWA）

| タブ | 内容 |
|---|---|
| ストック | 検索ボックス付き・全件表示・コピー・プリセット補正 |
| さがす | AAサイトへのリンク集・クリップボードからストック追加 |
| 設定 | 補正プリセット管理 |

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

## 実装済み機能

- Phase 1：Vercel API + GitHub 同期基盤 完了
- Phase 2：PWA（検索・ストック・コピー・プリセット選択）完了
- Phase 3：Chrome 拡張（popup完結・URL自動判定）完了
- Phase 4：補正プリセット自動判定 完了
- Phase 5：Gemini AA抽出API実装 完了
- Phase 6：PWA「さがす」タブ実装 完了（2026-04-10）
- Phase 7：スプラッシュ画面・PWAアイコン実装 完了（2026-04-10）
- Phase 8：シードデータ81件投入 完了（2026-04-10）

## スプラッシュ画面

- pwa/splash.html がエントリーポイント
- AAが左右から飛んで中央で停止→流れるアニメーション（speed 2）
- ターミナル風グリーンカラー（Share Tech Monoフォント）
- アニメーション完了後に自動でindex.htmlへ遷移

## 検索仕様

- 半角・全角カタカナを正規化して検索
- タイトル・body・タグの部分一致
- use_count降順でソート

## さがすタブのリンク集

- Google AA検索
- Twitter/X AA検索
- aahub.org
- 5ch AA板

## クリップボードからストック追加フロー

1. 外部サイトでAAをコピー
2. さがすタブの「クリップボードから読み込む」ボタンを押す
3. タイトル・タグを入力してストックに追加

## 未解決課題

- ストック削除機能がPWAにない
- use_countが更新されない（コピー時にインクリメントしていない）
- Chrome拡張がPWAの変更に追従できていない可能性あり
- fetch-aa.js は現在未使用（SPAサイト非対応のため）

## 開発メモ

- PowerShellではテンプレートリテラルやJS変数展開構文が壊れる
- JSファイルの編集はVSCodeで直接行うか、文字列結合を使う
- Vercel自動デプロイ：pushすると1〜2分で反映
- git pull --rebase origin main でコンフリクト解消
- package.json に type module が必須（@octokit/rest がESMのため）