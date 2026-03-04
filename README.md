# ip-worker-test-site

GitHub Pages から Cloudflare Worker を呼び、アクセス元IPを取得するテスト構成です。

## 構成
- `docs/index.html`: GitHub Pages 側（フロント）
- `worker/src/index.js`: Cloudflare Worker 側（IP取得API）
- `worker/wrangler.toml`: Worker設定

## 1) Worker をデプロイ
```bash
npm install
npx wrangler login
npm run deploy
```

デプロイ後に `https://xxxxx.workers.dev` が出ます。

## 2) GitHub Pages を開く
公開URL:
- https://zikcsy186-eng.github.io/ip-worker-test-site/

ページの入力欄に Worker URL を貼って実行すると、Worker が見ているアクセス元IPを返します。

## メモ
- ブラウザから Worker を直接叩くため、Worker側で CORS を許可しています。
- 本番で保存する場合は D1/KV/外部DB を追加してください。
