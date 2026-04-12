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

**これで完了です!** **Actions** タブを開いて、**Generate Stats Card** → **Run workflow** をクリックしてください。約1分待つと、`svg/` フォルダに全32テーマのカードが生成されます。

### README に貼り付ける

**全32テーマのプレビューとコピペ用コードは [こちらのページ](https://rhizobium-gits.github.io/github-trophies/) ですべて取得できます。**

以下のコードをコピーして、好きな README に貼り付けてください:

```
![GitHub Stats](https://raw.githubusercontent.com/USERNAME/github-trophies/main/svg/stats-noir.svg)
```

- `USERNAME` を自分の GitHub ユーザー名に変えてください
- `noir` を好きなテーマ名に変えてください

カードは6時間ごとに自動で更新されます。

**全32テーマのプレビューとコピペ用コードは [こちらのページ](https://rhizobium-gits.github.io/github-trophies/) ですべて取得できます。**

### テーマ一覧

| | | |
|---|---|---|
| ![](./svg_readme/stats-noir.svg) | ![](./svg_readme/stats-dracula.svg) | ![](./svg_readme/stats-tokyo-night.svg) |
| `noir` | `dracula` | `tokyo-night` |
| ![](./svg_readme/stats-github-dark.svg) | ![](./svg_readme/stats-nord.svg) | ![](./svg_readme/stats-light.svg) |
| `github-dark` | `nord` | `light` |

**全32テーマ:** `noir` `dracula` `one-dark` `monokai` `tokyo-night` `nord` `github-dark` `catppuccin` `gruvbox-dark` `solarized-dark` `synthwave` `cobalt` `ayu` `material-ocean` `rose` `night-owl` `palenight` `shades-of-purple` `panda` `horizon` `vitesse` `everforest` `kanagawa` `fleet` `light` `github-light` `solarized-light` `gruvbox-light` `catppuccin-latte` `light-owl` `everforest-light` `vitesse-light`

**[全テーマのプレビューとコードを取得](https://rhizobium-gits.github.io/github-trophies/)**

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

**That's it!** Now go to the **Actions** tab, click **Generate Stats Card**, then click **Run workflow**. Wait about 1 minute. All 32 theme cards will appear in the `svg/` folder.

### Put it in your README

**All 32 theme previews and copy-paste code are available on [this page](https://rhizobium-gits.github.io/github-trophies/).**

Copy this line and paste it into any README file:

```
![GitHub Stats](https://raw.githubusercontent.com/USERNAME/github-trophies/main/svg/stats-noir.svg)
```

- Replace `USERNAME` with your GitHub username
- Replace `noir` with any theme name you like

Your card will update automatically every 6 hours.

**All 32 theme previews and copy-paste code are available on [this page](https://rhizobium-gits.github.io/github-trophies/).**

### Available Themes

| | | |
|---|---|---|
| ![](./svg_readme/stats-noir.svg) | ![](./svg_readme/stats-dracula.svg) | ![](./svg_readme/stats-tokyo-night.svg) |
| `noir` | `dracula` | `tokyo-night` |
| ![](./svg_readme/stats-github-dark.svg) | ![](./svg_readme/stats-nord.svg) | ![](./svg_readme/stats-light.svg) |
| `github-dark` | `nord` | `light` |

**All 32 themes:** `noir` `dracula` `one-dark` `monokai` `tokyo-night` `nord` `github-dark` `catppuccin` `gruvbox-dark` `solarized-dark` `synthwave` `cobalt` `ayu` `material-ocean` `rose` `night-owl` `palenight` `shades-of-purple` `panda` `horizon` `vitesse` `everforest` `kanagawa` `fleet` `light` `github-light` `solarized-light` `gruvbox-light` `catppuccin-latte` `light-owl` `everforest-light` `vitesse-light`

**[Get all theme previews and code](https://rhizobium-gits.github.io/github-trophies/)**

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

**完成了！** 打开 **Actions** 标签，点击 **Generate Stats Card** → **Run workflow**。等待大约1分钟，`svg/` 文件夹中会生成全部32个主题的卡片。

### 添加到你的 README

**全部32个主题的预览和复制粘贴代码都可以在 [这个页面](https://rhizobium-gits.github.io/github-trophies/) 获取。**

复制下面这行代码，粘贴到任意 README 文件中：

```
![GitHub Stats](https://raw.githubusercontent.com/USERNAME/github-trophies/main/svg/stats-noir.svg)
```

- 把 `USERNAME` 换成你的 GitHub 用户名
- 把 `noir` 换成你喜欢的主题名

卡片每6小时自动更新。

**全部32个主题的预览和复制粘贴代码都可以在 [这个页面](https://rhizobium-gits.github.io/github-trophies/) 获取。**

### 主题一览

| | | |
|---|---|---|
| ![](./svg_readme/stats-noir.svg) | ![](./svg_readme/stats-dracula.svg) | ![](./svg_readme/stats-tokyo-night.svg) |
| `noir` | `dracula` | `tokyo-night` |
| ![](./svg_readme/stats-github-dark.svg) | ![](./svg_readme/stats-nord.svg) | ![](./svg_readme/stats-light.svg) |
| `github-dark` | `nord` | `light` |

**全部32个主题:** `noir` `dracula` `one-dark` `monokai` `tokyo-night` `nord` `github-dark` `catppuccin` `gruvbox-dark` `solarized-dark` `synthwave` `cobalt` `ayu` `material-ocean` `rose` `night-owl` `palenight` `shades-of-purple` `panda` `horizon` `vitesse` `everforest` `kanagawa` `fleet` `light` `github-light` `solarized-light` `gruvbox-light` `catppuccin-latte` `light-owl` `everforest-light` `vitesse-light`

**[获取全部主题预览和代码](https://rhizobium-gits.github.io/github-trophies/)**

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

## License

MIT
