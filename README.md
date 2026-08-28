# How I Hear Music

一个零依赖、可直接预览的个人音乐品味展示页。当前版本因为工作区无法从 npm 下载官方脚手架，先采用原生 HTML/CSS/JS；音乐数据按照三个独立文件管理，网页脚本只从数据文件读取内容。

`MUSIC_TASTE_SOURCE.md` 是对话资料的完整证据与手册；它不由网页直接读取。网站只读取 `data/` 里的三个 JSON，避免把未经确认的推测写进页面。

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
- 修改页面结构：编辑 `index.html`
- 修改视觉：编辑 `styles.css`
- 修改筛选与交互：编辑 `app.js`

评分使用 `Song / Vocal / Production / Overall` 顺序。JSON 里的未知值使用 `null`，页面显示为 `—`；不要自行补全。Overall 不是平均分，11 必须保留为有效分数。
