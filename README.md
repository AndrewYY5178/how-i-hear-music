# How I Hear Music

一个零依赖的个人音乐档案产品，使用原生 HTML/CSS/JS 与 History API 多路由结构实现。主页是编辑入口；Archive、Rate、Taste、Import、Journal 各自负责浏览、评分、审美说明、导入和时间线。

本地 Node 服务提供 QQ Music 与 NetEase Cloud Music **公开歌单 metadata** 导入，以及 QQ Music **公开专辑 metadata + 官方曲序**导入。粘贴 QQ 专辑链接或分享文字后，页面会先显示完整曲序和重复分析；确认后才写入浏览器本地 Archive。所有适配器都不使用平台登录、Cookie、音频、封面下载或歌词；因此 GitHub Pages 等纯静态部署无法执行实时拉取。

`MUSIC_TASTE_SOURCE.md` 是对话资料的完整证据与手册；它不由网页直接读取。网站只读取 `data/` 里的结构化 JSON，避免把未经确认的推测写进页面。

Archive 支持两种本地、证据优先的比较：在曲目详情明确登记不同录音版本后，每个版本可以独立评分并并排比较 Radar；在至少两张专辑具有官方曲序或已保存专辑评分后，可以比较曲序覆盖、Waveform 与 Overall。未知评分始终显示为 `—`。

UI 2.0 把长期聆听证据继续分成三层：`Song / Vocal / Production / Overall` 只表示个人评分；四组双极滑杆只描述声音性格；`Why This Works`、Musical Moment、Journal 历史与手工 Taste 分组只描述个人关系。Taste 中提供边界分析、Sonic Map、Taste Constellation 与 Listening Portrait；Journal 提供 Rediscovery、年度奖项和年度画像。所有结果均来自明确保存的数据，不自动推断标签、版本、奖项或缺失评分。

UI 3.0 将这些证据连接成同一套高级 Taste 系统：Taste DNA 只发布至少五首歌曲支持的审美特征；Blind Spots 描述证据附近尚未覆盖的区域而不承诺推荐结果；Archive Entropy 按季度观察集中与分散；Memory Palace 同时容纳可追溯的派生记忆和手动编排；Track Glyph、Album Terrain、Artist Signature 与 Listening Portrait 共用一套几何基础。缺少可信年份、Sonic 或关联 metadata 时，相应盲区维度保持缺席。

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
- 修改 QQ Music / NetEase 公共 metadata adapter：编辑 `server.mjs` 与 `server/providers/`

评分使用 `Song / Vocal / Production / Overall` 顺序。JSON 里的未知值使用 `null`，页面显示为 `—`；不要自行补全。Overall 不是平均分，11 必须保留为有效分数。
