# AA Copy Tool - HANDOVER.md
最終更新：2026-04-11

## リポジトリ・デプロイ情報
- GitHub: https://github.com/goroyattemiyo/aa-copy-tool
- Vercel: https://aa-copy-tool-goroyattemiyos-projects.vercel.app
- PWA URL: https://aa-copy-tool-goroyattemiyos-projects.vercel.app/pwa/splash.html

## 今日やったこと
- aahub.orgのDOM構造調査完了
  - .u-aa クラスにAAが入っている（104件取得可能）
  - el.innerText でAAテキストを取得
  - document.querySelector("h1").textContent でページタイトル取得
- Chrome拡張にcontent script追加（extension/content_aahub.js）
  - aahubページ右下にフローティングボタンを表示
  - ボタン押下で全AAを一括ストックに追加
- api/stock.js にCORSヘッダー追加（aahubからのfetch対応）

## 未解決
- aahubページからのPOSTが500エラーになる場合がある
  - curlでは正常動作確認済み
  - ブラウザのCORS preflight経由だと失敗するケースあり
  - 次回：aahubのConsoleで直接fetchテストして原因特定

## ディレクトリ構成
aa-copy-tool/
  api/
    stock.js        # CORS対応済み
    history.js
    presets.js
    fetch-aa.js
  data/
    aa-stock.json
    aa-history.json
    aa-presets.json
  pwa/
    splash.html
    index.html
    app.js
    style.css
    manifest.json
  extension/
    manifest.json     # content_scripts追加済み
    content_aahub.js  # 新規追加
    popup.html
    popup.js
    style.css
  DECISIONS.md
  HANDOVER.md
  vercel.json

## 次回やること
1. aahubからのPOST 500エラーの原因特定・修正
2. 動作確認後、ケロロ軍曹など好きなキャラのAAを一括取込
