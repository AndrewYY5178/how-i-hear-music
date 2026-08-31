# How I Hear Music

一个零依赖的个人音乐档案产品，使用原生 HTML/CSS/JS 与 History API 多路由结构实现。主页是编辑入口；Archive、Rate、Taste、Import、Journal 各自负责浏览、评分、审美说明、导入和时间线。

本地 Node 服务提供 QQ Music 与 NetEase Cloud Music **公开歌单 metadata** 导入，以及 QQ Music **公开专辑 metadata + 官方曲序**导入。粘贴 QQ 专辑链接或分享文字后，页面会先显示完整曲序和重复分析；确认后才写入浏览器本地 Archive。所有适配器都不使用平台登录、Cookie、音频、封面下载或歌词；因此 GitHub Pages 等纯静态部署无法执行实时拉取。

`MUSIC_TASTE_SOURCE.md` 是对话资料的完整证据与手册；它不由网页直接读取。网站只读取 `data/` 里的结构化 JSON，避免把未经确认的推测写进页面。

Archive 支持两种本地、证据优先的比较：在曲目详情明确登记不同录音版本后，每个版本可以独立评分并并排比较 Radar；在至少两张专辑具有官方曲序或已保存专辑评分后，可以比较曲序覆盖、Waveform 与 Overall。未知评分始终显示为 `—`。

UI 2.0 把长期聆听证据继续分成三层：`Song / Vocal / Production / Overall` 只表示个人评分；四组双极滑杆只描述声音性格；`Why This Works`、Musical Moment、Journal 历史与手工 Taste 分组只描述个人关系。Taste 中提供边界分析、Sonic Map、Taste Constellation 与 Listening Portrait；Journal 提供 Rediscovery、年度奖项和年度画像。所有结果均来自明确保存的数据，不自动推断标签、版本、奖项或缺失评分。

UI 3.0 将这些证据连接成同一套高级 Taste 系统：Taste DNA 只发布至少五首歌曲支持的审美特征；Blind Spots 描述证据附近尚未覆盖的区域而不承诺推荐结果；Archive Entropy 按季度观察集中与分散；Memory Palace 同时容纳可追溯的派生记忆和手动编排；Track Glyph、Album Terrain、Artist Signature 与 Listening Portrait 共用一套几何基础。缺少可信年份、Sonic 或关联 metadata 时，相应盲区维度保持缺席。

UI 3.1 收口了资料可靠性：全站 Search 同时检索 Track、Album、Artist、Journal、Memory 与 Taste DNA；Archive Metadata 显示字段覆盖并允许站点所有者保存可追溯的本地修正；Data Desk 提供版本化备份、合并恢复、最近变更快照、备份提醒与持久存储请求。Taste DNA 可检查贡献与限制证据，Entropy 明示样本量和可用维度，评分完成后可立即撤销，Journal 误记录可二次确认删除。

UI 3.2 补齐了本地资料的长期维护路径：Data Desk 可导出可读 JSON 或使用 AES-GCM 与密码保护的备份，并显示浏览器配额；Journal 的历史评分可以独立修订，Album detail 可保存私人专辑笔记，Metadata 可记录 HTTPS 来源、证据说明和修订时间。Blind Spots 只在语言、年代或 Sonic 样本达到门槛时显示覆盖空白。静态页面新增离线壳、显式更新提示、路由 metadata、sitemap 和 manifest；metadata adapter 新增健康/版本端点、结构化日志、可信代理开关和有界运行时缓存。

UI 3.4 增加了不破坏页面状态的中英文切换：语言选择保存在当前浏览器，动态生成的保存、导入和错误反馈也会同步翻译。中文标题与正文使用 Noto Serif SC，导航与元数据使用 Noto Sans SC，分别延续英文 Libre Baskerville 与 DM Mono 的编辑/资料层级。Rate 保存后会出现可聚焦的明确确认框；Rate 与 Import 的主要按钮统一留出 24px 的任务间距。

UI 3.4.1 重新逐页润色中文，不再逐字复制英文语序。首页、评分、导入、审美、日志、年度总结和空状态改用更自然的中文编辑语气；动态数字、年度奖项、审美 DNA 证据和记忆分区也完成本地化。音乐作品与艺人名称仍保留原文。

UI 3.4.2 根据排版角色处理中文标点：H1–H3 标题不再保留句末句号，正文标点不受影响；标题中的问号等实际语气仍然保留。

UI 3.3 把数据可信度放在功能数量之前：没有确认曲序的 Album 不再生成虚构 Track 或预设分数；错误 Track/Album URL 不再回退到其他记录；完成 Album rating 会验证所有曲目并同步当前 Track ratings。Journal 修订锁定原记录身份，Metadata 来源按字段保存，备份恢复先预览冲突并保留一次完整回滚。Sonic 中性值不再被误分到 Cold/Sparse，离线缓存按版本隔离，静态部署也获得 CSP/referrer 边界。

未完成的导入、数据库和互动功能记录在 [`TODO.md`](TODO.md) 中，并按优先级整理。

## 在线版本

[打开 GitHub Pages](https://andrewyy5178.github.io/how-i-hear-music/)。模块路由兼容项目站点子路径、直接刷新以及旧版 `/#archive` 等入口。在线静态版本可浏览、评分并保存浏览器本地数据；QQ Music 与 NetEase 的实时公开 metadata 导入仍需下面的本地 Node 服务。

静态页面会在导入表单之前明确显示服务未连接。若已有独立部署的 metadata adapter，可把 `index.html` 中的 `him-api-base` 设置为它的 HTTPS 根地址。adapter 运行环境同时需要：

```bash
HOST=0.0.0.0 ALLOWED_ORIGIN=https://andrewyy5178.github.io npm start
```

可用逗号分隔多个精确 origin。本地默认只监听 `127.0.0.1`；托管平台通常需要显式设置 `HOST=0.0.0.0`。只有在 adapter 位于可信反向代理后方时才设置 `TRUST_PROXY=1`；否则会忽略客户端提供的 `X-Forwarded-For`。`/healthz` 提供运行状态，`/api/version` 提供公开能力版本。adapter 自带每个来源地址 10 分钟 30 次的基础限流、5 分钟内存缓存、12 秒上游超时、结构化请求日志与 CORS 白名单；生产部署仍需由托管平台提供 TLS、日志留存和进程管理。仓库不包含托管账户或部署凭据，因此 GitHub Pages 版本默认保持 metadata service 未连接。

## 预览

在项目目录运行：

```bash
npm run dev
```

然后打开 `http://localhost:3000`。

个人评分和笔记仍以浏览器本地数据为准，不是账号同步数据库。换设备或清理站点数据前，请在 `Import → Data Desk` 导出备份：普通 JSON 便于检查但可直接阅读；密码备份使用 PBKDF2-SHA256（250,000 次）派生密钥并以 AES-GCM 加密。站点不保存也不能找回密码。

离线壳会缓存同源页面、样式、脚本和内置数据，但不会缓存 `/api/` 或 `/healthz` 响应。新 Service Worker 安装完成后只显示更新提示，由用户决定何时重新载入。

## 验证

```bash
npm test
```

该命令覆盖结构与静态无障碍/安全检查、数据迁移、字段级 metadata、Journal 身份、Album/Track 评分一致性、明文与加密备份、冲突预览与完整回滚、Blind Spot 中性区，以及十一个可靠性、检索和分析页面的渲染 smoke test。`npm run check:adapters` 会访问第三方公开接口，只应在允许联网并需要检查上游兼容性时运行。

## 外部依赖

- 在线实时导入需要独立 metadata adapter 的托管环境、HTTPS 域名和部署凭据；这些不应提交到仓库。
- 在商业化或扩大公开使用之前，`TERMS.md`、第三方平台条款、metadata 使用方式和图片引用仍须由合格法律专业人士复核。代码检查不能替代法律意见。

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
