const storageKey = "how-i-hear-music:language:v1";
const supported = new Set(["en", "zh-CN"]);

const zh = {
  "Home": "首页", "Archive": "档案", "Rate": "评分", "Taste": "审美", "Import": "导入", "Journal": "日志", "Search": "搜索",
  "Tracks": "单曲", "Albums": "专辑", "Artists": "艺人", "Metadata": "资料", "Profile": "画像", "Philosophy": "理念", "Compare": "对比",
  "PERSONAL ARCHIVE / ISSUE 001": "个人音乐档案 / 第 001 期", "How I": "我如何", "hear music.": "听见音乐。",
  "Melody opens the door.": "旋律打开第一扇门。", "Everything else has to earn its place.": "其余一切，都要证明自己为何存在。",
  "READ THE METHOD ↓": "阅读聆听方法 ↓", "CURRENTLY LISTENING": "最近在听", "Open": "打开",
  "FEATURED SHAPE": "本期单曲形状", "EXPLORE TRACK →": "查看单曲 →", "FEATURED LANDSCAPE": "本期专辑地形", "EXPLORE ALBUM →": "查看专辑 →",
  "ENTER THE ARCHIVE": "进入音乐档案", "TRACKS →": "单曲 →", "ALBUMS →": "专辑 →", "ARTISTS →": "艺人 →",
  "Music can be minimal or maximal, familiar or surprising. The only question is whether it stays alive.": "音乐可以极简，也可以繁复；可以熟悉，也可以出人意料。唯一的问题是：它是否仍然鲜活。",
  "ABOUT THIS ARCHIVE": "关于这个档案",
  "ARCHIVE": "档案", "Browse the record.": "浏览这份音乐记录。", "Tracks, albums and artists that have entered the archive.": "已经进入档案的单曲、专辑与艺人。",
  "TRACKS": "单曲", "ALBUMS": "专辑", "ARTISTS": "艺人", "Enter →": "进入 →", "Open track": "打开单曲", "Open album": "打开专辑",
  "ARCHIVE / TRACKS": "档案 / 单曲", "Tracks in the record.": "档案中的单曲。", "Formal and ordered album entries. Ratings are never inferred.": "正式、按顺序保存的音乐记录；评分绝不推测。",
  "Search tracks or artists": "搜索单曲或艺人", "ALL": "全部", "RATED": "已评分", "BEYOND SCALE": "超出常规量表", "TASTE EVIDENCE": "审美证据", "ALL TRAITS": "全部特征", "SORT": "排序", "ARCHIVE ORDER": "档案顺序", "RATING HIGH–LOW": "评分从高到低", "TITLE A–Z": "标题 A–Z", "ARTIST A–Z": "艺人 A–Z",
  "No tracks match this view.": "当前筛选条件下没有单曲。", "NO SCORED GEOMETRY": "暂无评分图形", "NO RATED TERRAIN": "暂无评分地形", "NO COVER": "暂无封面",
  "ARCHIVE / ALBUMS": "档案 / 专辑", "Albums in view.": "档案中的专辑。", "A cover, an overall response, a compact terrain.": "一张封面、一个总体感受，以及一幅紧凑的评分地形。", "COMPARE ALBUMS": "比较专辑",
  "ARCHIVE / ARTISTS": "档案 / 艺人", "Track not found.": "没有找到这首单曲。", "Album not found.": "没有找到这张专辑。", "Artist not found.": "没有找到这位艺人。",
  "This record may not have a confirmed archive entry.": "这条记录可能尚未建立已确认的档案条目。", "This album is not in the current archive.": "当前档案中没有这张专辑。",
  "Back to tracks": "返回单曲", "Back to albums": "返回专辑", "RATE TRACK": "为单曲评分", "RATE ALBUM": "为专辑评分",
  "ARTIST": "艺人", "STATUS": "状态", "VERSION": "版本", "BASE RECORDING": "基础录音版本", "Recorded": "已收录",
  "THIS TRACK ACTIVATES": "这首歌触发的审美基因", "READ TASTE DNA →": "查看审美 DNA →", "WHY THIS WORKS": "为什么它成立", "MUSICAL MOMENTS": "音乐瞬间", "LISTENING TEMPERATURE": "声音性格", "VERSIONS": "版本", "RATING HISTORY": "评分历史",
  "No explicit listening reasons have been saved yet.": "尚未保存明确的喜欢原因。", "No confirmed timestamped moments have been recorded yet.": "尚未记录带时间点的音乐瞬间。", "No local rating changes recorded yet.": "尚未记录本地评分变化。",
  "ARCHIVE / METADATA": "档案 / 资料", "Know what the archive actually knows.": "看清档案真正掌握了什么。", "Coverage is reported without filling gaps. Corrections are owner-confirmed and stored only in this browser.": "只报告已有资料覆盖率，不擅自补全；修正由你确认，并仅保存在此浏览器。",
  "COMPLETE RECORDS": "资料完整记录", "ALBUM": "专辑", "RELEASE DATE": "发行日期", "LANGUAGE": "语言", "REGION": "地区", "ALL RECORDS": "全部记录", "MISSING ONLY": "仅看缺失项", "REVIEW QUEUE": "核对队列", "TRACK": "单曲", "REVIEW": "核对", "CONFIRMED VALUE": "已确认内容", "SOURCE URL": "来源网址", "EVIDENCE NOTE": "证据说明", "SAVE FIELD EVIDENCE": "保存字段证据", "No local correction saved.": "尚未保存本地修正。",
  "RATE": "评分", "Begin with one listening decision.": "从一次真实的聆听判断开始。", "Choose a shape for one track, or a landscape for an album.": "为单曲画出形状，或为专辑形成一片地形。",
  "01 / TRACK": "01 / 单曲", "02 / ALBUM": "02 / 专辑", "Listening Shape": "单曲形状", "Listening Landscape": "专辑地形", "Four dimensions, one personal response.": "四个维度，一次个人回应。", "Build a score curve from a confirmed track order.": "根据已确认曲序构建评分曲线。", "Import a confirmed track order before rating an album.": "请先导入已确认曲序，再为专辑评分。",
  "RATE A TRACK": "为单曲评分", "RATE AN ALBUM": "为专辑评分", "IMPORT AN ALBUM": "导入专辑", "UNRATED QUEUE": "待评分队列", "Imported records stay here until listening becomes a rating.": "导入的记录会留在这里，直到聆听成为一次评分。", "OPEN QUEUE": "打开队列", "CONTINUE RATING": "继续评分", "Choose from a confirmed record:": "从已确认记录中选择：",
  "RATE / UNRATED QUEUE": "评分 / 待评分队列", "What have you heard but not rated?": "哪些音乐听过，却还没有评分？", "Heard records lead; newly imported records remain visible underneath.": "已听记录优先显示，新导入记录列在其后。", "MARK HEARD": "标记为已听", "QUEUE CLEAR": "队列已清空", "No heard or imported track is waiting for a rating.": "没有已听或已导入的单曲等待评分。", "IMPORT MUSIC →": "导入音乐 →",
  "RATE / TRACK": "评分 / 单曲", "No rating was opened or changed.": "没有打开或更改任何评分。", "BACK TO TRACKS": "返回单曲", "DRAG A NODE / OR USE PRECISE CONTROLS": "拖动节点 / 或使用精确控制", "SET THE SHAPE": "设定形状", "Move the graph first; use the controls to refine it.": "先移动图形，再用控件精确调整。",
  "Song": "歌曲", "Vocal": "演唱", "Production": "制作", "Overall": "总体", "SONG": "歌曲", "VOCAL": "演唱", "OVERALL": "总体",
  "Song score": "歌曲评分", "Vocal score": "演唱评分", "Production score": "制作评分", "Overall score": "总体评分", "Your final feeling": "你的最终感受", "WHAT MAKES IT WORK? / SELECT WHAT IS TRUE": "它为什么成立？/ 选择符合的原因", "ONE MOMENT": "一个瞬间", "TIME": "时间", "WHAT HAPPENS": "发生了什么", "LONG PRIVATE NOTE / OPTIONAL": "私人长笔记 / 可选", "SAVE RATING": "保存评分",
  "RATING SAVED": "评分已保存", "Saved in this browser": "已保存到此浏览器。", "Saved in this browser.": "已保存到此浏览器。", "THEN": "之前", "NOW": "现在", "CHANGE": "变化", "VIEW TRACK": "查看单曲", "BACK TO QUEUE": "返回队列", "UNDO THIS SAVE": "撤销本次保存", "SAVE UNDONE": "已撤销保存", "The previous rating and lifecycle state were restored. The new Journal entry was removed.": "已恢复先前评分和记录状态，并移除新建的日志条目。", "The prior Track ratings, album draft and Journal were restored.": "已恢复先前的单曲评分、专辑草稿与日志。", "The album rating is incomplete.": "专辑评分尚未完成。",
  "RATE / ALBUM": "评分 / 专辑", "BACK TO ALBUMS": "返回专辑", "CONFIRMED TRACK ORDER REQUIRED": "需要已确认曲序", "This album cannot be rated yet.": "这张专辑暂时无法评分。", "Import or confirm the official track sequence first. Placeholder tracks and inferred scores are never created.": "请先导入或确认官方曲序；网站不会创建占位曲目或推测评分。", "IMPORT OFFICIAL SEQUENCE": "导入官方曲序", "BUILD THE LANDSCAPE": "构建专辑地形", "Drag a point to shape the curve; use the track controls to refine it.": "拖动节点塑造曲线，再用单曲控件精确调整。", "TRACK-BY-TRACK": "逐曲评分", "ALBUM OVERALL": "专辑总体评分", "COMPLETE ALBUM RATING": "完成专辑评分", "ALBUM COMPLETE": "专辑评分已完成", "VIEW ALBUM": "查看专辑", "ALBUM NOT SAVED": "专辑评分未保存",
  "IMPORT": "导入", "Bring music in.": "把音乐带进档案。", "Playlists enter Inbox; a confirmed album import creates its ordered Archive record.": "歌单先进入收件箱；已确认的专辑导入会建立有序档案。", "QQ MUSIC": "QQ 音乐", "NETEASE": "网易云音乐", "Playlist or album.": "歌单或专辑。", "Import a public playlist.": "导入公开歌单。", "Review playlist tracks in Inbox, or preserve an album's official sequence.": "在收件箱核对歌单曲目，或保存专辑官方曲序。", "Read public playlist metadata through the server, with no login, Cookie, audio or lyrics.": "通过服务读取公开歌单资料，不使用登录、Cookie、音频或歌词。", "IMPORT FROM QQ →": "从 QQ 音乐导入 →", "IMPORT FROM NETEASE →": "从网易云音乐导入 →",
  "QQ Playlist": "QQ 歌单", "QQ Album": "QQ 专辑", "NetEase": "网易云音乐", "Inbox": "收件箱", "Data Desk": "数据台",
  "STATIC SITE / METADATA SERVICE NOT CONNECTED": "静态网站 / 资料服务未连接", "Browsing, rating and local data remain available. Public QQ Music and NetEase import requires the local Node server or a configured hosted adapter.": "浏览、评分和本地数据仍可使用。导入 QQ 音乐或网易云公开资料需要本地 Node 服务或已配置的托管适配器。", "LOCAL SETUP ↗": "本地设置 ↗", "METADATA SERVICE": "资料服务", "Hosted adapter configured.": "托管适配器已配置。", "Local metadata adapter ready.": "本地资料适配器已就绪。",
  "IMPORT / QQ MUSIC": "导入 / QQ 音乐", "Bring a QQ record in.": "导入一条 QQ 音乐记录。", "Public metadata only: no QQ login, Cookie, audio or lyrics.": "仅使用公开资料：不使用 QQ 登录、Cookie、音频或歌词。", "01 / PLAYLIST IMPORT": "01 / 歌单导入", "Paste the share at the desk.": "把分享内容粘贴到这里。", "One public playlist at a time. Nothing is added until you review the preview.": "每次处理一个公开歌单；预览确认前不会写入任何内容。", "QQ MUSIC PLAYLIST / SHARE CARD": "QQ 音乐歌单 / 分享卡片", "Paste a QQ Music playlist link or share text": "粘贴 QQ 音乐歌单链接或分享文字", "PREVIEW IMPORT": "预览导入", "IMPORT PREVIEW": "导入预览", "Waiting for a public playlist link.": "等待公开歌单链接。", "02 / QQ MUSIC CATALOG": "02 / QQ 音乐曲库", "Looking for one track instead? Search the public catalog and send it straight to Inbox.": "只找一首歌？搜索公开曲库并直接送入收件箱。", "Search tracks, artists or albums": "搜索单曲、艺人或专辑", "SEARCH QQ MUSIC": "搜索 QQ 音乐",
  "IMPORT / QQ ALBUM": "导入 / QQ 专辑", "Preserve the record's sequence.": "保留专辑原本的顺序。", "Paste one public QQ Music album link. Preview every disc and track before the local Archive changes.": "粘贴一个公开 QQ 音乐专辑链接；本地档案改变前会预览每张碟和每首曲目。", "ORDERED ALBUM IMPORT": "有序专辑导入", "Start with the album itself.": "从专辑本身开始。", "Metadata only. Track order comes from the exact QQ Music album entity—never search results or recommendations.": "仅导入资料；曲序来自准确的 QQ 音乐专辑实体，而非搜索结果或推荐。", "QQ MUSIC ALBUM / SHARE TEXT": "QQ 音乐专辑 / 分享文字", "Paste an album URL or the full QQ Music share message": "粘贴专辑网址或完整 QQ 音乐分享文字", "DETECT ALBUM": "识别专辑", "ALBUM PREVIEW": "专辑预览", "Waiting for a public QQ Music album link.": "等待公开 QQ 音乐专辑链接。",
  "IMPORT / NETEASE": "导入 / 网易云音乐", "Bring a NetEase record in.": "导入一条网易云音乐记录。", "Public metadata only: no NetEase login, Cookie, audio, cover download or lyrics.": "仅使用公开资料：不使用登录、Cookie、音频、封面下载或歌词。", "Paste the public share.": "粘贴公开分享内容。", "Playlist metadata enters the same Inbox review workflow as every other source.": "歌单资料会进入与其他来源相同的收件箱核对流程。", "NETEASE PLAYLIST / SHARE CARD": "网易云歌单 / 分享卡片", "Paste a NetEase Cloud Music playlist link or share text": "粘贴网易云音乐歌单链接或分享文字",
  "IMPORT / INBOX": "导入 / 收件箱", "Move music through the desk.": "让音乐依次通过工作台。", "Imported, heard and rated records stay out of Archive until you deliberately archive them.": "已导入、已听和已评分记录不会自动进入档案，直到你明确归档。", "IMPORTED": "已导入", "HEARD": "已听", "ARCHIVED": "已归档", "PLAYLIST SOURCES": "歌单来源", "Check what changed.": "检查发生了什么变化。", "Sync compares public snapshots. A removal never deletes a local track, rating or note.": "同步只比较公开快照；来源中删除项目不会删除本地单曲、评分或笔记。", "LOCAL DATA": "本地数据", "Keep the desk recoverable.": "让数据台始终可恢复。", "OPEN DATA DESK": "打开数据台",
  "IMPORT / DATA DESK": "导入 / 数据台", "Keep the archive recoverable.": "让档案始终可恢复。", "This site stores personal ratings and notes in this browser. Export a copy before clearing site data or moving devices.": "网站把个人评分和笔记保存在此浏览器；清除网站数据或更换设备前请先导出副本。", "LOCAL FOOTPRINT": "本地占用", "BROWSER QUOTA": "浏览器额度", "Checking…": "检查中…", "DATA GROUPS": "数据组", "RECOVERY POINTS": "恢复点", "LAST BACKUP": "上次备份", "Never": "从未", "BACKUP / RESTORE": "备份 / 恢复", "Move a versioned copy.": "转移一份有版本的副本。", "OPTIONAL BACKUP PASSWORD": "可选备份密码", "At least 10 characters": "至少 10 个字符", "EXPORT PLAIN JSON": "导出明文 JSON", "EXPORT ENCRYPTED": "导出加密备份", "CHOOSE BACKUP TO RESTORE": "选择要恢复的备份", "REQUEST DURABLE STORAGE": "申请持久存储", "RECOVERY": "恢复", "Recent local changes.": "最近的本地变更。", "ROLL BACK LAST RESTORE": "撤销上次恢复",
  "TASTE": "审美", "How I hear music.": "我如何听见音乐。", "The listening method behind the archive.": "这份档案背后的聆听方法。", "Listening Philosophy": "聆听理念", "Good ≠ Mine": "好 ≠ 适合我", "LISTENING PHILOSOPHY": "聆听理念", "MY TASTE PROFILE": "我的审美画像", "GOOD ≠ MINE": "好 ≠ 适合我", "COMPARE WITH ME": "与我比较", "The parts that need a reason to exist.": "每一个部分都需要存在的理由。", "A visual summary, not a personality test.": "视觉总结，而非性格测试。", "Respect and resonance are different things.": "认可与共鸣是两回事。", "Rate a track, then reveal the distance.": "先为单曲评分，再查看差异。",
  "TASTE DNA": "审美 DNA", "BLIND SPOTS": "审美盲区", "BOUNDARIES": "审美边界", "SONIC MAP": "声音地图", "TASTE CONSTELLATION": "审美星座", "LISTENING PORTRAIT": "聆听肖像",
  "TASTE / PHILOSOPHY": "审美 / 理念", "Every element needs a reason.": "每个元素都需要一个理由。", "Melody opens the door. Arrangement makes me stay. Details make me return.": "旋律让我走进来，编曲让我留下，细节让我再次回来。", "Surprise belongs to the song.": "惊喜应当属于歌曲本身。", "The human voice stays human.": "人的声音应当保持人的存在。",
  "The first barrier: the hardest gate, though not an absolute veto.": "第一道门槛，也是最难通过的一道，但并非绝对否决。", "Production / Arrangement": "制作 / 编曲", "Movement, shape, timing and the information that returns on replay.": "音乐的运动、形状、时机，以及重听时再次浮现的信息。", "Timbre + Lyrics": "音色 + 歌词", "Does this voice belong to this song? Is there meaning left to unfold?": "这个声音属于这首歌吗？其中是否还有尚待展开的意义？", "Vocal ability": "演唱能力", "Appreciated, but never the point by itself.": "值得欣赏，但它本身从来不是目的。", "All is considered.": "所有因素都会被考虑。", "Nothing is absolute.": "没有任何规则是绝对的。", "It depends on what catches attention.": "取决于是什么抓住了注意力。", "Resonance is real, but it is not a number.": "共鸣真实存在，但它不是一个数字。", "The first gate": "第一道门", "Surprise": "惊喜", "Reinterpretation": "重新诠释", "Emotional resonance": "情感共鸣",
  "TASTE / PROFILE": "审美 / 画像", "A listening profile.": "一份聆听画像。", "A compact map of priorities—not a verdict on music.": "一张紧凑的偏好地图，而不是对音乐的裁决。", "MELODY": "旋律", "PRODUCTION": "制作", "VOCAL SKILL": "演唱能力", "HARMONY": "和声", "GROOVE": "律动", "COMPLEXITY": "复杂度", "high priority": "高优先级", "appreciated, not decisive": "欣赏，但不具决定性", "strong affinity": "高度偏好", "context dependent": "取决于语境", "WHAT MAKES 9+ TRACKS WORK?": "9 分以上歌曲为什么成立？", "Not enough explicit listening reasons yet.": "明确的聆听原因还不足。",
  "TASTE / GOOD ≠ MINE": "审美 / 好 ≠ 适合我", "I know it's good. It's just not mine.": "我知道它很好，只是不属于我。", "Technical admiration and personal resonance do not need to agree.": "技术上的欣赏与个人共鸣不必一致。",
  "TASTE / COMPARE": "审美 / 对比", "Two ways of hearing.": "两种听见音乐的方式。", "Rate selected tracks in the dedicated workspace, then reveal the distance.": "在评分空间完成选定单曲，再查看听感距离。", "RATE A TRACK": "为单曲评分", "Comparison begins with a real score.": "比较从一次真实评分开始。", "Rate at least three archived tracks. Your ratings remain in this browser and no public profile is created.": "请至少为三首档案单曲评分；评分只留在此浏览器，不会建立公开档案。",
  "NOT ENOUGH EVIDENCE": "证据不足", "TASTE / BOUNDARIES": "审美 / 边界", "What probably won't work for me?": "什么可能不适合我？", "Patterns require at least three rated tracks. They describe recurring distance, never a genre stereotype.": "模式至少需要三首已评分单曲；它描述反复出现的距离，而不是类型刻板印象。", "No boundary repeats across three tracks yet.": "尚无同一边界在三首歌中重复出现。", "More explicit ratings may reveal a pattern; the site will not manufacture one.": "更多明确评分可能呈现模式；网站不会凭空制造结论。",
  "TASTE / DNA": "审美 / DNA", "What repeats beneath the ratings.": "评分之下，什么在反复出现。", "A trait needs at least five supporting tracks. Genre is not used as the primary explanation.": "一个特征至少需要五首歌曲支持；类型不是主要解释。", "HOW STRENGTH AND CONFIDENCE WORK": "强度与可信度如何计算", "INSPECT EVIDENCE": "查看证据", "CONTRIBUTING TRACKS": "支持该特征的单曲", "LIMITING EVIDENCE / BELOW BASELINE": "限制证据 / 低于基线", "ADD LISTENING EVIDENCE →": "添加聆听证据 →",
  "TASTE / BLIND SPOTS": "审美 / 盲区", "Where the archive has barely looked.": "档案尚未充分探索的地方。", "These are coverage gaps beside recurring taste evidence—not promises about what you will like.": "这些是稳定审美证据旁的覆盖空白，而不是对你会喜欢什么的承诺。", "CURRENT EVIDENCE": "当前证据", "EXPLORED": "已探索", "EVIDENCE SIGNAL": "证据信号", "TRAIT AFFINITY": "特征亲和度",
  "TASTE / SONIC MAP": "审美 / 声音地图", "Character, not quality.": "描述性格，而非评价质量。", "Choose two axes. Every point comes from an explicit local descriptor.": "选择两个坐标轴；每个点都来自明确保存的本地描述。", "X AXIS": "横轴", "Y AXIS": "纵轴", "REDRAW": "重新绘制", "NO SONIC CHARACTER YET": "尚无声音性格数据", "Save Listening Temperature on a Track detail page.": "请在单曲详情页保存声音性格。",
  "TASTE / CONSTELLATION": "审美 / 星座", "Musical family, without genre boxes.": "不被类型方框限制的音乐家族。", "One artist or track may appear in several manually curated branches.": "同一位艺人或同一首歌可以出现在多个手工整理的分支中。", "NO GROUPS YET": "尚无分组", "Build the first branch from what actually matters.": "从真正重要的联系开始建立第一个分支。", "CURATE A GROUP": "整理一个分组", "NAME": "名称", "DESCRIPTION": "说明", "MEMBER TYPE": "成员类型", "MEMBERS": "成员", "ADD GROUP": "添加分组", "REMOVE GROUP": "移除分组", "Stored only in this browser.": "仅保存在此浏览器。",
  "TASTE / LISTENING PORTRAIT": "审美 / 聆听肖像", "The archive as a print.": "让档案成为一幅印刷品。", "Track shapes and album landscapes become one sampled composition—not a dashboard.": "单曲形状与专辑地形组成一幅取样作品，而不是数据仪表盘。", "9+ TRACKS": "9+ 单曲", "FAVORITES": "最爱", "ALL TIME": "全部时间",
  "JOURNAL": "日志", "JOURNAL / CORRECTION": "日志 / 修正", "Entry not found.": "没有找到这条记录。", "It may already have been removed.": "它可能已经被移除。", "LOCKED RECORD": "已锁定记录", "MOMENT TIME": "瞬间时间", "MOMENT NOTE": "瞬间说明", "HISTORICAL NOTE": "历史笔记", "SAVE HISTORY CORRECTION": "保存历史修正", "CANCEL": "取消", "No correction recorded yet.": "尚未记录修正。", "EDIT HISTORY": "编辑历史", "REMOVE ENTRY": "移除条目", "CONFIRM REMOVE": "确认移除", "NO ENTRIES YET": "尚无条目", "The timeline begins with a saved rating.": "时间线从一次已保存的评分开始。", "Rate a track or complete an album session to create the first entry.": "为单曲评分或完成一次专辑评分，即可建立第一条记录。", "BEGIN A RATING →": "开始评分 →",
  "Taste over time.": "随时间变化的审美。", "The archive records what stays. Journal records what changes.": "档案记录留下来的音乐，日志记录发生的变化。", "MEMORY PALACE →": "记忆宫殿 →", "ARCHIVE ENTROPY →": "档案熵 →", "REDISCOVER": "重新发现", "RATE AGAIN": "重新评分", "SKIP FOR NOW": "暂时跳过", "No archived rating is six months old yet.": "目前还没有超过六个月的档案评分。", "ANNUAL INDEX": "年度索引", "ALBUM COMPLETED": "专辑评分完成", "CORRECTED": "已修正", "WHY THIS WORKED IN THIS SNAPSHOT": "这次历史评分为何成立", "This edits one historical snapshot only. Record identity stays linked to the original Track or Album.": "这里只修正一次历史快照；记录身份仍与原单曲或专辑保持关联。",
  "JOURNAL / MEMORY PALACE": "日志 / 记忆宫殿", "A spatial index of what stayed.": "为留下来的音乐建立空间索引。", "A two-dimensional archive of discoveries, growers, moments and turning points—not a literal room.": "以二维方式整理新发现、渐入佳境、音乐瞬间与转折点，而不是一间真正的房间。", "No memory placed here yet.": "这里尚未放置音乐记忆。", "PLACE A MEMORY": "放置一段记忆", "TYPE": "类型", "RECORD": "记录", "ZONE": "区域", "DATE": "日期", "WHY IT BELONGS HERE": "它为什么属于这里", "IMPORTANCE": "重要程度", "PLACE IN ARCHIVE": "放入档案", "OPEN RECORD →": "打开记录 →", "REMOVE": "移除",
  "JOURNAL / ARCHIVE ENTROPY": "日志 / 档案熵", "Is the archive widening?": "档案正在扩展吗？", "A higher number means the archive is more distributed. A lower number means it is more specialized. Neither is better.": "数值越高，档案越分散；数值越低，越集中。两种方向都没有高下。", "ARTIST CONCENTRATION": "艺人集中度", "TRAIT DIVERSITY": "特征多样度", "ERA SPREAD": "年代跨度", "ALBUM DEPTH": "专辑深度", "EXPLORATION RATE": "探索率", "NO TIME SERIES YET": "尚无时间序列", "Entropy begins after three dated track ratings.": "至少三条带日期的单曲评分后，才会开始计算档案熵。", "SAVE A RATING →": "保存一次评分 →",
  "SEARCH": "搜索", "SEARCH THE RECORD": "搜索档案", "Find anything in the archive.": "查找档案中的任何内容。", "Tracks, albums, artists, Journal entries, Memory and Taste DNA share one local index.": "单曲、专辑、艺人、日志、记忆与审美 DNA 共用一个本地索引。", "Title, artist, note, trait…": "标题、艺人、笔记、特征……", "OPEN →": "打开 →", "LOCAL INDEX": "本地索引", "Search does not send your query or personal data to a server.": "搜索不会把查询内容或个人数据发送到服务器。", "No local record matches this search.": "没有本地记录符合这次搜索。", "In the archive": "已在档案中", "Saved listening entry": "已保存的聆听记录", "ALBUM NOTE": "专辑笔记", "MEMORY": "记忆", "Placed manually": "手动放置", "Derived from saved evidence": "根据已保存证据生成",
  "MELODY": "旋律", "HARMONY": "和声", "GROOVE": "律动", "ARRANGEMENT": "编曲", "VOCAL TEXTURE": "人声音色", "LYRIC": "歌词", "ATMOSPHERE": "氛围", "SURPRISE": "惊喜", "INEXPLICABLE": "难以解释", "WARM / COLD": "温暖 / 冷冽", "WARM": "温暖", "COLD": "冷冽", "DENSE / SPARSE": "密集 / 疏朗", "DENSE": "密集", "SPARSE": "疏朗", "DIRECT / ABSTRACT": "直接 / 抽象", "DIRECT": "直接", "ABSTRACT": "抽象", "CONTROLLED / LOOSE": "克制 / 松弛", "CONTROLLED": "克制", "LOOSE": "松弛",
  "That page is not in the archive.": "档案中没有这个页面。", "RETURN HOME": "返回首页", "BACK HOME": "返回首页", "BACK TO ARCHIVE": "返回档案", "BACK TO RATE": "返回评分", "BACK TO TASTE": "返回审美", "BACK TO IMPORT": "返回导入", "BACK TO JOURNAL": "返回日志", "MENU": "菜单", "METHOD ↗": "方法 ↗", "HOW I HEAR MUSIC": "我如何听见音乐", "PERSONAL ARCHIVE / ISSUE 001": "个人音乐档案 / 第 001 期", "A newer archive shell is ready.": "网站更新已准备好。", "RELOAD UPDATE": "重新载入更新"
};

const patterns = [
  [/^(\d+) recorded tracks$/, (m) => `${m[1]} 首已收录单曲`],
  [/^(\d+) albums in view$/, (m) => `${m[1]} 张专辑`],
  [/^(\d+) artists in view$/, (m) => `${m[1]} 位艺人`],
  [/^(\d+) heard · (\d+) waiting$/, (m) => `${m[1]} 首已听 · ${m[2]} 首等待评分`],
  [/^(\d+) tracks have gaps\.$/, (m) => `${m[1]} 首单曲存在资料缺口。`],
  [/^(\d+) missing$/, (m) => `缺少 ${m[1]} 项`],
  [/^(\d+) RATED · (.+)$/, (m) => `${m[1]} 首已评分 · ${m[2]}`],
  [/^Saved in this browser with (\d+) listening reasons?\.$/, (m) => `已保存到此浏览器，并记录 ${m[1]} 个聆听原因。`],
  [/^(.+) and (\d+) Track ratings were saved together\.$/, (m) => `${m[1]} 与 ${m[2]} 首单曲评分已一并保存。`],
  [/^(\d+) local data groups restored\. A complete rollback is available below\.$/, (m) => `已恢复 ${m[1]} 个本地数据组；下方可执行完整回滚。`],
  [/^(\d+) tracks entered Inbox\.$/, (m) => `${m[1]} 首单曲已进入收件箱。`],
  [/^(\d+) public tracks$/, (m) => `${m[1]} 首公开曲目`],
  [/^(\d+) to review$/, (m) => `${m[1]} 首待核对`],
  [/^IMPORT (\d+) TO INBOX$/, (m) => `导入 ${m[1]} 首到收件箱`],
  [/^DISC (\d+)$/, (m) => `碟 ${m[1]}`],
  [/^Results for “(.+)”\.$/, (m) => `“${m[1]}”的搜索结果。`],
  [/^(\d+) RESULTS?$/, (m) => `${m[1]} 条结果`],
  [/^(\d{4}) IN MUSIC →$/, (m) => `${m[1]} 年度音乐 →`],
  [/^Decrease (.+) score$/, (m) => `降低${translateText(m[1], "zh-CN")}评分`],
  [/^Increase (.+) score$/, (m) => `提高${translateText(m[1], "zh-CN")}评分`],
  [/^← BACK TO (.+)$/, (m) => `← 返回${translateText(m[1])}`],
  [/^← BACK (.+)$/, (m) => `← 返回${translateText(m[1])}`],
  [/^BACK TO (.+)$/, (m) => `返回${translateText(m[1])}`]
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

const translateNode = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const next = language === "en" ? originalText.get(node) : translateText(originalText.get(node));
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
