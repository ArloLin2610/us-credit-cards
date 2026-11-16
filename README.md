# Kabi US（卡比美國版）— 美國信用卡福利比較

中英雙語靜態網站：把美國主要發卡機構的個人信用卡依 **現金回饋／哩程／點數** 分類，附官方卡圖、年費、各類別回饋、開卡禮、海外手續費與官方連結，可挑三張並排比較。
哩程與點數卡會標示「≈ %」約當現金回饋率，並明講是估算。

架構沿用台灣站「卡比」：Astro 靜態站 + React 互動元件 + Tailwind；資料是 repo 內的 JSON；排程程式偵測官網變動後開 PR，**人工審核後才上線**。

## 現況（2026-11-16）

- 10 家發卡機構、122 筆卡片資料；網站顯示 108 張（107 張可申請 + 1 張停止申請紀錄），14 張 `needs_review` 隱藏中（Bank of America 12 張、Amex Hilton Surpass、Barclays Frontier）。
- 各家讀取方式與已知缺口見 [`research/NOTES.md`](research/NOTES.md)。最大的缺口：
  - **Bank of America**：官網需輸入郵遞區號且拒絕自動化瀏覽器，12 張全部待人工核對。
  - **American Express**：開卡禮因人而異，不列；Green 等 4 張產品頁導回總覽，未收錄。
  - 商務卡、多數零售聯名卡未收錄。

## 架構

- **頁面**（英文在根目錄，繁體中文在 `/zh`，互相有 hreflang）：首頁（情境入口／篩選／搜尋／比較）、`/category/{cashback,miles,points}`、`/tags/{tag}`、`/issuers`、`/issuers/{id}`、`/cards/{id}`、`/compare?ids=a,b,c`、`/valuations`（點數估值表）、`/changelog`、`/about`。
- **資料**（唯一資料來源）：
  - `data/issuers.json` — 發卡機構、官方總覽頁、是否需要瀏覽器渲染（`render`）。
  - `data/cards/<issuer>.json` — 卡片。文字欄位一律 `{ "en": …, "zh": … }`；回饋是結構化的（類別 + 倍率），標題、標籤、約當現金回饋都由程式算出，不用手寫。
  - `data/programs.json` — 各哩程／點數計畫的每點估值（美分）、依據與來源。**改這裡就會改全站的「≈ %」。**
  - `data/schema/*.json` — JSON Schema；`npm run build` 前自動驗證。
- **卡圖**：`scripts/fetch-card-images.mjs` 依 `image_url` 下載到 `public/cards/<id>.webp`；沒有圖的卡顯示發卡機構色的示意圖。
- **自動更新**：`.github/workflows/check-updates.yml` 每月 1、15 日執行 `scripts/check-updates.mjs`：
  1. 讀每家的官方總覽頁與每張卡的產品頁（誠實的 User-Agent、遵守 robots.txt；`render: true` 的機構用 headless Chromium）。
  2. 與 `data/snapshots/` 的上次內容比對，偵測：**新卡**、**停止申請**（404／導回總覽頁／頁面出現 “no longer accepting applications” 等字樣）、**權益文字變動**。
  3. 有設 `ANTHROPIC_API_KEY` 時，用 Claude 依 schema 把頁面擷取成資料並寫入；沒設時只偵測並列出差異。
  4. 開 PR（label `needs-review`，內文是證據與文字差異）→ 人工審核合併 → Netlify 自動部署。

## 本機操作

```bash
npm install
npm run dev            # http://localhost:4321
npm run data:validate  # 驗證資料
npm run data:images    # 下載卡圖
npm run data:check -- --no-llm --dry-run   # 試跑官網核對
npm run build
```

## 一次性設定

1. **Netlify**：Add new site → Import from Git → 選這個 repo（`netlify.toml` 已設定）。環境變數 `SITE_URL=https://<網域>`。
2. **GitHub → Settings → Secrets and variables → Actions**：`ANTHROPIC_API_KEY`（選填，按量計費，只有頁面有變動時才呼叫）。Variables 可設 `LLM_MODEL`。
3. **GitHub → Settings → Actions → General → Workflow permissions**：勾選 *Allow GitHub Actions to create and approve pull requests*。
4. **快照基準**：已隨首次提交建立（`data/snapshots/`）；之後排程只回報變化。要重建：Actions →「核對各發卡機構官網」→ Run workflow，勾 `snapshot_only`。

## 日常維運

- **審核 PR**：看 PR 內文（`data/proposals/<date>/REPORT.md`），逐項對來源；不對的地方直接在 PR 改；合併即上線。
- **補資料／清掉待核對**：改 `data/cards/<issuer>.json`，拿掉 `needs_review`，跑 `npm run data:validate`。
- **更新點數估值**：改 `data/programs.json` 的 `cpp` 與 `source.as_of`。
- **新增發卡機構**：`data/issuers.json` 加一筆，再建 `data/cards/<id>.json`。

## 聲明

本站為資訊整理，非財務建議、無推薦連結、不收佣金。卡面圖與商標屬各權利人所有，僅供辨識。回饋與優惠以各發卡機構官網為準。
