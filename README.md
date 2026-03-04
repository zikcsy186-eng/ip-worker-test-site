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

## 2) D1 を作成（初回のみ）
```bash
npx wrangler d1 create visitor_logs
npx wrangler d1 execute visitor_logs --remote --file worker/sql/schema.sql
```

`worker/wrangler.toml` の `database_id` は作成時に出た値に合わせてください。

## 3) IPinfo トークンを設定（企業推定したい場合）
```bash
npx wrangler secret put IPINFO_TOKEN --config worker/wrangler.toml
```

未設定でもIP取得とD1保存は動きますが、企業情報は `null` になります。

## 4) GitHub Pages を開く
公開URL:
- https://zikcsy186-eng.github.io/ip-worker-test-site/

ページの入力欄に Worker URL を貼って実行すると、Worker が見ているアクセス元IPを返します。

## 5) 保存確認
```bash
npx wrangler d1 execute visitor_logs --remote --command "SELECT id, at, ip, event, page_url, country, asn, org, company_name FROM visits ORDER BY id DESC LIMIT 10;"
```

## メモ
- ブラウザから Worker を直接叩くため、Worker側で CORS を許可しています。
- `worker/src/index.js` では `POST` のたびに D1 `visits` テーブルへ保存します。
