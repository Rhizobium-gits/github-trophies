# GitHub Trophies

![Demo](./stats.svg)

[English](#english) | [日本語](#japanese) | [中文](#chinese) | [Preview & Config Generator](https://rhizobium-gits.github.io/github-trophies/)

---

## English

A GitHub stats card generator for your README. Runs entirely on GitHub Actions — no external services needed.

**[Try different themes and generate your config here](https://rhizobium-gits.github.io/github-trophies/)**

### Theme Examples

| noir | dracula | tokyo-night |
|------|---------|-------------|
| ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=noir) | ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=dracula) | ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=tokyo-night) |

| github-dark | catppuccin | nord |
|-------------|------------|------|
| ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=github-dark) | ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=catppuccin) | ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=nord) |

| light | github-light |
|-------|--------------|
| ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=light) | ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=github-light) |

**[See all 32 themes here](https://rhizobium-gits.github.io/github-trophies/)**

### Setup

1. **Fork** this repository
2. Edit `config.json` — set your GitHub username and theme:
   ```json
   {
     "username": "your-github-username",
     "theme": "noir"
   }
   ```
3. Go to **Settings > Secrets and variables > Actions**, click **New repository secret**
   - Name: `GH_TOKEN`
   - Value: a [Personal Access Token](https://github.com/settings/tokens) with `read:user` scope
4. Go to **Actions** tab > **Generate Stats Card** > **Run workflow**
5. Add this to your README:
   ```markdown
   ![GitHub Stats](./stats.svg)
   ```

The card updates automatically every 6 hours.

### Themes (32)

**Dark:** `noir` `dracula` `one-dark` `monokai` `tokyo-night` `nord` `github-dark` `catppuccin` `gruvbox-dark` `solarized-dark` `synthwave` `cobalt` `ayu` `material-ocean` `rose` `night-owl` `palenight` `shades-of-purple` `panda` `horizon` `vitesse` `everforest` `kanagawa` `fleet`

**Light:** `light` `github-light` `solarized-light` `gruvbox-light` `catppuccin-latte` `light-owl` `everforest-light` `vitesse-light`

### What's shown

- Avatar, name, bio, rank (S / A+ / A / A- / B+ / B / B- / C+ / C)
- Total Commits / Pull Requests / Code Reviews / Issues / Stars / Repositories / Contributed To / Followers / Following / Experience
- 1-year contribution graph
- Language donut chart with percentages (byte-count based)
- Language logos from [devicons](https://github.com/devicons/devicon) and [Simple Icons](https://github.com/simple-icons/simple-icons)

---

## Japanese

GitHub の統計情報をカード形式で README に表示するツール。GitHub Actions だけで動作し、外部サービスは不要です。

**[テーマのプレビューと設定の生成はこちら](https://rhizobium-gits.github.io/github-trophies/)**

### テーマ例

| noir | dracula | tokyo-night |
|------|---------|-------------|
| ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=noir) | ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=dracula) | ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=tokyo-night) |

| github-dark | catppuccin | nord |
|-------------|------------|------|
| ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=github-dark) | ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=catppuccin) | ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=nord) |

**[全32テーマを確認](https://rhizobium-gits.github.io/github-trophies/)**

### セットアップ

1. このリポジトリを **Fork**
2. `config.json` を編集 — ユーザー名とテーマを設定:
   ```json
   {
     "username": "あなたのGitHubユーザー名",
     "theme": "noir"
   }
   ```
3. **Settings > Secrets and variables > Actions** で **New repository secret** をクリック
   - Name: `GH_TOKEN`
   - Value: [Personal Access Token](https://github.com/settings/tokens)（`read:user` スコープ）
4. **Actions** タブ > **Generate Stats Card** > **Run workflow** で実行
5. README に以下を追加:
   ```markdown
   ![GitHub Stats](./stats.svg)
   ```

カードは6時間ごとに自動更新されます。

### テーマ (32種)

**ダーク:** `noir` `dracula` `one-dark` `monokai` `tokyo-night` `nord` `github-dark` `catppuccin` `gruvbox-dark` `solarized-dark` `synthwave` `cobalt` `ayu` `material-ocean` `rose` `night-owl` `palenight` `shades-of-purple` `panda` `horizon` `vitesse` `everforest` `kanagawa` `fleet`

**ライト:** `light` `github-light` `solarized-light` `gruvbox-light` `catppuccin-latte` `light-owl` `everforest-light` `vitesse-light`

### 表示内容

- アバター、名前、bio、ランク (S ~ C)
- Commits / PRs / Code Reviews / Issues / Stars / Repos / Contributed To / Followers / Following / Experience
- 1年間の Contribution グラフ
- 言語ドーナツチャート（バイト数ベース）
- [devicons](https://github.com/devicons/devicon) と [Simple Icons](https://github.com/simple-icons/simple-icons) の言語ロゴ

---

## Chinese

GitHub 统计卡片生成工具。完全基于 GitHub Actions 运行，无需外部服务。

**[预览主题和生成配置](https://rhizobium-gits.github.io/github-trophies/)**

### 主题示例

| noir | dracula | tokyo-night |
|------|---------|-------------|
| ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=noir) | ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=dracula) | ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=tokyo-night) |

| github-dark | catppuccin | nord |
|-------------|------------|------|
| ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=github-dark) | ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=catppuccin) | ![](https://github-trophies-rho.vercel.app/api/stats?username=Rhizobium-gits&v=20&theme=nord) |

**[查看全部32个主题](https://rhizobium-gits.github.io/github-trophies/)**

### 设置步骤

1. **Fork** 本仓库
2. 编辑 `config.json` — 设置你的 GitHub 用户名和主题：
   ```json
   {
     "username": "你的GitHub用户名",
     "theme": "noir"
   }
   ```
3. 进入 **Settings > Secrets and variables > Actions**，点击 **New repository secret**
   - Name: `GH_TOKEN`
   - Value: [Personal Access Token](https://github.com/settings/tokens)（需要 `read:user` 权限）
4. 进入 **Actions** 标签 > **Generate Stats Card** > **Run workflow** 手动运行
5. 在 README 中添加：
   ```markdown
   ![GitHub Stats](./stats.svg)
   ```

卡片每6小时自动更新。

### 主题 (32种)

**深色:** `noir` `dracula` `one-dark` `monokai` `tokyo-night` `nord` `github-dark` `catppuccin` `gruvbox-dark` `solarized-dark` `synthwave` `cobalt` `ayu` `material-ocean` `rose` `night-owl` `palenight` `shades-of-purple` `panda` `horizon` `vitesse` `everforest` `kanagawa` `fleet`

**浅色:** `light` `github-light` `solarized-light` `gruvbox-light` `catppuccin-latte` `light-owl` `everforest-light` `vitesse-light`

### 展示内容

- 头像、用户名、简介、等级 (S ~ C)
- 提交数 / PR 数 / 代码审查数 / Issue 数 / Star 数 / 仓库数 / 贡献仓库数 / 粉丝数 / 关注数 / 经验年数
- 一年贡献图表
- 语言甜甜圈图（按代码字节数计算）
- 来自 [devicons](https://github.com/devicons/devicon) 和 [Simple Icons](https://github.com/simple-icons/simple-icons) 的语言图标

---

## License

MIT
