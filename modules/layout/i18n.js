const storageKey = "how-i-hear-music:language:v1";
const supported = new Set(["en", "zh-CN"]);

const zh = {
  "Home": "首页", "Archive": "档案", "Rate": "评分", "Taste": "审美", "Import": "导入", "Journal": "日志", "Search": "搜索",
  "Tracks": "单曲", "Albums": "专辑", "Artists": "艺人", "Metadata": "资料", "Profile": "画像", "Philosophy": "理念", "Compare": "对比", "ARCHIVE MAINTENANCE": "档案维护", "MANAGE METADATA →": "管理资料 →", "Source evidence and missing fields stay available when you need to maintain the record.": "来源证据与缺失字段平时收起，需要维护档案时仍可打开。",
  "PERSONAL ARCHIVE / ISSUE 001": "个人音乐档案 / 第 001 期", "How I": "我如何", "hear music.": "听见音乐。",
  "Melody opens the door.": "旋律先把门打开。", "Everything else has to earn its place.": "其他一切，都必须值得留下。",
  "READ THE METHOD ↓": "看看我怎么听 ↓", "CURRENTLY LISTENING": "此刻在听", "Open": "打开",
  "FEATURED SHAPE": "一首歌的形状", "EXPLORE TRACK →": "进入这首歌 →", "FEATURED LANDSCAPE": "一张专辑的地形", "EXPLORE ALBUM →": "进入这张专辑 →",
  "ENTER THE ARCHIVE": "进入音乐档案", "TRACKS →": "单曲 →", "ALBUMS →": "专辑 →", "ARTISTS →": "艺人 →",
  "Music can be minimal or maximal, familiar or surprising. The only question is whether it stays alive.": "音乐可以极简，也可以繁复；可以熟悉，也可以出人意料。唯一的问题是：它是否仍然鲜活。",
  "ABOUT THIS ARCHIVE": "关于这份档案",
  "ARCHIVE": "档案", "Browse the record.": "翻阅这份音乐档案。", "Tracks, albums and artists that have entered the archive.": "这里收录进入档案的单曲、专辑与艺人。",
  "TRACKS": "单曲", "ALBUMS": "专辑", "ARTISTS": "艺人", "Enter →": "进入 →", "Open track": "打开单曲", "Open album": "打开专辑",
  "ARCHIVE / TRACKS": "档案 / 单曲", "Tracks in the record.": "收录过的每一首歌。", "Formal and ordered album entries. Ratings are never inferred.": "只收录曲序明确的正式专辑；缺失的评分绝不补猜。",
  "Search tracks or artists": "搜索单曲或艺人", "ALL": "全部", "RATED": "已评分", "BEYOND SCALE": "超出常规量表", "TASTE EVIDENCE": "审美证据", "ALL TRAITS": "全部特征", "SORT": "排序", "ARCHIVE ORDER": "档案顺序", "RATING HIGH–LOW": "评分从高到低", "TITLE A–Z": "标题 A–Z", "ARTIST A–Z": "艺人 A–Z",
  "No tracks match this view.": "当前筛选条件下没有单曲。", "NO SCORED GEOMETRY": "暂无评分图形", "NO RATED TERRAIN": "暂无评分地形", "NO COVER": "暂无封面",
  "ARCHIVE / ALBUMS": "档案 / 专辑", "Albums in view.": "收录过的每一张专辑。", "A cover, an overall response, a compact terrain.": "一张封面，一次总体感受，再加一道浓缩的评分地形。", "COMPARE ALBUMS": "比较专辑",
  "ARCHIVE / ARTISTS": "档案 / 艺人", "Track not found.": "没有找到这首单曲。", "Album not found.": "没有找到这张专辑。", "Artist not found.": "没有找到这位艺人。",
  "This record may not have a confirmed archive entry.": "这条记录可能尚未正式收入档案。", "This album is not in the current archive.": "这张专辑还没有收入档案。",
  "Back to tracks": "返回单曲", "Back to albums": "返回专辑", "RATE TRACK": "为单曲评分", "RATE ALBUM": "为专辑评分",
  "ARTIST": "艺人", "STATUS": "状态", "VERSION": "版本", "BASE RECORDING": "基础录音版本", "Recorded": "已收录",
  "THIS TRACK ACTIVATES": "这首歌触发了哪些审美基因", "READ TASTE DNA →": "查看审美 DNA →", "WHY THIS WORKS": "它为什么打动我", "MUSICAL MOMENTS": "难忘的瞬间", "LISTENING TEMPERATURE": "声音性格", "VERSIONS": "不同版本", "RATING HISTORY": "评分变化",
  "No explicit listening reasons have been saved yet.": "还没有记下喜欢它的具体原因。", "No confirmed timestamped moments have been recorded yet.": "还没有记下某个确切的音乐瞬间。", "No local rating changes recorded yet.": "这首歌的评分还没有发生过变化。",
  "ARCHIVE / METADATA": "档案 / 资料", "Know what the archive actually knows.": "看清这份档案知道什么，也不知道什么。", "Coverage is reported without filling gaps. Corrections are owner-confirmed and stored only in this browser.": "只呈现已经确认的资料，不擅自填空；你的修正只保存在这个浏览器里。",
  "COMPLETE RECORDS": "资料完整记录", "ALBUM": "专辑", "RELEASE DATE": "发行日期", "LANGUAGE": "语言", "REGION": "地区", "ALL RECORDS": "全部记录", "MISSING ONLY": "仅看缺失项", "REVIEW QUEUE": "核对队列", "TRACK": "单曲", "REVIEW": "核对", "CONFIRMED VALUE": "已确认内容", "SOURCE URL": "来源网址", "EVIDENCE NOTE": "证据说明", "SAVE FIELD EVIDENCE": "保存字段证据", "No local correction saved.": "尚未保存本地修正。",
  "RATE": "评分", "Begin with one listening decision.": "先听，再作出判断。", "Choose a shape for one track, or a landscape for an album.": "给一首歌画出形状，沿一张专辑看见起伏。",
  "01 / TRACK": "01 / 单曲", "02 / ALBUM": "02 / 专辑", "Listening Shape": "单曲形状", "Listening Landscape": "专辑地形", "Four dimensions, one personal response.": "四个维度，拼出一次私人的听感。", "Build a score curve from a confirmed track order.": "沿着已确认的曲序，画出整张专辑的评分曲线。", "Import a confirmed track order before rating an album.": "先导入并确认曲序，才能为整张专辑评分。",
  "RATE A TRACK": "为单曲评分", "RATE AN ALBUM": "为专辑评分", "IMPORT AN ALBUM": "导入一张专辑", "UNRATED QUEUE": "待评分队列", "Imported records stay here until listening becomes a rating.": "新导入的歌会先留在这里，等你听过、评过，再决定是否归档。", "OPEN QUEUE": "查看待评分", "CONTINUE RATING": "继续评分", "Choose from a confirmed record:": "从已确认的记录中选择：",
  "RATE / UNRATED QUEUE": "评分 / 待评分", "What have you heard but not rated?": "哪些歌已经听过，却还没有评分？", "Heard records lead; newly imported records remain visible underneath.": "听过但未评分的歌排在前面，新导入的歌留在后面。", "MARK HEARD": "标记为听过", "QUEUE CLEAR": "没有待评分歌曲", "No heard or imported track is waiting for a rating.": "目前没有听过或导入后尚未评分的歌。", "IMPORT MUSIC →": "导入音乐 →",
  "RATE / TRACK": "评分 / 单曲", "No rating was opened or changed.": "没有可打开或修改的评分。", "BACK TO TRACKS": "返回单曲", "DRAG A NODE / OR USE PRECISE CONTROLS": "拖动节点 / 也可用按钮微调", "SET THE SHAPE": "调整听感形状", "Move the graph first; use the controls to refine it.": "先拖动图形找到大致感觉，再用按钮细调。",
  "Song": "歌曲", "Vocal": "演唱", "Production": "制作", "Overall": "总体", "SONG": "歌曲", "VOCAL": "演唱", "OVERALL": "总体",
  "Song score": "歌曲评分", "Vocal score": "演唱评分", "Production score": "制作评分", "Overall score": "总体评分", "Your final feeling": "最后的直觉", "WHAT MAKES IT WORK? / SELECT WHAT IS TRUE": "它为什么打动我？/ 只选真正成立的理由", "ONE MOMENT": "某个瞬间", "TIME": "时间点", "WHAT HAPPENS": "那一刻发生了什么", "LONG PRIVATE NOTE / OPTIONAL": "私人长评 / 可选", "SAVE RATING": "保存这次评分",
  "RATING SAVED": "这次评分已保存", "Saved in this browser": "已保存在这个浏览器里。", "Saved in this browser.": "已保存在这个浏览器里。", "Rating saved and Track added to Archive.": "评分已保存，这首歌也已自动收录。", "THEN": "当时", "NOW": "现在", "CHANGE": "变化", "VIEW TRACK": "回到这首歌", "BACK TO QUEUE": "返回待评分", "UNDO THIS SAVE": "撤销这次保存", "SAVE UNDONE": "已撤销这次保存", "The previous rating and library location were restored. The new Journal entry was removed.": "已恢复保存前的评分和原来位置，并删除刚刚生成的日志记录。", "The prior Track ratings, library locations, album draft and Journal were restored.": "已恢复先前的单曲评分、收录位置、专辑草稿和日志记录。", "The album rating is incomplete.": "还有曲目没有完成评分。",
  "RATE / ALBUM": "评分 / 专辑", "BACK TO ALBUMS": "返回专辑", "CONFIRMED TRACK ORDER REQUIRED": "请先确认曲序", "This album cannot be rated yet.": "现在还不能为这张专辑评分。", "Import or confirm the official track sequence first. Placeholder tracks and inferred scores are never created.": "请先导入或确认官方曲序。这里不会虚构曲目，也不会替你猜评分。", "IMPORT OFFICIAL SEQUENCE": "导入官方曲序", "BUILD THE LANDSCAPE": "画出专辑地形", "Drag a point to shape the curve; use the track controls to refine it.": "拖动节点画出起伏，再逐曲微调分数。", "TRACK-BY-TRACK": "逐曲评分", "ALBUM OVERALL": "整张专辑的评分", "COMPLETE ALBUM RATING": "保存整张专辑", "ALBUM COMPLETE": "整张专辑已保存", "VIEW ALBUM": "回到这张专辑", "ALBUM NOT SAVED": "这次专辑评分没有保存",
  "IMPORT": "导入", "Bring music in.": "把音乐带进来。", "Playlists enter Inbox; a confirmed album import creates its ordered Archive record.": "歌单先进入收件箱；确认专辑后，曲目会按原顺序收入档案。", "QQ MUSIC": "QQ 音乐", "NETEASE": "网易云音乐", "Playlist or album.": "歌单，或整张专辑。", "Import a public playlist.": "导入一个公开歌单。", "Review playlist tracks in Inbox, or preserve an album's official sequence.": "在收件箱逐首核对歌单，或完整保留一张专辑的官方曲序。", "Read public playlist metadata through the server, with no login, Cookie, audio or lyrics.": "通过本地服务读取公开歌单资料；无需登录，也不读取 Cookie、音频或歌词。", "IMPORT FROM QQ →": "从 QQ 音乐导入 →", "IMPORT FROM NETEASE →": "从网易云音乐导入 →",
  "QQ Playlist": "QQ 歌单", "QQ Album": "QQ 专辑", "NetEase": "网易云音乐", "Inbox": "收件箱", "Data Desk": "数据台",
  "STATIC SITE / METADATA SERVICE NOT CONNECTED": "静态版本 / 尚未连接资料服务", "Browsing, rating and local data remain available. Public QQ Music and NetEase import requires the local Node server or a configured hosted adapter.": "浏览、评分和本地资料仍可正常使用。若要读取 QQ 音乐或网易云的公开资料，需要启动本地服务，或连接已经部署的资料服务。", "LOCAL SETUP ↗": "查看本地设置 ↗", "METADATA SERVICE": "资料服务", "Hosted adapter configured.": "已连接线上资料服务。", "Local metadata adapter ready.": "本地资料服务已就绪。",
  "IMPORT / QQ MUSIC": "导入 / QQ 音乐", "Bring a QQ record in.": "从 QQ 音乐带回一份记录。", "Public metadata only: no QQ login, Cookie, audio or lyrics.": "这里只读取公开资料，不需要 QQ 登录，也不读取 Cookie、音频或歌词。", "01 / PLAYLIST IMPORT": "01 / 导入歌单", "Paste the share at the desk.": "从一条分享开始。", "One public playlist at a time. Nothing is added until you review the preview.": "一次处理一个公开歌单；在你确认预览之前，不会写入任何记录。", "QQ MUSIC PLAYLIST / SHARE CARD": "QQ 音乐歌单 / 分享内容", "Paste a QQ Music playlist link or share text": "粘贴 QQ 音乐歌单链接或完整分享文字", "PREVIEW IMPORT": "先看预览", "IMPORT PREVIEW": "导入预览", "Waiting for a public playlist link.": "请先粘贴一个公开歌单链接。", "02 / QQ MUSIC CATALOG": "02 / QQ 音乐曲库", "Looking for one track instead? Search the public catalog and send it straight to Inbox.": "如果只想找一首歌，可以搜索公开曲库，再把它直接送进收件箱。", "Search tracks, artists or albums": "搜索歌曲、艺人或专辑", "SEARCH QQ MUSIC": "搜索 QQ 音乐",
  "IMPORT / QQ ALBUM": "导入 / QQ 专辑", "Preserve the record's sequence.": "把一张专辑的原始曲序完整留下。", "Paste one public QQ Music album link. Preview every disc and track before the local Archive changes.": "粘贴一个公开的 QQ 音乐专辑链接。每张碟、每首歌都会先完整预览，确认后才会改动本地档案。", "ORDERED ALBUM IMPORT": "按曲序导入专辑", "Start with the album itself.": "先找到这张专辑。", "Metadata only. Track order comes from the exact QQ Music album entity—never search results or recommendations.": "这里只导入资料。曲序直接取自这张 QQ 音乐专辑，不使用搜索结果或推荐内容。", "QQ MUSIC ALBUM / SHARE TEXT": "QQ 音乐专辑 / 分享内容", "Paste an album URL or the full QQ Music share message": "粘贴专辑链接或完整的 QQ 音乐分享文字", "DETECT ALBUM": "识别这张专辑", "ALBUM PREVIEW": "专辑预览", "Waiting for a public QQ Music album link.": "请先粘贴一个公开专辑链接。",
  "IMPORT / NETEASE": "导入 / 网易云音乐", "Bring a NetEase record in.": "从网易云音乐带回一份记录。", "Public metadata only: no NetEase login, Cookie, audio, cover download or lyrics.": "这里只读取公开资料，不需要网易云音乐登录，也不读取 Cookie、音频、封面文件或歌词。", "Paste the public share.": "粘贴一条公开分享。", "Playlist metadata enters the same Inbox review workflow as every other source.": "歌单会先进入同一个收件箱，由你逐首核对。", "NETEASE PLAYLIST / SHARE CARD": "网易云歌单 / 分享内容", "Paste a NetEase Cloud Music playlist link or share text": "粘贴网易云音乐歌单链接或完整分享文字",
  "IMPORT / INBOX": "导入 / 收件箱", "Move music through the desk.": "让每首歌经过清楚的整理流程。", "Imported records stay here until rated. Saving a rating adds the Track to Archive automatically.": "导入的歌曲会先留在这里；评分一旦保存，就会自动收入档案。", "IMPORTED": "刚导入", "HEARD": "听过", "ARCHIVED": "已归档", "PLAYLIST SOURCES": "歌单来源", "Check what changed.": "看看歌单发生了什么变化。", "Sync compares public snapshots. A removal never deletes a local track, rating or note.": "同步只对比两次公开快照。即使歌曲从原歌单移除，本地歌曲、评分和笔记也不会被删除。", "LOCAL DATA": "本地资料", "Keep the desk recoverable.": "给这些资料留一份退路。", "OPEN DATA DESK": "打开数据台",
  "IMPORT / DATA DESK": "导入 / 数据台", "Keep the archive recoverable.": "给整份档案留一份退路。", "This site stores personal ratings and notes in this browser. Export a copy before clearing site data or moving devices.": "你的评分和笔记只保存在这个浏览器里。清除网站资料或更换设备前，请先导出一份备份。", "LOCAL FOOTPRINT": "本地占用", "BROWSER QUOTA": "可用空间", "Checking…": "正在检查……", "DATA GROUPS": "资料类别", "RECOVERY POINTS": "恢复点", "LAST BACKUP": "最近一次备份", "Never": "从未备份", "BACKUP / RESTORE": "备份 / 恢复", "Keep one portable copy.": "留一份随时能带走的备份。", "Export every local rating, note and imported record in one file. Restore always shows conflicts before changing anything.": "一次导出所有本地评分、笔记和导入记录；恢复前一定会先显示冲突。", "EXPORT BACKUP": "导出备份", "RESTORE A BACKUP": "恢复备份", "ADVANCED PRIVACY & RECOVERY": "高级隐私与恢复", "Encrypted export, storage diagnostics and recovery points remain available here when needed.": "加密导出、存储诊断和恢复点平时收起，需要时仍可使用。", "OPTIONAL BACKUP PASSWORD": "备份密码 / 可选", "At least 10 characters": "至少输入 10 个字符", "EXPORT ENCRYPTED": "导出加密备份", "REQUEST DURABLE STORAGE": "申请保留本地资料", "RECOVERY": "恢复记录", "Recent local changes.": "最近发生的本地变更。", "ROLL BACK LAST RESTORE": "撤销上一次恢复", "No imported records are waiting. Rated Tracks move to Archive automatically.": "目前没有等待处理的导入歌曲；评完分的歌曲会自动移入档案。",
  "TASTE": "审美", "How I hear music.": "我的聆听方式。", "The listening method behind the archive.": "这份档案背后的聆听逻辑。", "Listening Philosophy": "我怎么听", "Good ≠ Mine": "好 ≠ 我会喜欢", "LISTENING PHILOSOPHY": "我的聆听观", "MY TASTE PROFILE": "我的审美画像", "GOOD ≠ MINE": "好 ≠ 我会喜欢", "COMPARE WITH ME": "和我一起听", "The parts that need a reason to exist.": "我在意什么，以及为什么。", "A visual summary, not a personality test.": "一张审美地图，不是一份性格测试。", "Respect and resonance are different things.": "认可一首歌，与被它打动，是两回事。", "Rate a track, then reveal the distance.": "给同一首歌评分，看看我们听见的差别。",
  "TASTE DNA": "审美 DNA", "BLIND SPOTS": "审美盲区", "BOUNDARIES": "审美边界", "SONIC MAP": "声音地图", "TASTE CONSTELLATION": "审美星座", "LISTENING PORTRAIT": "聆听肖像",
  "TASTE / PHILOSOPHY": "审美 / 聆听观", "Every element needs a reason.": "每个声音，都得有留下的理由。", "Melody opens the door. Arrangement makes me stay. Details make me return.": "旋律让我走进来，编曲让我留下，细节让我一再回来。", "Surprise belongs to the song.": "真正的惊喜，应该长在歌里。", "The human voice stays human.": "人声不该失去人的痕迹。",
  "The first barrier: the hardest gate, though not an absolute veto.": "旋律是第一关，也是最难的一关，但不是一票否决。", "Production / Arrangement": "制作 / 编曲", "Movement, shape, timing and the information that returns on replay.": "我在意音乐怎样推进、转折和停顿，也在意那些重听时才浮现的细节。", "Timbre + Lyrics": "音色 + 歌词", "Does this voice belong to this song? Is there meaning left to unfold?": "这个声音属于这首歌吗？歌词里还有没有值得慢慢展开的东西？", "Vocal ability": "演唱能力", "Appreciated, but never the point by itself.": "我欣赏技巧，但技巧从来不是终点。", "All is considered.": "所有因素都算数。", "Nothing is absolute.": "但没有一条是铁律。", "It depends on what catches attention.": "最后，还是看什么真正抓住了我。", "Resonance is real, but it is not a number.": "共鸣确实存在，却未必能被一个数字说清。", "The first gate": "第一道门", "Surprise": "惊喜", "Reinterpretation": "重新诠释", "Emotional resonance": "情感共鸣",
  "TASTE / PROFILE": "审美 / 画像", "A listening profile.": "一张属于我的聆听画像。", "A compact map of priorities—not a verdict on music.": "这是一张偏好地图，不是给音乐下判决。", "MELODY": "旋律", "PRODUCTION": "制作", "VOCAL SKILL": "演唱能力", "HARMONY": "和声", "GROOVE": "律动", "COMPLEXITY": "复杂度", "high priority": "最看重", "appreciated, not decisive": "会欣赏，但不决定结果", "strong affinity": "很容易被打动", "context dependent": "要看具体语境", "WHAT MAKES 9+ TRACKS WORK?": "9 分以上的歌，为什么打动我？", "Not enough explicit listening reasons yet.": "还没有积累足够多明确的聆听理由。",
  "TASTE / GOOD ≠ MINE": "审美 / 好 ≠ 适合我", "I know it's good. It's just not mine.": "我知道它很好，只是不属于我。", "Technical admiration and personal resonance do not need to agree.": "技术上的欣赏与个人共鸣不必一致。",
  "TASTE / COMPARE": "审美 / 对比", "Two ways of hearing.": "同一首歌，两种听法。", "Rate selected tracks in the dedicated workspace, then reveal the distance.": "先完成评分，再看看彼此究竟听见了什么。", "RATE A TRACK": "为单曲评分", "Comparison begins with a real score.": "先留下真实的评分，比较才有意义。", "Rate at least three archived tracks. Your ratings remain in this browser and no public profile is created.": "请至少为三首已归档的歌评分。所有结果只留在这个浏览器里，不会生成公开资料。",
  "NOT ENOUGH EVIDENCE": "证据还不够", "TASTE / BOUNDARIES": "审美 / 边界", "What probably won't work for me?": "哪些声音大概不会打动我？", "Patterns require at least three rated tracks. They describe recurring distance, never a genre stereotype.": "一种边界至少要在三首已评分歌曲中反复出现。它描述的是不共鸣的方式，不给音乐类型贴标签。", "No boundary repeats across three tracks yet.": "目前还没有哪一种“不适合”重复出现三次。", "More explicit ratings may reveal a pattern; the site will not manufacture one.": "再多积累一些明确评分，边界也许会慢慢显现；网站不会替你编造答案。",
  "TASTE / DNA": "审美 / DNA", "What repeats beneath the ratings.": "分数背后，反复出现的是什么？", "A trait needs at least five supporting tracks. Genre is not used as the primary explanation.": "一种审美基因至少要有五首歌共同支持；音乐类型不作为主要解释。", "HOW STRENGTH AND CONFIDENCE WORK": "怎么看强度与可信度", "INSPECT EVIDENCE": "查看依据", "CONTRIBUTING TRACKS": "哪些歌支持了它", "LIMITING EVIDENCE / BELOW BASELINE": "相反证据 / 低于基准", "ADD LISTENING EVIDENCE →": "继续积累聆听记录 →",
  "TASTE / BLIND SPOTS": "审美 / 盲区", "Where the archive has barely looked.": "档案还没怎么去过的地方。", "These are coverage gaps beside recurring taste evidence—not promises about what you will like.": "这些是稳定偏好旁边尚未探索的空白，不是系统替你保证会喜欢。", "CURRENT EVIDENCE": "现有依据", "EXPLORED": "已经探索", "EVIDENCE SIGNAL": "依据来自", "TRAIT AFFINITY": "偏好关联",
  "TASTE / SONIC MAP": "审美 / 声音地图", "Character, not quality.": "只描述声音，不评价好坏。", "Choose two axes. Every point comes from an explicit local descriptor.": "挑选两条坐标轴。每个点只来自你亲手保存的声音描述。", "X AXIS": "横轴", "Y AXIS": "纵轴", "REDRAW": "重新绘制", "NO SONIC CHARACTER YET": "还没有声音性格记录", "Save Listening Temperature on a Track detail page.": "先在单曲详情页记录它的声音性格。",
  "TASTE / CONSTELLATION": "审美 / 星座", "Musical family, without genre boxes.": "不按音乐类型划界的家族。", "One artist or track may appear in several manually curated branches.": "一位艺人或一首歌，可以同时属于多个由你整理的分支。", "NO GROUPS YET": "还没有分组", "Build the first branch from what actually matters.": "从一条真正重要的联系开始。", "CURATE A GROUP": "整理一个分组", "NAME": "名称", "DESCRIPTION": "说明", "MEMBER TYPE": "成员类型", "MEMBERS": "成员", "ADD GROUP": "加入这个分组", "REMOVE GROUP": "删除这个分组", "Stored only in this browser.": "只保存在这个浏览器里。",
  "TASTE / LISTENING PORTRAIT": "审美 / 聆听肖像", "The archive as a print.": "把档案印成一幅肖像。", "Track shapes and album landscapes become one sampled composition—not a dashboard.": "单曲形状和专辑地形被取样、叠合成一幅作品，而不是数据看板。", "9+ TRACKS": "9 分以上", "FAVORITES": "最爱", "ALL TIME": "全部年份",
  "JOURNAL": "日志", "JOURNAL / CORRECTION": "日志 / 修正", "Entry not found.": "找不到这条记录。", "It may already have been removed.": "它也许已经被删除了。", "LOCKED RECORD": "原记录不可更改", "MOMENT TIME": "音乐瞬间", "MOMENT NOTE": "那一刻发生了什么", "HISTORICAL NOTE": "当时的笔记", "SAVE HISTORY CORRECTION": "保存这次修正", "CANCEL": "取消", "No correction recorded yet.": "这条记录还没有修正过。", "EDIT HISTORY": "修正这条记录", "REMOVE ENTRY": "删除这条记录", "CONFIRM REMOVE": "确认删除", "NO ENTRIES YET": "日志还是空的", "The timeline begins with a saved rating.": "保存第一份评分后，时间线就会从这里开始。", "Rate a track or complete an album session to create the first entry.": "为一首歌评分，或完成一张专辑的评分，就会留下第一条记录。", "BEGIN A RATING →": "开始一次评分 →",
  "Taste over time.": "一路听来，什么变了？", "The archive records what stays. Journal records what changes.": "档案收下那些留下来的音乐；日志记住一路发生的变化。", "MEMORY PALACE →": "音乐记忆馆 →", "ARCHIVE ENTROPY →": "档案熵 →", "REDISCOVER": "重新听听", "RATE AGAIN": "重新评分", "SKIP FOR NOW": "这次先跳过", "No archived rating is six months old yet.": "还没有哪条评分沉淀满六个月。", "ANNUAL INDEX": "年度索引", "ALBUM COMPLETED": "完成专辑评分", "CORRECTED": "后来修正", "WHY THIS WORKED IN THIS SNAPSHOT": "当时为什么喜欢它", "This edits one historical snapshot only. Record identity stays linked to the original Track or Album.": "这里只修改当时留下的那条记录，不会改变它对应的单曲或专辑。",
  "JOURNAL / MEMORY PALACE": "日志 / 音乐记忆馆", "A spatial index of what stayed.": "为那些留下来的歌，找到各自的位置。", "A two-dimensional archive of discoveries, growers, moments and turning points—not a literal room.": "这是一张二维的记忆索引：新发现、慢慢喜欢上的歌、难忘瞬间和转折点，都可以在这里找到位置。", "No memory placed here yet.": "这里还没有放入任何音乐记忆。", "PLACE A MEMORY": "放入一段记忆", "TYPE": "类型", "RECORD": "对应记录", "ZONE": "放在哪一区", "DATE": "日期", "WHY IT BELONGS HERE": "为什么把它放在这里", "IMPORTANCE": "对我有多重要", "PLACE IN ARCHIVE": "放进记忆馆", "OPEN RECORD →": "查看原记录 →", "REMOVE": "移除",
  "JOURNAL / ARCHIVE ENTROPY": "日志 / 档案熵", "Is the archive widening?": "档案在变宽，还是逐渐收拢？", "A higher number means the archive is more distributed. A lower number means it is more specialized. Neither is better.": "数字越高，说明聆听分布越广；越低，说明兴趣越集中。它只表示方向，不分好坏。", "ARTIST CONCENTRATION": "艺人集中度", "TRAIT DIVERSITY": "审美特征多样度", "ERA SPREAD": "年代跨度", "ALBUM DEPTH": "专辑聆听深度", "EXPLORATION RATE": "探索比例", "NO TIME SERIES YET": "还没有足够的时间记录", "Entropy begins after three dated track ratings.": "积累至少三条带日期的单曲评分后，才会开始计算档案熵。", "SAVE A RATING →": "保存一次评分 →",
  "SEARCH": "搜索", "SEARCH THE RECORD": "搜索整份档案", "Find anything in the archive.": "找回档案里的任何一段线索。", "Tracks, albums, artists, Journal entries, Memory and Taste DNA share one local index.": "单曲、专辑、艺人、日志、音乐记忆和审美 DNA，都收在同一个本地索引里。", "Title, artist, note, trait…": "标题、艺人、笔记、审美特征……", "OPEN →": "打开 →", "LOCAL INDEX": "仅搜索本地资料", "Search does not send your query or personal data to a server.": "搜索内容和个人资料都不会发送到服务器。", "No local record matches this search.": "档案里没有找到与之相符的记录。", "In the archive": "已收入档案", "Saved listening entry": "保存过的聆听记录", "ALBUM NOTE": "专辑笔记", "MEMORY": "音乐记忆", "Placed manually": "由你亲自放入", "Derived from saved evidence": "根据已有记录生成",
  "MELODY": "旋律", "HARMONY": "和声", "GROOVE": "律动", "ARRANGEMENT": "编曲", "VOCAL TEXTURE": "人声音色", "LYRIC": "歌词", "ATMOSPHERE": "氛围", "SURPRISE": "惊喜", "INEXPLICABLE": "难以解释", "WARM / COLD": "温暖 / 冷冽", "WARM": "温暖", "COLD": "冷冽", "DENSE / SPARSE": "密集 / 疏朗", "DENSE": "密集", "SPARSE": "疏朗", "DIRECT / ABSTRACT": "直接 / 抽象", "DIRECT": "直接", "ABSTRACT": "抽象", "CONTROLLED / LOOSE": "克制 / 松弛", "CONTROLLED": "克制", "LOOSE": "松弛",
  "The people at the center.": "这些人，构成了聆听的中心。", "Editorial notes first. A signature summarizes recurring geometry without replacing the reason an artist matters.": "先读我为什么记住这位艺人；几何签名只概括反复出现的听感形状，不能取代真正的原因。", "Origin point for active listening": "主动聆听的起点", "Open artist": "进入艺人档案",
  "Choose a track and enter only facts you can confirm. Provenance is stored per field; unchanged canonical values are not duplicated as overrides.": "选择一首歌，只填写你能够确认的事实。每个字段分别保存来源；与原资料相同的内容不会重复写成修正。",
  "Two landscapes, without forcing a verdict.": "两道专辑地形，不急着分出高下。", "Sequence, coverage and saved ratings remain visible; missing evidence is never completed automatically.": "曲序、评分覆盖和已有分数都会如实呈现；缺失的部分不会自动补齐。", "Two albums need a confirmed sequence or album score.": "至少需要两张已经确认曲序或已有专辑评分的专辑。", "Import an ordered album or complete an album rating. Missing scores stay blank.": "请先按曲序导入专辑，或完成一张专辑的评分；缺失分数会继续留空。", "IMPORT AN ALBUM →": "导入一张专辑 →",
  "A song can be minimal or maximal, innovative or inherited, unified or full of detours. The format is never the rule. The question is whether every choice feels intentional and alive.": "一首歌可以极简，也可以繁复；可以创新，也可以承袭；可以一气呵成，也可以不断绕路。形式从来不是规则，关键在于每个选择是否有意图、是否仍然鲜活。", "A great ending raises the whole evaluation a bit; it does not rescue a weak foundation.": "一个精彩的结尾会稍稍抬高整首歌，却救不了薄弱的根基。",
  "This is the average distance between your Overall scores and Andrew’s—not a compatibility verdict.": "这是你的总体评分与 Andrew 之间的平均距离，只描述分数有多接近，不判断彼此是否合拍。", "The voice matters as interpretation, not only technique.": "我在意人声如何诠释一首歌，不只在意技巧。",
  "Production earns attention when it changes how the song is understood.": "当制作改变了我理解一首歌的方式，它才真正值得注意。",
  "LOCAL SOURCE LABEL": "本地来源名称", "Untitled playlist": "未命名歌单", "SAVE LABEL": "保存名称", "SYNC NOW": "立即同步", "CHECKING…": "正在检查……", "REMOVE SOURCE": "移除这个来源", "CONFIRM REMOVE": "确认移除", "Import a public playlist once to create a local sync source.": "导入一次公开歌单后，这里会建立一个可同步的本地来源。", "No imported records yet.": "收件箱里还没有导入记录。",
  "PLAYLIST FOUND": "已找到歌单", "IMPORT COMPLETE": "导入完成", "OPEN INBOX": "打开收件箱", "Review them before adding them to the archive.": "请先在收件箱逐首核对，再决定是否归档。", "Existing": "已存在", "AUTO MATCH": "自动匹配", "LEGACY RECORD": "既有记录", "NEW ENTRY": "新记录", "IGNORE": "忽略", "ARCHIVE": "归档", "imported": "刚导入", "heard": "听过", "rated": "已评分", "archived": "已归档", "auto_match": "自动匹配", "review": "待核对", "new_entry": "新记录", "existing": "已存在",
  "READING PLAYLIST…": "正在读取歌单……", "Checking public QQ Music metadata.": "正在读取 QQ 音乐公开资料。", "Checking public NetEase playlist metadata.": "正在读取网易云音乐公开资料。", "IMPORT NOT AVAILABLE": "暂时无法导入", "Could not read this playlist.": "无法读取这个歌单。", "Please paste a public QQ Music playlist link.": "请粘贴一个公开的 QQ 音乐歌单链接。", "Please paste a public NetEase Cloud Music playlist link.": "请粘贴一个公开的网易云音乐歌单链接。", "Searching QQ Music…": "正在搜索 QQ 音乐……", "No public QQ Music tracks found.": "没有找到公开的 QQ 音乐曲目。", "ADD TO INBOX": "加入收件箱", "ALREADY KNOWN": "已经收录", "ADDED": "已加入",
  "READING ALBUM…": "正在读取专辑……", "Resolving the public link and preserving its official sequence.": "正在解析公开链接并读取官方曲序。", "ALBUM NOT AVAILABLE": "暂时无法读取专辑", "Could not read this album.": "无法读取这张专辑。", "ALBUM ALREADY EXISTS": "专辑已存在", "ALBUM FOUND": "已找到专辑", "EXISTS": "已存在", "NEEDS REVIEW": "需要核对", "NEW": "新记录", "OPEN EXISTING ALBUM": "打开已有专辑", "IMPORT ALBUM": "导入专辑", "OPEN ALBUM": "打开专辑", "IMPORT NOT SAVED": "导入未保存", "The album stayed unchanged.": "这张专辑没有发生改动。",
  "SNAPSHOT DIFFERENCE": "歌单变化", "NEW IN SOURCE": "来源中新加入", "NO LONGER IN SOURCE": "来源中已移除", "Removed source entries remain untouched in your Inbox, Library, ratings and notes.": "从来源歌单移除的歌曲，仍会保留在你的收件箱、资料库、评分和笔记中。", "ADD NEW + SAVE SNAPSHOT": "加入新曲并保存快照", "SAVE SNAPSHOT ONLY": "只保存快照", "Up to date · snapshot saved": "已经是最新状态 · 快照已保存", "Snapshot saved. Removed source entries were not deleted locally.": "快照已保存；来源中移除的歌曲没有从本地删除。", "Snapshot saved without importing additions.": "快照已保存，没有导入新增曲目。", "No local tracks, ratings or notes were deleted.": "本地歌曲、评分和笔记都没有被删除。", "Could not sync this playlist.": "无法同步这个歌单。", "Reading the latest public playlist snapshot…": "正在读取最新的公开歌单快照……",
  "BACKUP DUE — EXPORT A COPY OF THIS BROWSER'S ARCHIVE.": "该备份了——请导出一份这个浏览器里的档案。", "Export covers ratings, Journal, Inbox, Memory, analysis inputs, metadata corrections and album drafts. Restore previews conflicts before anything changes and keeps one complete rollback.": "备份会包含评分、日志、收件箱、音乐记忆、分析资料、资料修正和专辑草稿。恢复前会先预览冲突；完成后仍可完整撤销一次。", "Plain JSON is readable text. For a private copy, enter a password and use the encrypted export. The password cannot be recovered by this site.": "普通 JSON 可以直接阅读。若要保存更私密的副本，请输入密码并导出加密备份；这个网站无法替你找回密码。", "Up to 20 before-change snapshots are kept in this browser. The latest complete backup restore can also be rolled back in one step.": "这个浏览器最多保留 20 个变更前快照。最近一次完整恢复也可以一步撤销。", "Restore the value saved immediately before this local change.": "恢复到这次本地变更发生前的内容。",
  "Plain JSON": "普通 JSON", "is readable text. For a private copy, enter a password and use the encrypted export. The password cannot be recovered by this site.": "可以直接阅读。若要保存更私密的副本，请输入密码并导出加密备份；这个网站无法替你找回密码。", "No recovery snapshots yet. They appear after local data changes.": "还没有恢复快照。第一次修改本地资料后，这里就会出现记录。",
  "FIRST DISCOVERIES": "初次发现", "GROWERS": "越听越喜欢", "PERFECT MOMENTS": "完美瞬间", "PERSONAL CANON": "私人经典", "REINTERPRETATIONS": "重新诠释", "TURNING POINTS": "转折点",
  "Manual entries stay in this browser and in local backup.": "你亲手放入的记忆只留在这个浏览器和本地备份中。", "The first period establishes a baseline; breadth and concentration are not value judgments.": "第一段时间只用来建立基准；听得广或听得集中，都不是价值判断。", "The first qualifying quarter establishes a baseline; later quarters reveal direction.": "第一个符合条件的季度只建立基准；往后的季度才会慢慢显出变化方向。", "AVAILABLE: ARTIST CONCENTRATION · EXPLORATION RATE. Calculated from cumulative saved Journal ratings by quarter. The 0–100 index is a directional summary, not a precise measurement. Missing tags, years or album metadata stay absent from the relevant dimension. This is a low-evidence baseline and may move sharply with a few ratings.": "当前可用：艺人集中度 · 探索比例。数据按季度累积已保存的日志评分计算。0–100 只概括变化方向，不是精密测量；缺少标签、年份或专辑资料时，相应维度会保持空白。目前证据仍少，几次新评分就可能让结果明显变化。",
  "A year described by listening evidence.": "这一年，由一条条聆听记录慢慢写成。", "The year is waiting for its first entry.": "这一年还在等第一条聆听记录。", "No missing score, timestamp or discovery is inferred.": "缺失的分数、时间点和新发现，都不会被擅自补写。", "VIEW LISTENING PORTRAIT": "查看年度聆听肖像", "YEAR AT A GLANCE": "这一年，一眼看完", "Not enough evidence": "记录还不够", "HIGHEST TRACK": "年度最高分单曲", "HIGHEST ALBUM": "年度最高分专辑", "BIGGEST GROWER": "进步最大", "BIGGEST DISAPPOINTMENT": "落差最大", "NEW DISCOVERY": "年度新发现", "MOST COMMON REASON": "最常出现的喜欢理由", "STRANGEST RATING": "最出人意料的评分", "highest saved Overall": "已保存的最高总体评分", "highest saved album Overall": "已保存的最高专辑总评分", "Requires two ratings of the same track.": "同一首歌至少需要两次评分。", "Requires a negative change across two ratings.": "同一首歌需要出现两次评分，并且后来有所下降。", "Requires a rated imported record.": "需要至少一条已评分的导入记录。", "Save a listening reason with a rating.": "评分时记下一个喜欢它的理由。", "Requires all four rating dimensions.": "需要完整保存四个评分维度。", "METHOD": "计算方式", "Grower and disappointment compare the first and latest saved Overall for the same track. New discovery means the first rated record imported from outside the canonical Archive. “Strangest” means the largest absolute gap between Overall and the mean of the other three dimensions. Awards remain unpublished until manually selected.": "“进步最大”和“落差最大”比较同一首歌第一次与最近一次保存的总体评分；“年度新发现”指今年第一次评分、且从正式档案之外导入的记录；“最出人意料”指总体评分与另外三个维度平均值之间的最大差距。年度奖项只有在你亲自选择后才会公布。",
  "A year rendered as listening geometry.": "把这一年的聆听画成几何。", "This portrait is waiting for ratings.": "这幅年度肖像还在等待评分。", "Layered Track Radars and Album landscapes are sampled from saved evidence only.": "层叠的单曲雷达与专辑地形，只取样自你真正保存过的记录。",
  "Strength": "强度", "Confidence": "可信度", "Vocal Interpretation": "人声诠释", "Production Curiosity": "制作敏感度", "Strength combines the supporting tracks' average Overall, lift above your archive baseline and score consistency. Confidence increases with evidence count, consistency and recency. Neither number predicts whether a new track will work.": "强度综合了支持歌曲的平均总分、它们高出档案基准的幅度，以及评分是否稳定。证据越多、越一致、越新，可信度就越高。两个数字都不会预测一首新歌是否会打动你。", "No contributing track falls below the current archive baseline.": "支持这一基因的歌曲，没有一首低于当前档案基准。",
  "PERSONAL MUSIC AWARDS": "个人音乐奖", "Suggestions are evidence. Winners are a decision.": "候选来自已有记录，得奖者由你决定。", "Every category may remain unselected.": "每个奖项都可以暂时留空。", "BEST MELODY": "最佳旋律", "NO SELECTION": "暂不选择", "BEST ARRANGEMENT": "最佳编曲", "BEST VOCAL INTERPRETATION": "最佳人声诠释", "BEST SURPRISE": "最佳惊喜", "MOST CONFUSING SONG": "最让我困惑的歌", "BEST ONE PERFECT MOMENT": "年度最佳瞬间", "BEST ALBUM LANDSCAPE": "最佳专辑地形", "CONFIRM AWARDS": "保存年度奖项", "No winners confirmed.": "还没有确认任何得奖者。",
  "06 / LISTENING PORTRAIT →": "06 / 聆听肖像 →",
  "That page is not in the archive.": "档案中没有这个页面。", "RETURN HOME": "返回首页", "BACK HOME": "返回首页", "BACK TO ARCHIVE": "返回档案", "BACK TO RATE": "返回评分", "BACK TO TASTE": "返回审美", "BACK TO IMPORT": "返回导入", "BACK TO JOURNAL": "返回日志", "MENU": "菜单", "METHOD ↗": "方法 ↗", "HOW I HEAR MUSIC": "我如何听见音乐", "PERSONAL ARCHIVE / ISSUE 001": "个人音乐档案 / 第 001 期", "A newer archive shell is ready.": "网站更新已准备好。", "RELOAD UPDATE": "重新载入更新"
};

const patterns = [
  [/^(\d+) recorded tracks$/, (m) => `已收录 ${m[1]} 首歌`],
  [/^(\d+) albums in view$/, (m) => `共 ${m[1]} 张专辑`],
  [/^(\d+) artists in view$/, (m) => `共 ${m[1]} 位艺人`],
  [/^(\d+) heard · (\d+) waiting$/, (m) => `听过 ${m[1]} 首 · 还有 ${m[2]} 首待评分`],
  [/^(\d+) tracks have gaps\.$/, (m) => `${m[1]} 首单曲存在资料缺口。`],
  [/^(\d+) missing$/, (m) => `缺少 ${m[1]} 项`],
  [/^(.+) · (\d+) missing$/, (m) => `${m[1]} · 缺少 ${m[2]} 项`],
  [/^(\d+) RATED · (.+)$/, (m) => `${m[1]} 首已评分 · ${m[2]}`],
  [/^Saved in this browser with (\d+) listening reasons?\.$/, (m) => `已保存在这个浏览器里，也记下了 ${m[1]} 个喜欢它的理由。`],
  [/^(.+) and (\d+) Track ratings were saved together\.$/, (m) => `${m[1]} 与 ${m[2]} 首单曲评分已一并保存。`],
  [/^(\d+) local data groups restored\. A complete rollback is available below\.$/, (m) => `已恢复 ${m[1]} 个本地数据组；下方可执行完整回滚。`],
  [/^(\d+) tracks entered Inbox\.$/, (m) => `${m[1]} 首歌已经进入收件箱。`],
  [/^(\d+) public tracks$/, (m) => `${m[1]} 首公开曲目`],
  [/^(\d+) to review$/, (m) => `${m[1]} 首待核对`],
  [/^by (.+) ·$/, (m) => `创建者：${m[1]} ·`],
  [/^by (.+) · (\d+) public tracks$/, (m) => `创建者：${m[1]} · ${m[2]} 首公开曲目`],
  [/^\+ (\d+) more tracks$/, (m) => `另有 ${m[1]} 首曲目`],
  [/^(.+) · (\d{4}) · (\d+) tracks$/, (m) => `${m[1]} · ${m[2]} · ${m[3]} 首曲目`],
  [/^(\d+) tracks · last checked (.+)$/, (m) => `${m[1]} 首 · 最近检查于 ${m[2]}`],
  [/^(.+) · possible match: (.+)$/, (m) => `${m[1]} · 可能匹配：${m[2]}`],
  [/^(\d+) added · (\d+) removed$/, (m) => `新增 ${m[1]} 首 · 移除 ${m[2]} 首`],
  [/^0 added · (\d+) removed · snapshot saved$/, (m) => `新增 0 首 · 移除 ${m[1]} 首 · 快照已保存`],
  [/^(\d+) new tracks entered Inbox\.$/, (m) => `${m[1]} 首新曲已进入收件箱。`],
  [/^(\d+) new$/, (m) => `新增 ${m[1]} 首`],
  [/^(\d+) existing$/, (m) => `已存在 ${m[1]} 首`],
  [/^(\d+) Existing$/, (m) => `已存在 ${m[1]} 首`],
  [/^(\d+) need review$/, (m) => `需核对 ${m[1]} 首`],
  [/^(.+) entered the Archive\.$/, (m) => `${m[1]} 已进入档案。`],
  [/^(\d+) tracks preserved in official order\.$/, (m) => `已按官方曲序保留 ${m[1]} 首曲目。`],
  [/^(\d+) possible duplicates remain marked for review\.$/, (m) => `仍有 ${m[1]} 条可能重复的记录等待核对。`],
  [/^IMPORT (\d+) TO INBOX$/, (m) => `将 ${m[1]} 首歌加入收件箱`],
  [/^DISC (\d+)$/, (m) => `第 ${m[1]} 碟`],
  [/^Results for “(.+)”\.$/, (m) => `以下是“${m[1]}”的搜索结果。`],
  [/^(\d+) RESULTS?$/, (m) => `${m[1]} 条结果`],
  [/^(\d{4}) IN MUSIC →$/, (m) => `回看 ${m[1]} 年的音乐 →`],
  [/^(\d{4}) IN MUSIC$/, (m) => `${m[1]} 年的音乐`],
  [/^(\d{4}) LISTENING PORTRAIT$/, (m) => `${m[1]} 年度聆听肖像`],
  [/^AVERAGE TRACK RATING · (\d+) SAVED RATINGS?$/, (m) => `单曲平均分 · 已保存 ${m[1]} 次评分`],
  [/^(\d+)% listening proximity\.$/, (m) => `聆听接近度 ${m[1]}%。`],
  [/^(\d+) TRACKS · AVG (.+) VS ARCHIVE (.+) · (\d+)% CONFIDENCE$/, (m) => `${m[1]} 首歌 · 平均 ${m[2]}，档案基准 ${m[3]} · 可信度 ${m[4]}%`],
  [/^(\d+) tracks average (.+), but no complete album rating is recorded\. This is an unexplored depth, not a prediction\.$/, (m) => `已有 ${m[1]} 首歌的平均分为 ${m[2]}，却还没有完成整张专辑的评分。这是一处尚未深入的空白，不是喜好预测。`],
  [/^(\d+) IGNORED · MATCH CONFIDENCE REMAINS VISIBLE IN EACH RECORD$/, (m) => `已忽略 ${m[1]} 条 · 每条记录仍会显示匹配可信度`],
  [/^(.+) · NEW ENTRY$/, (m) => `${m[1]} · 新记录`],
  [/^(\d+) · (FIRST DISCOVERIES|GROWERS|PERFECT MOMENTS|PERSONAL CANON|REINTERPRETATIONS|TURNING POINTS)$/, (m) => `${m[1]} · ${translateText(m[2], "zh-CN")}`],
  [/^Decrease (.+) score$/, (m) => `降低${translateText(m[1], "zh-CN")}评分`],
  [/^Increase (.+) score$/, (m) => `提高${translateText(m[1], "zh-CN")}评分`],
  [/^← BACK TO (.+)$/, (m) => `← 返回${translateText(m[1], "zh-CN")}`],
  [/^← BACK (.+)$/, (m) => `← 返回${translateText(m[1], "zh-CN")}`],
  [/^BACK TO (.+)$/, (m) => `返回${translateText(m[1], "zh-CN")}`]
];

let language = (() => {
  try { const saved = localStorage.getItem(storageKey); return supported.has(saved) ? saved : "en"; } catch { return "en"; }
})();
const originalText = new WeakMap();
const originalAttributes = new WeakMap();
let observer;

export const currentLanguage = () => language;
export const translateText = (value, target = language) => {
  const string = String(value ?? "");
  if (target !== "zh-CN") return string;
  const match = string.match(/^(\s*)([\s\S]*?)(\s*)$/); const core = match?.[2] || "";
  const translated = zh[core] || patterns.reduce((result, [pattern, replacement]) => result || (core.match(pattern) ? replacement(core.match(pattern)) : ""), "") || core;
  return `${match?.[1] || ""}${translated}${match?.[3] || ""}`;
};

export const formatTranslatedText = (value, { target = language, heading = false } = {}) => {
  const translated = translateText(value, target);
  return target === "zh-CN" && heading ? translated.replace(/。(\s*)$/, "$1") : translated;
};

const translateNode = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const next = language === "en" ? originalText.get(node) : formatTranslatedText(originalText.get(node), { heading: Boolean(node.parentElement?.closest?.("h1,h2,h3")) });
    if (node.nodeValue !== next) node.nodeValue = next;
    return;
  }
  if (!(node instanceof Element) || node.closest("[data-i18n-ignore]") || ["SCRIPT", "STYLE"].includes(node.tagName)) return;
  const stored = originalAttributes.get(node) || {};
  ["placeholder", "aria-label", "title"].forEach((attribute) => {
    if (node.hasAttribute(attribute) && !(attribute in stored)) stored[attribute] = node.getAttribute(attribute);
    if (attribute in stored) node.setAttribute(attribute, language === "en" ? stored[attribute] : translateText(stored[attribute]));
  });
  originalAttributes.set(node, stored);
  [...node.childNodes].forEach(translateNode);
};

export const applyLanguage = (root = document.body) => {
  document.documentElement.lang = language;
  translateNode(root);
  document.querySelectorAll("[data-language-toggle]").forEach((button) => {
    button.textContent = language === "zh-CN" ? "EN" : "中文";
    button.setAttribute("aria-label", language === "zh-CN" ? "Switch to English" : "切换到中文");
    button.setAttribute("aria-pressed", String(language === "zh-CN"));
  });
};

export const setLanguage = (next) => {
  language = supported.has(next) ? next : "en";
  try { localStorage.setItem(storageKey, language); } catch {}
  applyLanguage();
  window.dispatchEvent(new CustomEvent("languagechange", { detail: { language } }));
};

export const bindLanguageToggle = (onChange) => {
  const buttons = document.querySelectorAll("[data-language-toggle]"); if (!buttons.length) return;
  buttons.forEach((button) => { button.onclick = () => { setLanguage(language === "en" ? "zh-CN" : "en"); onChange?.(language); }; });
  applyLanguage();
};

export const observeLanguage = () => {
  if (observer || typeof MutationObserver === "undefined") return;
  observer = new MutationObserver((mutations) => {
    if (language !== "zh-CN") return;
    mutations.forEach((mutation) => {
      if (mutation.type === "characterData") translateNode(mutation.target);
      mutation.addedNodes.forEach(translateNode);
    });
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
};
