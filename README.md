# How I Hear Music

一个零依赖的个人音乐档案产品，使用原生 HTML/CSS/JS 与 History API 多路由结构实现。主页是编辑入口；Archive、Rate、Taste、Import、Journal 各自负责浏览、评分、审美说明、导入和时间线。

本地 Node 服务与线上 Cloudflare Worker 都提供 QQ Music 与 NetEase Cloud Music **公开歌单 metadata** 导入，以及 QQ Music **公开专辑 metadata + 官方曲序**导入。粘贴 QQ 专辑链接或分享文字后，页面会先显示完整曲序和重复分析；确认后才写入浏览器本地 Archive。所有适配器都不使用平台登录、Cookie、音频、封面下载或歌词；GitHub Pages 通过受限 CORS 的 Worker 执行实时公开资料读取。

`MUSIC_TASTE_SOURCE.md` 是对话资料的完整证据与手册；它不由网页直接读取。网站只读取 `data/` 里的结构化 JSON，避免把未经确认的推测写进页面。

Archive 支持两种本地、证据优先的比较：在曲目详情明确登记不同录音版本后，每个版本可以独立评分并并排比较 Radar；在至少两张专辑具有官方曲序或已保存专辑评分后，可以比较曲序覆盖、Waveform 与 Overall。未知评分始终显示为 `—`。

UI 2.0 把长期聆听证据继续分成三层：`Song / Vocal / Production / Overall` 只表示个人评分；四组双极滑杆只描述声音性格；`Why This Works`、Musical Moment、Journal 历史与手工 Taste 分组只描述个人关系。Taste 中提供边界分析、Sonic Map、Taste Constellation 与 Listening Portrait；Journal 提供 Rediscovery、年度奖项和年度画像。所有结果均来自明确保存的数据，不自动推断标签、版本、奖项或缺失评分。

UI 3.0 将这些证据连接成同一套高级 Taste 系统：Taste DNA 只发布至少五首歌曲支持的审美特征；Blind Spots 描述证据附近尚未覆盖的区域而不承诺推荐结果；Archive Entropy 按季度观察集中与分散；Memory Palace 同时容纳可追溯的派生记忆和手动编排；Track Glyph、Album Terrain、Artist Signature 与 Listening Portrait 共用一套几何基础。缺少可信年份、Sonic 或关联 metadata 时，相应盲区维度保持缺席。

UI 3.1 收口了资料可靠性：全站 Search 同时检索 Track、Album、Artist、Journal、Memory 与 Taste DNA；Archive Metadata 显示字段覆盖并允许站点所有者保存可追溯的本地修正；Data Desk 提供版本化备份、合并恢复、最近变更快照、备份提醒与持久存储请求。Taste DNA 可检查贡献与限制证据，Entropy 明示样本量和可用维度，评分完成后可立即撤销，Journal 误记录可二次确认删除。

UI 3.2 补齐了本地资料的长期维护路径：Data Desk 可导出可读 JSON 或使用 AES-GCM 与密码保护的备份，并显示浏览器配额；Journal 的历史评分可以独立修订，Album detail 可保存私人专辑笔记，Metadata 可记录 HTTPS 来源、证据说明和修订时间。Blind Spots 只在语言、年代或 Sonic 样本达到门槛时显示覆盖空白。静态页面新增离线壳、显式更新提示、路由 metadata、sitemap 和 manifest；metadata adapter 新增健康/版本端点、结构化日志、可信代理开关和有界运行时缓存。

UI 3.4 增加了不破坏页面状态的中英文切换：语言选择保存在当前浏览器，动态生成的保存、导入和错误反馈也会同步翻译。中文标题与正文使用 Noto Serif SC，导航与元数据使用 Noto Sans SC，分别延续英文 Libre Baskerville 与 DM Mono 的编辑/资料层级。Rate 保存后会出现可聚焦的明确确认框；Rate 与 Import 的主要按钮统一留出 24px 的任务间距。

UI 3.4.1 重新逐页润色中文，不再逐字复制英文语序。首页、评分、导入、审美、日志、年度总结和空状态改用更自然的中文编辑语气；动态数字、年度奖项、审美 DNA 证据和记忆分区也完成本地化。音乐作品与艺人名称仍保留原文。

UI 3.4.2 根据排版角色处理中文标点：H1–H3 标题不再保留句末句号，正文标点不受影响；标题中的问号等实际语气仍然保留。UI 3.4.3 同时确保离线更新安装时绕过旧的 HTTP 资源缓存，使“重新载入更新”真正载入这一版文件。

UI 3.4.4 收紧了语言切换键与页头工具间距，并让 1024px 及以下宽度提前使用菜单式页头，避免英文导航与搜索、标识和期号相互覆盖。

UI 3.4.5 移除了没有交互或状态含义的 `READ / 20—` 模拟期号，让页头只保留导航、搜索、语言切换与项目标识。

UI 3.4.6 恢复了原来的横向完整导航：只有 760px 及以下手机宽度才折叠为菜单；`READ / 20—` 仍保持移除。

UI 3.4.7 补齐了导入完成后动态生成的中文，包括歌单来源同步、Inbox 状态、重复判断、专辑预览和错误反馈。

UI 3.4.9 缩短了从导入到收藏的路径：导入歌曲保存评分后会自动进入档案，撤销评分会完整恢复原来的 Inbox 位置。个人 Library 现已纳入档案单曲列表；已收录歌曲不再继续占据 Inbox。档案维护资料、版本/Sonic/评分历史，以及数据台的加密、诊断和恢复工具默认折叠，核心浏览与普通备份仍直接可见。

UI 3.5.0 在 Archive Metadata 中加入 QQ 音乐公开资料候选：标题与艺人完全匹配后，仍会进一步核对准确的专辑实体，再把专辑名、公开发行日期和曲序位置填入待确认表单；保存仍由用户决定。语言与地区在没有可靠来源时继续留空。核心公开路由同时生成可抓取的静态 HTML，站点分享图改为 1200 × 630 PNG；本地开发固定使用同源 Node adapter，线上 Pages 使用 Cloudflare Worker。

UI 3.5.1 将首页收紧为纯展示页：内容区不再重复提供方法、单曲、专辑、档案和关于入口，页脚也移除方法链接，主要导航继续承担前往各模块的任务。此刻在听、单曲形状和专辑地形会在每次重新进入首页时从当前有证据的档案中随机选择；没有确认曲序或评分的专辑不会获得虚构地形。档案的单曲、专辑和艺人默认按各自可用的评分证据从高到低排列，未评分记录置后。

UI 3.5.2 减少了 Import 的常驻状态噪音：资料服务正常时不再显示“已连接”，只有静态版本未配置服务或实际请求失败时才出现警告。Inbox 的歌单来源操作由含义模糊的 `SYNC NOW / 立即同步` 改为 `CHECK PLAYLIST UPDATES / 检查歌单更新`；功能仍只比较公开歌单的新旧快照，不是跨设备云同步，也不会删除本地歌曲、评分或笔记。

UI 3.5.3 采用最终确认的 V13 耳朵与耳蜗内舌头图标：透明底、单一砖红色 `#a44733`、接近 1:1 的外廓比例和圆润线条。它替换浏览器标签与安装清单中的旧纸张底几何图标，不改变网站内容、评分或浏览器本地资料。

UI 3.6.0 开始将同一套档案、编辑与评分结构重组为触控优先的移动壳层：手机使用 Home、Archive、Rate、Taste、More 五项底部导航，Import、Journal 与 Search 留在 More；桌面导航和全部既有路由保持不变。Archive 单曲在手机改为紧凑纵向记录，Rate 的雷达、加减分和保存动作保留可见的触控／键盘替代；MusicBrainz 发行候选可辅助核对发行地区与专辑、曲名标题语言，但绝不把它们当作歌词语言或自动写入资料。

UI 3.7.0 加入了 GitHub 账号同步：登录同一 GitHub 账号后，评分、笔记、Inbox、Memory 与本地档案改动会自动在设备间共享，不再要求同步密码或手动上传／下载。Cloudflare Worker 以账号会话处理合并，并将 AES-GCM 加密包存入 D1；这不是端到端加密，持有 Worker 部署权限的人理论上可在同步时读取内容。每次云端合并仍保留一次本地完整回滚，Data Desk 的本地导出也继续可用。

UI 3.8.0 将页头左侧没有交互意义的 `001` 改为 `ACCOUNT / 账号`。账号面板无需单独填写注册表：首次 GitHub 授权即建立同步身份；登录后显示 GitHub 用户名、加密副本状态、Data Desk 入口与退出操作。账号入口在所有页面可达，但同步与恢复仍集中在 Data Desk，不把首页改造成账号仪表盘。

UI 3.3 把数据可信度放在功能数量之前：没有确认曲序的 Album 不再生成虚构 Track 或预设分数；错误 Track/Album URL 不再回退到其他记录；完成 Album rating 会验证所有曲目并同步当前 Track ratings。Journal 修订锁定原记录身份，Metadata 来源按字段保存，备份恢复先预览冲突并保留一次完整回滚。Sonic 中性值不再被误分到 Cold/Sparse，离线缓存按版本隔离，静态部署也获得 CSP/referrer 边界。

未完成的导入、数据库和互动功能记录在 [`TODO.md`](TODO.md) 中，并按优先级整理。

## 在线版本

[打开 GitHub Pages](https://andrewyy5178.github.io/how-i-hear-music/)。模块路由兼容项目站点子路径、直接刷新以及旧版 `/#archive` 等入口。在线静态版本可浏览、评分并保存浏览器本地数据，也可通过已部署的 Cloudflare Worker 读取 QQ Music 与 NetEase 的公开 metadata。

生产页面的 `him-api-base` 指向 `https://how-i-hear-music-adapter.bevel-exhaust.workers.dev`，CORS 只允许 `https://andrewyy5178.github.io`。Worker 代码位于 `worker/index.mjs`，部署配置位于 `wrangler.jsonc`；它与下面的本地 Node 服务保持相同的导入接口和公开 metadata 边界。

如需运行本地 Node adapter：

```bash
HOST=0.0.0.0 ALLOWED_ORIGIN=https://andrewyy5178.github.io npm start
```

可用逗号分隔多个精确 origin。本地默认只监听 `127.0.0.1`；托管平台通常需要显式设置 `HOST=0.0.0.0`。只有在 adapter 位于可信反向代理后方时才设置 `TRUST_PROXY=1`；否则会忽略客户端提供的 `X-Forwarded-For`。`/healthz` 提供运行状态，`/api/version` 提供公开能力版本。adapter 自带每个来源地址 10 分钟 30 次的基础限流、5 分钟内存缓存、12 秒上游超时、结构化请求日志与 CORS 白名单。仓库不包含 Cloudflare 登录信息、认领令牌或部署凭据。

## 预览

在项目目录运行：

```bash
npm run dev
```

然后打开 `http://localhost:3000`。

个人评分和笔记仍会先写入当前浏览器。若已登录 GitHub，同一份档案会在约一分钟内自动同步到同账号的其他已登录设备；首次新设备登录会拉取并合并云端档案，同时保留本地回滚。换设备或清理站点数据前，仍建议在 `Import → Data Desk` 导出备份：普通 JSON 便于检查但可直接阅读；密码备份使用 PBKDF2-SHA256（250,000 次）派生密钥并以 AES-GCM 加密，适合自行长期保管。

离线壳会缓存同源页面、样式、脚本和内置数据，但不会缓存 `/api/` 或 `/healthz` 响应。新 Service Worker 安装完成后只显示更新提示，由用户决定何时重新载入。

## 验证

```bash
npm test
```

发布前运行 `npm run build:static`，会更新八个核心路由的静态 HTML、`sitemap.xml` 与 `og-image.png`。该命令需要本机安装 `rsvg-convert`。

该命令覆盖结构与静态无障碍/安全检查、数据迁移、字段级 metadata、Journal 身份、Album/Track 评分一致性、明文与加密备份、冲突预览与完整回滚、Blind Spot 中性区，以及十一个可靠性、检索和分析页面的渲染 smoke test。`npm run check:adapters` 会访问第三方公开接口，只应在允许联网并需要检查上游兼容性时运行。

## 外部依赖

- Cloudflare Worker、D1 与 GitHub OAuth 可在各自免费额度内运行；扩大公开使用前应检查实际调用量、上游平台条款和 Cloudflare 当前配额。GitHub Client Secret 只存为 Worker secret；登录信息、令牌、认领链接和部署凭据不应提交到仓库。
- 在商业化或扩大公开使用之前，`TERMS.md`、第三方平台条款、metadata 使用方式和图片引用仍须由合格法律专业人士复核。代码检查不能替代法律意见。

## 继续修改

- 修改个人听歌逻辑与故事：编辑 `data/music-profile.json`
- 修改艺术家状态：编辑 `data/artists.json`
- 修改歌曲评分与专辑记录：编辑 `data/songs.json`
- 修改路由和产品入口：编辑 `app.js`
- 修改领域页面：编辑 `modules/archive`、`modules/rating`、`modules/taste`、`modules/import`、`modules/journal`
- 修改共享数据工具与视觉图形：编辑 `modules/music`、`modules/layout`、`modules/rating/visuals.js`
- 修改视觉：编辑 `styles.css`
- 修改 QQ Music / NetEase 公共 metadata adapter：编辑 `server.mjs`、`server/providers/` 与 `worker/`

评分使用 `Song / Vocal / Production / Overall` 顺序。JSON 里的未知值使用 `null`，页面显示为 `—`；不要自行补全。Overall 不是平均分，11 必须保留为有效分数。
