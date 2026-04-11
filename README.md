# GitHub Trophies

GitHub の統計情報をカード形式で README に表示するツール。

![Demo](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=18&theme=noir)

- ユーザーアバター・名前・bio・ランク (CDF パーセンタイル)
- Commits / PRs / Issues / Stars / Repos / Experience
- 1年間の Contribution グラフ (GitHub GraphQL API)
- 言語ドーナツチャート + devicon / Simple Icons ロゴ
- 32 カラーテーマ

---

## セットアップ

### 1. このリポジトリをフォーク

このリポジトリ右上の **Fork** ボタンを押してください。

### 2. Vercel にデプロイ

1. [vercel.com](https://vercel.com) にGitHubアカウントでログイン
2. **Add New Project** をクリック
3. フォークした `github-trophies` リポジトリを Import
4. そのまま **Deploy** を押す（設定変更不要）

デプロイが完了すると `https://github-trophies-xxxxx.vercel.app` のようなURLが発行されます。

### 3. GITHUB_TOKEN を設定

Contribution グラフの表示と API レート制限の緩和に必要です。

1. [GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens) にアクセス
2. **Generate new token (classic)** をクリック
3. `read:user` スコープにチェックを入れて生成
4. Vercel のプロジェクト > **Settings** > **Environment Variables** で以下を追加:
   - Name: `GITHUB_TOKEN`
   - Value: 生成したトークン
5. **Deployments** タブから **Redeploy** を実行

---

## 使い方

デプロイ後の URL を使って README に以下を追加:

```markdown
![GitHub Stats](https://あなたのプロジェクト名.vercel.app/api/stats?username=あなたのGitHubユーザー名&theme=テーマ名)
```

**例:**

```markdown
![GitHub Stats](https://github-trophies-xxxxx.vercel.app/api/stats?username=octocat&theme=dracula)
```

### パラメータ

| パラメータ | デフォルト | 説明 |
|-----------|----------|------|
| `username` | (必須) | GitHub ユーザー名 |
| `theme` | `noir` | カラーテーマ（下記参照） |

---

## テーマ一覧

`theme=` に以下のテーマ名を指定できます。

### Dark (24)

`noir` · `dracula` · `one-dark` · `monokai` · `tokyo-night` · `nord` · `github-dark` · `catppuccin` · `gruvbox-dark` · `solarized-dark` · `synthwave` · `cobalt` · `ayu` · `material-ocean` · `rose` · `night-owl` · `palenight` · `shades-of-purple` · `panda` · `horizon` · `vitesse` · `everforest` · `kanagawa` · `fleet`

### Light (8)

`light` · `github-light` · `solarized-light` · `gruvbox-light` · `catppuccin-latte` · `light-owl` · `everforest-light` · `vitesse-light`

---

## 仕組み

- `/api/stats` エンドポイントが SVG 画像を動的に生成
- GitHub REST API + GraphQL API からユーザーデータを取得
- 言語ロゴは [devicons](https://github.com/devicons/devicon) と [Simple Icons](https://github.com/simple-icons/simple-icons) から取得
- ランクは [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) と同様の CDF パーセンタイル方式
- サーバー側で 10 分間キャッシュ + CDN で 1 時間キャッシュ
- フォークして各自の Vercel にデプロイすることで、API レート制限を分散

---

## ライセンス

MIT
