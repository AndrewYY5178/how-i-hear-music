# How I Hear Music

一个零依赖的个人音乐档案产品，使用原生 HTML/CSS/JS 与 History API 多路由结构实现。主页是编辑入口；Archive、Rate、Taste、Import、Journal 各自负责浏览、评分、审美说明、导入和时间线。

本地 Node 服务与线上 Cloudflare Worker 都提供 QQ Music 智能公开资料导入：粘贴一次公开歌单或专辑链接／分享文字，服务会自动识别其类型；歌单进入 Inbox 预览，专辑显示官方曲序与重复分析，确认后才写入浏览器本地资料。NetEase Cloud Music 保持公开歌单 metadata 导入。所有适配器都不使用平台登录、Cookie、音频、封面下载或歌词；GitHub Pages 通过受限 CORS 的 Worker 执行实时公开资料读取。

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

UI 3.6.0 开始将同一套档案、编辑与评分结构重组为触控优先的移动壳层：手机使用 Home、Archive、Rate、Taste、More 五项底部导航；桌面导航和全部既有路由保持不变。Archive 单曲在手机改为紧凑纵向记录，Rate 的雷达、加减分和保存动作保留可见的触控／键盘替代；MusicBrainz 发行候选可辅助核对发行地区与专辑、曲名标题语言，但绝不把它们当作歌词语言或自动写入资料。

UI 3.7.0 加入了 GitHub 账号同步：登录同一 GitHub 账号后，评分、笔记、Inbox、Memory 与本地档案改动会自动在设备间共享，不再要求同步密码或手动上传／下载。Cloudflare Worker 以账号会话处理合并，并将 AES-GCM 加密包存入 D1；这不是端到端加密，持有 Worker 部署权限的人理论上可在同步时读取内容。每次云端合并仍保留一次本地完整回滚，Data Desk 的本地导出也继续可用。

UI 3.8.0 将页头左侧没有交互意义的 `001` 改为 `ACCOUNT / 账号`。账号面板无需单独填写注册表：首次 GitHub 授权即建立同步身份；登录后显示 GitHub 用户名、加密副本状态、Data Desk 入口与退出操作。账号入口在所有页面可达，但同步与恢复仍集中在 Data Desk，不把首页改造成账号仪表盘。

UI 3.8.5 在首次 GitHub 登录并完成云端合并后询问昵称；昵称可随时在账号面板修改，并随账号档案同步到其他设备。登录后页头原来的 `ACCOUNT / 账号` 会直接替换为衬线体昵称；GitHub 用户名仍作为底层账号身份显示，昵称不影响登录和数据归属。

UI 3.10.0 将全站动态收束为 `DRAW / SLIDE / STAMP / SETTLE` 四种语言：Home 使用编辑栏目式揭幕；Archive 可平滑重排、悬停绘制缩略图形并以唱片脊展开艺人专辑；Rate 使用红墨重绘、分数滚动、短暂残影和保存印章；Taste 使用透明分析层、点位迁移和印刷遮罩；Import 以唱片入库、逐行校样和曲目账册呈现；Journal 使用剪报展开、日期戳和旧分覆印；Search 按实体分组并以手绘红线标出命中词。所有持续或装饰性动画都遵守 `prefers-reduced-motion`，普通页面、卡片和控件仍保持平面档案风格。

UI 3.10.4 修正窄窗口首页唱片流：中心封套缩小并为两侧唱片保留景深，标题与资料固定排在封面下方。`黑色柳丁` 改用稳定的专辑封面来源并保留备用地址；专辑详情新增仅存于当前浏览器的本地封面覆盖，可处理跨域、失效或受防盗链限制的图片。本地封面不会上传到 GitHub、Worker 或账号同步空间。

UI 3.11.0 开始依据功能关系图收紧入口：全站 Search 不再作为独立顶层目的地，而是成为 Archive 首页的内置搜索台。桌面页头、窄窗口菜单和手机 More 都移除重复 Search 入口；原有单曲、专辑、艺人、Journal、Memory 与 Taste DNA 检索范围保持不变。旧 `/search?q=…` 地址会自动转到 `/archive?q=…`，避免已有书签失效。

UI 3.11.1 把 QQ 音乐原来的歌单与专辑入口合并为“QQ 音乐智能导入”：一个输入框处理公开歌单、专辑及 QQ 分享文字；资料服务在短链解析后判断实体类型，再复用各自既有的 Inbox 或官方曲序预览。旧 `/import/qq-album?url=…` 地址会自动转到统一入口，已有链接不会失效。

UI 3.11.2 将 Archive 首页的本地检索收束为 `TRACKS / ALBUMS / ARTISTS` 右侧的红色小型「SEARCH」按键。未检索时不再占据页面主体；点按后展开一行输入，带 `?q=` 的旧检索链接会自动展开结果。搜索仍只在当前浏览器的单曲、专辑、艺人、日志、笔记、音乐记忆与 Taste DNA 中进行，不会将查询发送到服务器。

UI 3.11.3 补齐唱片物件的回程：Home 中心专辑离开中心、或 Archive 专辑失去悬停／焦点后，唱片会在保持层级的短暂窗口内滑回封套，避免被邻近专辑瞬间遮住。

UI 3.11.4 将唱片动作调整为完整的物理顺序：Home 先让上一张唱片收回约一半再换位；Archive 先完成当前唱片回收再打开下一张，并收紧滑出角度与垂直位置，避免唱片越过封套下边。

UI 3.11.5 修复离线更新按钮：点击后会重新定位当前等待中的离线 Worker，显示重新载入状态并激活新缓存；若浏览器没有及时发出控制权切换事件，也会自动重新载入，不再出现点击无反应。
UI 3.11.6 将 Home 与 Archive 的唱片回收提速至约 0.6 秒，并在回收到一半时切换下一张，保持物件连续性。
UI 3.11.7 收紧窄版 Home 的 PREV / NEXT 控件与专辑流的距离，并移除 Featured Shape 顶部多余分隔线。
UI 3.11.8 提高 Rate 橄榄绿界面的文字对比度：继续评分面板、说明文字和窄版导航改用深色墨色，保留红色当前状态。
UI 3.11.9 收紧 Account 弹出面板：移除未登录时的重复说明，改用紧凑身份层级、细红色顶线和低对比分隔线。
UI 3.11.10 修正唱片轮换的中途停顿：Home 与 Archive 在回收过半时切换，并用连续透明度交叉过渡保持动作不断档。
UI 3.11.11 将未登录 Account 改为直接的登录 / 注册入口：显示 GitHub 与邮箱选项，保留版本号和检查更新；邮箱后端接入前会明确提示即将开放。
UI 3.11.12 将 Home 与 Archive 的唱片回收对齐到封套内部 0 位，避免回收时越过左边界，同时保留过半切换和连续交叉过渡。
UI 3.11.13 将窄版 Home 的 PREV / NEXT 控件以最终级联规则锚定在封面与标题内容带下方，并覆盖小平板宽度，避免控件回落到舞台底部。
UI 3.11.14 收紧未登录 Account 面板：标题保持单行，登录入口改为并排的 `GITHUB` 与 `EMAIL`，移除多余的右上角关闭叉，同时保留页头切换和 Escape 关闭方式。
UI 3.11.15 将唱片动作区分为两种节奏：弹出约 1 秒，回收约 280 毫秒，并在回收到中段时提前切换下一张，避免回收比弹出更拖沓或产生空档。
UI 3.11.16 提高窄版 Home 两侧唱片的透明度：近侧为 52%，外侧可见唱片为 28%，保留景深层次但不让邻近封面淡出。
UI 3.11.17 开始接入无密码邮箱登录：Account 面板可请求 6 位验证码并完成登录，Worker 只保存验证码哈希，D1 增加临时挑战表；GitHub 登录会读取已验证邮箱，用完全相同的邮箱哈希联动已有邮箱空间。生产启用仍需配置 Resend、执行 D1 迁移并进行真实收件测试。

UI 3.11.18 删除未登录 Account 标题与 `GITHUB / EMAIL` 按钮之间多余的横向分隔线，保留按钮间距与底部版本检查。

UI 3.11.19 将 Home 窄版与宽版可见侧边唱片的最低透明度提高到 50%，保留中心封套的景深主次关系。

UI 3.11.20 将 Archive 专辑卡片的 Terrain 信息改为明确显示专辑评分、发行日期（或年份）和已评分曲目范围；唱片回收时同步加速封套回位，避免唱片在封套边缘穿透闪现。

UI 3.11.21 将 Archive 专辑唱片的滑出垂直偏移归零，确保唱片始终不超过封套上边界。

UI 3.11.22 增加最终响应式透明度级联，确保 Home 所有可见侧边唱片在桌面、平板与手机宽度均不低于 50%。

UI 3.11.23 移除 FEATURED SHAPE 下方的四栏分数，改为在雷达图节点旁按绘制顺序渐显对应维度分数。
UI 3.11.24 将 Journal 收进 Taste：顶层导航保留 Home、Archive、Rate、Taste、Import；Taste 内分为 Overview、Journal 和 Insights。旧 `/journal` 路由继续兼容，新增 `/taste/journal` 及其年度、记忆与熵分析入口。
UI 3.11.25 将 Home 所有可见侧边唱片的最低透明度提高到 80%，保留中心唱片的视觉焦点，不再使用过低透明度模拟景深。
UI 3.11.26 将 Home 所有可见侧边唱片统一为 100% 不透明度，景深只由尺寸、透视、位置和饱和度表达。
UI 3.11.27 窄版底部导航移除 `More`，直接显示 `Import`，五个模块均可一键到达。
UI 3.11.28 将导入区二级导航收束为 `Import / Inbox / Data Desk`；QQ 音乐和网易云音乐改在 Import 首页选择，并将可见名称 `QQ Music Smart Import` 简化为 `QQ Music`。
UI 3.11.29 补齐 Taste 及其 Journal、Blind Spots、Listening Portrait 等子页面的中文翻译，并为编号目录、动态盲区标签、画像统计和时间状态加入动态翻译规则。
UI 3.11.30 修复 Import 封面主题色：QQ/网易云封面通过受限同源图片通道读取像素，再使用现有的色板人口、饱和度与明度权重选择代表色；跨域失败不再直接退回随机备用色。

UI 3.3 把数据可信度放在功能数量之前：没有确认曲序的 Album 不再生成虚构 Track 或预设分数；错误 Track/Album URL 不再回退到其他记录；完成 Album rating 会验证所有曲目并同步当前 Track ratings。Journal 修订锁定原记录身份，Metadata 来源按字段保存，备份恢复先预览冲突并保留一次完整回滚。Sonic 中性值不再被误分到 Cold/Sparse，离线缓存按版本隔离，静态部署也获得 CSP/referrer 边界。

未完成的导入、数据库和互动功能记录在 [`TODO.md`](TODO.md) 中，并按优先级整理。

## 在线版本

[打开 GitHub Pages](https://andrewyy5178.github.io/how-i-hear-music/)。模块路由兼容项目站点子路径、直接刷新以及旧版 `/#archive` 等入口。在线静态版本可浏览、评分并保存浏览器本地数据，也可通过已部署的 Cloudflare Worker 读取 QQ Music 与 NetEase 的公开 metadata。

生产页面的 `him-api-base` 指向 `https://how-i-hear-music-adapter.bevel-exhaust.workers.dev`，CORS 只允许 `https://andrewyy5178.github.io`。Worker 代码位于 `worker/index.mjs`，部署配置位于 `wrangler.jsonc`；它与下面的本地 Node 服务保持相同的导入接口和公开 metadata 边界。

邮箱登录使用 Worker 的 Resend 发送路径。首次启用时，先将 `migrations/0002_email_auth.sql` 应用到 `how-i-hear-music-sync` D1，再执行 `wrangler secret put RESEND_API_KEY` 写入 Resend 密钥，并在 `wrangler.jsonc` 的 `EMAIL_FROM` 使用已验证的发件地址。未配置密钥时，Account 面板会保留入口但明确提示邮箱服务尚未配置；不会伪造登录成功。

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

UI 3.11.31 收束了重复入口：`TASTE` 以 Overview / Journal / Insights 作为唯一目录；Listening Profile 合入 DNA，Good ≠ Mine、边界与 Blind Spots 合入 Boundaries；Archive 首页仅保留一次 Tracks / Albums / Artists 入口；Rate 首页仅保留一个继续评分的主操作；保存评分后自动收录，Inbox 不再显示重复的 Archive 按钮。旧的 `/journal`、`/taste/profile`、`/taste/good-not-mine`、`/taste/blind-spots` 与 `/import/qq-album` 地址仍可使用，以保护书签和历史链接。

UI 3.11.32 将 Archive 根页的 Tracks / Albums / Artists 三个入口并排为一排三列；手机宽度继续使用单列布局。

UI 3.11.33 将 Archive 三列入口的分隔线移到 Albums 与 Artists 之间，不再保留最外侧多余的竖线。

UI 3.11.34 为 Home 增加登录状态感知的专辑展示：未登录时使用固定样板专辑，登录后按用户导入专辑数量逐步替换，达到展示容量后完全使用用户自己的专辑。`FEATURED SHAPE` 只展示 Song / Vocal / Production / Overall 四项均已确认的歌曲，不再把未完成评分的曲目作为样板补位。

UI 3.11.35 将 `FEATURED SHAPE` 的四个分数移到对应维度名称的外侧，并按上下左右方向对齐；评分页与详情页的雷达图标注位置保持不变。

UI 3.11.36 将 Home 未登录样板专辑固定为单依纯《纯妹妹》、Taylor Swift《Lover》、Kanye West《Graduation》、Kacey Musgraves《Golden Hour》、Bad Bunny《Un Verano Sin Ti》、Charli xcx《BRAT》、Rihanna《Loud》、Coldplay《Mylo Xyloto》和 Metallica《72 Seasons》。封面使用可公开访问的 Apple Music 或 Cover Art Archive 正式发行图，样板同时记录主题色作为图片取色失败时的稳定回退；登录后的用户专辑替换逻辑保持不变。

UI 3.11.37 在每个专辑详情的 COVER REFERENCE 中加入 RE-EXTRACT COLOR；它只清除当前封面的运行时取色缓存并重新读取像素，不会改动封面文件、评分或同步资料。

UI 3.11.38 将 Home 样板专辑与用户档案分开：未登录时九张样板始终可见，即使此浏览器已有同名本地导入；登录后只要用户导入专辑达到展示容量，Home 就完全切换为用户专辑。Archive、Search、Taste 与 Journal 不再列出未导入的样板专辑；如果样板专辑确实被用户导入，则会正常回到档案中。

UI 3.11.39 让未登录首页稳定以 `纯妹妹` 作为样板首张，并在远程封面暂时不可用时保留样板位置，不再静默移除该记录。

UI 3.11.40 将 Home 的九张样板统一标记为展示记录；只有用户实际导入后，它们才会出现在个人 Archive、Search、Taste 或 Journal 的专辑列表中。

- 修改个人听歌逻辑与故事：编辑 `data/music-profile.json`
- 修改艺术家状态：编辑 `data/artists.json`
- 修改歌曲评分与专辑记录：编辑 `data/songs.json`
- 修改路由和产品入口：编辑 `app.js`
- 修改领域页面：编辑 `modules/archive`、`modules/rating`、`modules/taste`、`modules/import`、`modules/journal`
- 修改共享数据工具与视觉图形：编辑 `modules/music`、`modules/layout`、`modules/rating/visuals.js`
- 修改视觉：编辑 `styles.css`
- 修改 QQ Music / NetEase 公共 metadata adapter：编辑 `server.mjs`、`server/providers/` 与 `worker/`

评分使用 `Song / Vocal / Production / Overall` 顺序。JSON 里的未知值使用 `null`，页面显示为 `—`；不要自行补全。Overall 不是平均分，11 必须保留为有效分数。
