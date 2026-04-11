# GitHub Trophies

GitHub の統計情報をカード形式で README に表示するツール。

![Demo](./stats.svg)

---

## セットアップ（3ステップ）

### 1. フォーク

このリポジトリ右上の **Fork** ボタンを押してください。

### 2. `config.json` を編集

フォークしたリポジトリの `config.json` を開いて、自分のユーザー名とテーマを設定:

```json
{
  "username": "あなたのGitHubユーザー名",
  "theme": "noir"
}
```

### 3. GitHub Token を設定

1. [GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens) にアクセス
2. **Generate new token (classic)** をクリック
3. `read:user` スコープにチェックを入れて生成
4. フォークしたリポジトリの **Settings** > **Secrets and variables** > **Actions** で **New repository secret** をクリック
5. Name: `GH_TOKEN`、Value: 生成したトークンを貼り付けて保存

### 完了！

**Actions** タブ > **Generate Stats Card** > **Run workflow** で手動実行するか、6時間ごとに自動で `stats.svg` が更新されます。

---

## README に貼る

フォークしたリポジトリの `stats.svg` を参照:

```markdown
![GitHub Stats](https://raw.githubusercontent.com/あなたのユーザー名/github-trophies/main/stats.svg)
```

または同じリポジトリの README なら:

```markdown
![GitHub Stats](./stats.svg)
```

---

## テーマ一覧

`config.json` の `theme` に指定:

### Dark (24)

`noir` · `dracula` · `one-dark` · `monokai` · `tokyo-night` · `nord` · `github-dark` · `catppuccin` · `gruvbox-dark` · `solarized-dark` · `synthwave` · `cobalt` · `ayu` · `material-ocean` · `rose` · `night-owl` · `palenight` · `shades-of-purple` · `panda` · `horizon` · `vitesse` · `everforest` · `kanagawa` · `fleet`

### Light (8)

`light` · `github-light` · `solarized-light` · `gruvbox-light` · `catppuccin-latte` · `light-owl` · `everforest-light` · `vitesse-light`

---

## 表示内容

- ユーザーアバター・名前・bio
- ランク (S / A+ / A / A- / B+ / B / B- / C+ / C)
- Total Commits / Pull Requests / Issues / Stars / Repositories / Experience
- 1年間の Contribution グラフ
- 使用言語のドーナツチャート（バイト数ベース）

---

## 仕組み

- GitHub Actions が6時間ごとに `stats.svg` を自動生成・コミット
- 各自のフォーク内で完結するため、他人の API 枠を消費しない
- GitHub REST API + GraphQL API を使用
- ランクは [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) と同様の CDF パーセンタイル方式

## ライセンス

MIT
