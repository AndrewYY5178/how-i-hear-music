# How I Hear Music

一个零依赖的个人音乐档案产品，使用原生 HTML/CSS/JS 与 History API 多路由结构实现。主页是编辑入口；Archive、Rate、Taste、Import、Journal 各自负责浏览、评分、审美说明、导入和时间线。

本地 Node 服务提供 QQ Music 与 NetEase Cloud Music **公开歌单 metadata** 导入端点：粘贴公开歌单分享卡即可读取歌名、歌手、专辑、平台 ID 和时长。它们不使用平台登录、Cookie、音频、封面下载或歌词；因此 GitHub Pages 等纯静态部署无法使用这些功能。

`MUSIC_TASTE_SOURCE.md` 是对话资料的完整证据与手册；它不由网页直接读取。网站只读取 `data/` 里的三个 JSON，避免把未经确认的推测写进页面。

未完成的导入、数据库和互动功能记录在 [`TODO.md`](TODO.md) 中，并按优先级整理。

## 在线版本

[打开 GitHub Pages](https://andrewyy5178.github.io/how-i-hear-music/)。模块路由兼容项目站点子路径、直接刷新以及旧版 `/#archive` 等入口。在线静态版本可浏览、评分并保存浏览器本地数据；QQ Music 与 NetEase 的实时公开 metadata 导入仍需下面的本地 Node 服务。

## 预览

在项目目录运行：

```bash
npm run dev
```

然后打开 `http://localhost:3000`。

## 继续修改

- 修改个人听歌逻辑与故事：编辑 `data/music-profile.json`
- 修改艺术家状态：编辑 `data/artists.json`
- 修改歌曲评分与专辑记录：编辑 `data/songs.json`
- 修改路由和产品入口：编辑 `app.js`
- 修改领域页面：编辑 `modules/archive`、`modules/rating`、`modules/taste`、`modules/import`、`modules/journal`
- 修改共享数据工具与视觉图形：编辑 `modules/music`、`modules/layout`、`modules/rating/visuals.js`
- 修改视觉：编辑 `styles.css`
- 修改 QQ Music / NetEase 公共 metadata adapter：编辑 `server.mjs`

评分使用 `Song / Vocal / Production / Overall` 顺序。JSON 里的未知值使用 `null`，页面显示为 `—`；不要自行补全。Overall 不是平均分，11 必须保留为有效分数。
