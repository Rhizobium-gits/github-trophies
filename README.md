# GitHub Trophies

![Demo](./svg_readme/stats-noir.svg)

### [日本語](#日本語) | [English](#english) | [中文](#中文)

---

## 日本語

### これは何？

あなたの GitHub のアクティビティ（コミット数、PR数、使用言語など）をきれいなカードにして、README に表示できるツールです。自動で更新され、プログラミングの知識は不要です。

### 使い方（かんたん3ステップ）

**1. このリポジトリをフォークする**

このページの右上にある **Fork** ボタンをクリックしてください。あなた専用のコピーが作られます。

**2. ユーザー名を設定する**

フォークしたリポジトリの `config.json` を開いて、ユーザー名を自分のものに変えてください:

```json
{
  "username": "USERNAME"
}
```

**3. トークンを作成して登録する**

このツールがあなたの GitHub データを読み取るために、トークンが必要です。

1. [github.com/settings/tokens](https://github.com/settings/tokens) を開く
2. **Generate new token (classic)** をクリック
3. `read:user` にチェックを入れる
4. **Generate token** をクリックして、表示されたトークンをコピー
5. フォークしたリポジトリに戻る
6. **Settings** → **Secrets and variables** → **Actions** を開く
7. **New repository secret** をクリック
8. Name に `GH_TOKEN`、Value にコピーしたトークンを貼り付け
9. **Add secret** をクリック

> **⚠️ この手順を必ず実行してください！これをしないとカードは表示されません。**
>
> **Actions** タブを開いて、**Generate Stats Card** → **Run workflow** をクリックしてください。約1分待つと、`svg/` フォルダに全32テーマのカードが生成されます。この手順を飛ばすと、README に貼り付けても何も表示されません。

### README に貼り付ける

**[こちらのページ](https://rhizobium-gits.github.io/github-trophies/)でテーマを選んでタップするだけでコードをコピーできます。コード内の `USERNAME` を自分のユーザー名に書き換えてください。**

以下のコードをコピーして、好きな README に貼り付けてください:

```
![GitHub Stats](https://raw.githubusercontent.com/USERNAME/github-trophies/main/svg/stats-noir.svg)
```

- `USERNAME` を自分の GitHub ユーザー名に変えてください
- `noir` を好きなテーマ名に変えてください

カードは6時間ごとに自動で更新されます。

**[こちらのページ](https://rhizobium-gits.github.io/github-trophies/)でテーマを選んでタップするだけでコードをコピーできます。コード内の `USERNAME` を自分のユーザー名に書き換えてください。**

### テーマ一覧

| | | |
|---|---|---|
| ![](./svg_readme/stats-noir.svg) | ![](./svg_readme/stats-dracula.svg) | ![](./svg_readme/stats-tokyo-night.svg) |
| `noir` | `dracula` | `tokyo-night` |
| ![](./svg_readme/stats-github-dark.svg) | ![](./svg_readme/stats-nord.svg) | ![](./svg_readme/stats-light.svg) |
| `github-dark` | `nord` | `light` |

**全32テーマ:** `noir` `dracula` `one-dark` `monokai` `tokyo-night` `nord` `github-dark` `catppuccin` `gruvbox-dark` `solarized-dark` `synthwave` `cobalt` `ayu` `material-ocean` `rose` `night-owl` `palenight` `shades-of-purple` `panda` `horizon` `vitesse` `everforest` `kanagawa` `fleet` `light` `github-light` `solarized-light` `gruvbox-light` `catppuccin-latte` `light-owl` `everforest-light` `vitesse-light`


### プライバシー

このツールは**公開データのみ**を使用します。プライベートリポジトリのコードや内容にはアクセスしません。

- コミット数 / PR数 / Issue数: 公開リポジトリのみ（GitHub Search API）
- 言語 / スター / リポ数: 公開リポジトリのみ（REST API, `type=owner`）
- Contributionグラフ: GitHubプロフィール設定で「Private contributions」を有効にしている場合、プライベートリポへの貢献数が含まれることがあります
- `read:user` トークンは読み取り専用で、データの変更はできません

### 対処法（カードが更新されなくなったとき）

GitHub Actions のログに `Error: https://api.github.com/users/...: 401` と出ていたら、**PAT (Personal Access Token) が期限切れ**です。GitHub API の無料枠（5000リクエスト/時）超過ではありません。エラーコードで原因が分かります:

- **401 Unauthorized** → トークンが無効/期限切れ ← よくあるのはこれ
- **403 Forbidden** + `rate limit exceeded` → レート制限
- **429 Too Many Requests** → レート制限

**修復手順:**

1. [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta) を開いて **Fine-grained PAT** を新規発行
   - **Token name**: 自由（例: `github-trophies-action`）
   - **Expiration**: `Custom...` で最大1年後を指定（毎回切れるのを防げる）
   - **Repository access**: `Public Repositories (read-only)` を選択（追加 Permissions は不要）
2. 生成された `github_pat_...` をコピー（**一度しか表示されません**）
3. ターミナルで実行（プロンプトにトークンを貼り付け）:
   ```
   gh secret set GH_TOKEN --repo YOUR_USERNAME/github-trophies
   ```
   または GitHub Web UI: フォークしたリポ → **Settings** → **Secrets and variables** → **Actions** → `GH_TOKEN` を **Update**
4. **Actions** タブ → **Generate Stats Card** → **Run workflow** で手動実行して確認
5. expiration の1週間前くらいにカレンダーリマインダーを入れておくと再発を防げます

> **💡 ヒント:** スコープが `Public Repositories (read-only)` の PAT は、`github-trophies` と `github-stats` など複数のフォークで**同じトークンを使い回せます**。リポジトリごとに発行する必要はありません。両方のシークレットを一度に更新する場合:
> ```
> gh secret set GH_TOKEN --repo YOUR_USERNAME/github-trophies
> gh secret set GH_TOKEN --repo YOUR_USERNAME/github-stats
> ```

---

## English

### What is this?

A beautiful stats card that shows your GitHub activity — commits, pull requests, languages, and more. It updates automatically and works in any README. No coding required.

### How to use (3 simple steps)

**1. Fork this repository**

Click the **Fork** button at the top right of this page. This creates your own copy.

**2. Set your username**

In your forked repository, open `config.json` and replace the username with yours:

```json
{
  "username": "USERNAME"
}
```

**3. Create a token and add it**

You need a GitHub token so the tool can read your stats.

1. Open [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Check the box next to `read:user`
4. Click **Generate token** and copy it
5. Go back to your forked repository
6. Click **Settings** → **Secrets and variables** → **Actions**
7. Click **New repository secret**
8. Type `GH_TOKEN` as the name, paste your token as the value
9. Click **Add secret**

> **⚠️ You MUST do this step! Without it, nothing will show up.**
>
> Go to the **Actions** tab, click **Generate Stats Card**, then click **Run workflow**. Wait about 1 minute. All 32 theme cards will appear in the `svg/` folder. If you skip this step, your README card will be blank.

### Put it in your README

**Pick a theme on [this page](https://rhizobium-gits.github.io/github-trophies/), tap to copy the code, then replace `USERNAME` with your GitHub username.**

Copy this line and paste it into any README file:

```
![GitHub Stats](https://raw.githubusercontent.com/USERNAME/github-trophies/main/svg/stats-noir.svg)
```

- Replace `USERNAME` with your GitHub username
- Replace `noir` with any theme name you like

Your card will update automatically every 6 hours.

**Pick a theme on [this page](https://rhizobium-gits.github.io/github-trophies/), tap to copy the code, then replace `USERNAME` with your GitHub username.**

### Available Themes

| | | |
|---|---|---|
| ![](./svg_readme/stats-noir.svg) | ![](./svg_readme/stats-dracula.svg) | ![](./svg_readme/stats-tokyo-night.svg) |
| `noir` | `dracula` | `tokyo-night` |
| ![](./svg_readme/stats-github-dark.svg) | ![](./svg_readme/stats-nord.svg) | ![](./svg_readme/stats-light.svg) |
| `github-dark` | `nord` | `light` |

**All 32 themes:** `noir` `dracula` `one-dark` `monokai` `tokyo-night` `nord` `github-dark` `catppuccin` `gruvbox-dark` `solarized-dark` `synthwave` `cobalt` `ayu` `material-ocean` `rose` `night-owl` `palenight` `shades-of-purple` `panda` `horizon` `vitesse` `everforest` `kanagawa` `fleet` `light` `github-light` `solarized-light` `gruvbox-light` `catppuccin-latte` `light-owl` `everforest-light` `vitesse-light`


### Privacy

This tool only uses **public data**. Your private repositories are never accessed.

- Commits / PRs / Issues: public repositories only (via GitHub Search API)
- Languages / Stars / Repos: public repositories only (via REST API, `type=owner`)
- Contribution graph: may include private contribution counts if you have enabled "Private contributions" in your GitHub profile settings
- The `read:user` token scope is read-only and cannot modify any data

### Troubleshooting (when your card stops updating)

If you see `Error: https://api.github.com/users/...: 401` in the GitHub Actions log, your **PAT (Personal Access Token) has expired**. This is **not** a free-tier limit issue (the API allows 5000 requests/hour authenticated). The status code tells you the real cause:

- **401 Unauthorized** → token invalid/expired ← this is the common one
- **403 Forbidden** + `rate limit exceeded` → rate limit hit
- **429 Too Many Requests** → rate limit hit

**How to fix:**

1. Open [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta) and generate a new **Fine-grained PAT**
   - **Token name**: anything (e.g. `github-trophies-action`)
   - **Expiration**: `Custom...` with the maximum 1-year date (prevents frequent re-issuing)
   - **Repository access**: `Public Repositories (read-only)` (no extra Permissions needed)
2. Copy the generated `github_pat_...` token (**shown only once**)
3. In your terminal (paste the token at the prompt):
   ```
   gh secret set GH_TOKEN --repo YOUR_USERNAME/github-trophies
   ```
   Or via the GitHub Web UI: your fork → **Settings** → **Secrets and variables** → **Actions** → **Update** `GH_TOKEN`
4. Go to the **Actions** tab → **Generate Stats Card** → **Run workflow** to verify
5. Set a calendar reminder for ~1 week before the expiration date so you don't get caught again

> **💡 Tip:** A PAT with `Public Repositories (read-only)` scope can be **reused across multiple forks** like `github-trophies` and `github-stats` — you don't need a separate token per repo. To update both secrets at once:
> ```
> gh secret set GH_TOKEN --repo YOUR_USERNAME/github-trophies
> gh secret set GH_TOKEN --repo YOUR_USERNAME/github-stats
> ```

---

## 中文

### 这是什么？

一个漂亮的统计卡片工具，可以在 README 中展示你的 GitHub 活动 —— 提交数、PR数、使用语言等。自动更新，不需要任何编程知识。

### 使用方法（简单3步）

**1. Fork 这个仓库**

点击本页右上角的 **Fork** 按钮。这会创建一个属于你的副本。

**2. 设置你的用户名**

打开你 fork 的仓库中的 `config.json`，把用户名改成你自己的：

```json
{
  "username": "USERNAME"
}
```

**3. 创建令牌并添加**

为了让工具能读取你的 GitHub 数据，你需要创建一个令牌。

1. 打开 [github.com/settings/tokens](https://github.com/settings/tokens)
2. 点击 **Generate new token (classic)**
3. 勾选 `read:user`
4. 点击 **Generate token**，复制显示的令牌
5. 回到你 fork 的仓库
6. 点击 **Settings** → **Secrets and variables** → **Actions**
7. 点击 **New repository secret**
8. Name 填 `GH_TOKEN`，Value 粘贴你的令牌
9. 点击 **Add secret**

> **⚠️ 这一步必须执行！不执行的话卡片不会显示。**
>
> 打开 **Actions** 标签，点击 **Generate Stats Card** → **Run workflow**。等待大约1分钟，`svg/` 文件夹中会生成全部32个主题的卡片。跳过这一步的话，README 中不会显示任何内容。

### 添加到你的 README

**在[这个页面](https://rhizobium-gits.github.io/github-trophies/)选择主题，点击即可复制代码，然后将 `USERNAME` 替换为你的用户名。**

复制下面这行代码，粘贴到任意 README 文件中：

```
![GitHub Stats](https://raw.githubusercontent.com/USERNAME/github-trophies/main/svg/stats-noir.svg)
```

- 把 `USERNAME` 换成你的 GitHub 用户名
- 把 `noir` 换成你喜欢的主题名

卡片每6小时自动更新。

**在[这个页面](https://rhizobium-gits.github.io/github-trophies/)选择主题，点击即可复制代码，然后将 `USERNAME` 替换为你的用户名。**

### 主题一览

| | | |
|---|---|---|
| ![](./svg_readme/stats-noir.svg) | ![](./svg_readme/stats-dracula.svg) | ![](./svg_readme/stats-tokyo-night.svg) |
| `noir` | `dracula` | `tokyo-night` |
| ![](./svg_readme/stats-github-dark.svg) | ![](./svg_readme/stats-nord.svg) | ![](./svg_readme/stats-light.svg) |
| `github-dark` | `nord` | `light` |

**全部32个主题:** `noir` `dracula` `one-dark` `monokai` `tokyo-night` `nord` `github-dark` `catppuccin` `gruvbox-dark` `solarized-dark` `synthwave` `cobalt` `ayu` `material-ocean` `rose` `night-owl` `palenight` `shades-of-purple` `panda` `horizon` `vitesse` `everforest` `kanagawa` `fleet` `light` `github-light` `solarized-light` `gruvbox-light` `catppuccin-latte` `light-owl` `everforest-light` `vitesse-light`


### 隐私说明

本工具仅使用**公开数据**。不会访问你的私有仓库代码或内容。

- 提交数 / PR数 / Issue数: 仅公开仓库（GitHub Search API）
- 语言 / Star / 仓库数: 仅公开仓库（REST API, `type=owner`）
- 贡献图表: 如果你在 GitHub 个人资料设置中启用了「Private contributions」，可能会包含私有仓库的贡献数量
- `read:user` 令牌为只读权限，无法修改任何数据

### 故障排除（卡片不再更新时）

如果 GitHub Actions 日志中出现 `Error: https://api.github.com/users/...: 401`，说明你的 **PAT（个人访问令牌）已过期**。这**不是**免费额度问题（API 认证后允许 5000 请求/小时）。错误码可以判断真正原因:

- **401 Unauthorized** → 令牌失效/过期 ← 最常见
- **403 Forbidden** + `rate limit exceeded` → 触发速率限制
- **429 Too Many Requests** → 触发速率限制

**修复步骤:**

1. 打开 [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta)，生成新的 **Fine-grained PAT**
   - **Token name**: 任意名称（例如 `github-trophies-action`）
   - **Expiration**: 选 `Custom...` 并设为最大 1 年后（避免频繁更新）
   - **Repository access**: 选择 `Public Repositories (read-only)`（无需额外 Permissions）
2. 复制生成的 `github_pat_...` 令牌（**仅显示一次**）
3. 在终端运行（提示时粘贴令牌）:
   ```
   gh secret set GH_TOKEN --repo YOUR_USERNAME/github-trophies
   ```
   或通过 GitHub Web UI: fork 仓库 → **Settings** → **Secrets and variables** → **Actions** → **Update** `GH_TOKEN`
4. 打开 **Actions** 标签 → **Generate Stats Card** → **Run workflow** 手动验证
5. 在过期日期前约 1 周设置日历提醒，避免再次中断

> **💡 提示:** 拥有 `Public Repositories (read-only)` 权限的 PAT 可以**在多个 fork（如 `github-trophies` 和 `github-stats`）之间重复使用**，不需要每个仓库单独发行。一次性更新两个 secret:
> ```
> gh secret set GH_TOKEN --repo YOUR_USERNAME/github-trophies
> gh secret set GH_TOKEN --repo YOUR_USERNAME/github-stats
> ```

---

## Tech Stack

| | |
|---|---|
| Card Generation | Node.js, SVG |
| CI/CD | GitHub Actions |
| Preview | [GitHub Pages](https://rhizobium-gits.github.io/github-trophies/) |
| Data | GitHub REST API, GraphQL API |
| Icons | [devicons](https://github.com/devicons/devicon), [Simple Icons](https://github.com/simple-icons/simple-icons) |
| Rank | CDF Percentile |

## Feedback / フィードバック / 反馈

バグや改善のアイデアがあれば、お気軽に [Issue](https://github.com/Rhizobium-gits/github-trophies/issues) で教えてください!

Found a bug or have an idea? Feel free to open an [Issue](https://github.com/Rhizobium-gits/github-trophies/issues)!

发现问题或有改进建议？欢迎提交 [Issue](https://github.com/Rhizobium-gits/github-trophies/issues)！

## License

MIT
