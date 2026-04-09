# AA Copy Tool

アスキーアート（AA）を検索・ストック・コピーするツール。
PWA（スマホ対応）と Chrome 拡張（PC）の両対応。

## 機能

- AAまとめサイトからの検索・取得（fetch + AI抽出）
- ストック登録・タグ管理・使用回数による並び替え
- コピー履歴（直近50件）
- 貼り付け先URL自動判定によるプリセット補正
  - 改行コード正規化（CRLF / LF）
  - 全角・半角スペース統一
- PC / スマホ間のデータ同期（GitHub リポジトリ）

## 構成

- PWA：Vercel デプロイ
- Chrome 拡張：Manifest V3
- バックエンド：Vercel サーバーレス関数
- データ：GitHub API 経由で JSON 管理

## データファイル

| ファイル | 内容 |
|---|---|
| data/aa-stock.json | ストック一覧 |
| data/aa-history.json | コピー履歴（直近50件） |
| data/aa-presets.json | 補正プリセット |

## 環境変数（Vercel）

| 変数名 | 内容 |
|---|---|
| GITHUB_TOKEN | GitHub Personal Access Token |
| GITHUB_OWNER | GitHubユーザー名 |
| GITHUB_REPO | このリポジトリ名 |

## ローカル開発

git clone https://github.com/goroyattemiyo/aa-copy-tool
cd aa-copy-tool
npm install
npx vercel dev

## 開発フェーズ

- [ ] Phase 1：Vercel API + GitHub 同期基盤
- [ ] Phase 2：PWA（検索・ストック・コピー）
- [ ] Phase 3：Chrome 拡張（popup完結）
- [ ] Phase 4：補正プリセット自動判定
- [ ] Phase 5：AI抽出・公開対応
