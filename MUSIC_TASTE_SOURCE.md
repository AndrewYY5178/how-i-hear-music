# MUSIC_TASTE_SOURCE

## Source-of-truth for “How I Hear Music”

**Purpose:** handoff document for Codex to build a personal music-taste archive website.

**Working title:** `How I Hear Music`

**Subtitle / positioning:** `A Personal Music Taste Archive`

**Evidence rule:** This document separates what the user explicitly confirmed from synthesis, interpretation, uncertainty, and missing information. Codex must treat direct user statements as authoritative. Earlier assistant interpretations are not facts unless the user later confirmed them.

**Last compiled:** 2026-08-28

---

## 0. Executive brief

The user wants a personal music-taste showcase website. The subject described in the conversation as “he” is the user himself.

The site should not be a generic “favorite artists / favorite songs” list. Its central question is:

> **How do I hear music?**

The most reliable confirmed listening framework is:

> **Melody is the first barrier. Then production / arrangement. Then timbre and lyrics. Finally vocal ability. All is considered, and nothing is absolute.**

The user can recognize technical skill without loving the result. Personal love is not the same as technical quality. A song can be impressive but not wanted, or imperfect in one dimension yet deeply resonant. The word **resonance** is important as a concept, but it must not be forced into the numerical scorecard as a fifth numeric score.

The clearest confirmed aesthetic principle is:

> **Every element needs a reason to exist.**

This applies to complexity, simplicity, unusual chords, changes in arrangement, genre shifts, vocal choices, album outliers, and production details.

---

## 1. Provenance and confidence labels

Use these labels in the data model and, where helpful, in the UI.

### `CONFIRMED`

Directly stated by the user in the referenced conversation or in the current handoff request.

### `IN_THE_LIST`

A song or artist was explicitly included by the user among songs they like / have in their list. This does **not** automatically mean “favorite” or “core favorite.”

### `FAVORITE`

Use only where the user explicitly confirmed an artist-level favorite status. Do not promote a song to Favorite merely because it has a high score.

### `NOT_IN_THE_LIST`

The user explicitly said a song or artist had no place in the relevant list.

### `UNCERTAIN`

The user used uncertainty language, such as “maybe,” or the available evidence is insufficient to assign a definite status.

### `OBSERVED_SYNTHESIS`

A careful pattern extracted from multiple confirmed statements. It is useful for design copy, but must not be presented as a direct biographical fact or treated as an immutable rule.

### `UNKNOWN`

No confirmed information. Keep the field null or omit it.

---

## 2. User and project identity

- The subject is the user himself.
- The user is 20 years old. This is explicitly stated in the referenced conversation.
- The user wants a personal music-taste showcase / archive website.
- The site should explain not only what the user likes, but how the user listens and why technical quality does not automatically become personal love.
- The user prefers English as the primary language, with Chinese retained where the title, artist name, or original expression requires it.

### Core naming

- **Primary title:** `How I Hear Music`
- **Secondary framing:** `A Personal Music Taste Archive`
- Possible supporting line: `A record of songs, sounds, artists and the moments that stay.`

Do not turn speculative earlier labels such as “旋律浪漫主义者” into the official identity of the site. They may be referenced as exploratory language only. The stronger confirmed framing is the listening process itself.

---

## 3. Artist status: confirmed Favorite artists

These are the artist-level names the user explicitly supplied after correcting an earlier inaccurate Favorite Artists list.

| Artist | Status | Evidence / notes |
|---|---|---|
| 单依纯 / Shan Yichun | `FAVORITE` | Explicitly included in the corrected Favorite Artist list; has special origin-story status and multiple high-scoring works. |
| 王力宏 / Wang Leehom | `FAVORITE` | Explicitly included in the corrected Favorite Artist list. |
| Ariana Grande | `FAVORITE` | Explicitly included in the corrected Favorite Artist list. |
| 祁紫檀 / Qi Zitan | `FAVORITE` | Explicitly included in the corrected Favorite Artist list. |
| 陶喆 / David Tao | `FAVORITE` | Explicitly included in the corrected Favorite Artist list. |
| 关浩德 | `FAVORITE` | Explicitly included in the corrected Favorite Artist list; user later gave songs including 《一半》《原来》《Let Me Go》《Lost You Twice》. |
| Other artists represented by “等” | `UNKNOWN` | The user said “等,” but did not provide a complete additional Favorite Artist list. Do not invent the missing names. |

### Lady Gaga

| Artist | Status | Evidence / notes |
|---|---|---|
| Lady Gaga | `UNCERTAIN` | The user originally said “也许是 Lady Gaga.” The user later listed several Lady Gaga songs, but the current source-of-truth request explicitly requires her artist-level status to remain only maybe / uncertain. |

Do not display Lady Gaga in an unqualified Favorite Artists section. If shown, use a visible `MAYBE` / `UNCERTAIN` label.

---

## 4.1 Confirmed album-level context

The user discussed a Favorite Albums image and then corrected / expanded the album information. The following titles are confirmed as liked or present in that album-level context. Exact ranking was not provided.

| Album | Artist | Evidence level |
|---|---|---|
| 《纯妹妹》 | 单依纯 | `CONFIRMED` album-level context |
| 《勇敢额度》 | 单依纯 | `CONFIRMED` album-level context |
| 《十八般武艺》 | 王力宏 | `CONFIRMED` album-level context |
| 《不可思议》 | 王力宏 | `CONFIRMED` album-level context |
| 《唯一》 | 王力宏 | `CONFIRMED` album-level context; the title song is separately only `IN_THE_LIST` unless otherwise confirmed. |
| 《心中的日月》 | 王力宏 | `CONFIRMED` album-level context from the conversation’s album discussion |
| 《陶喆》 | 陶喆 | `CONFIRMED` album-level context |
| 《黑色柳丁》 | 陶喆 | User explicitly said the earlier assistant’s guess was correct. |
| `Soul Power` | 陶喆 | `CONFIRMED` album-level context; artist attribution web-verified as 陶喆. |
| 《世界与孤独女王》 | 祁紫檀 | `CONFIRMED` corrected title and artist attribution; web-verified as 祁紫檀. |
| `Yours Truly` | Ariana Grande | `CONFIRMED` liked / Favorite Albums context |
| `Sweetener` | Ariana Grande | `CONFIRMED` liked / Favorite Albums context |
| `thank u, next` | Ariana Grande | `CONFIRMED` liked / Favorite Albums context |

Album-level status and song-level status are separate. For example, 《唯一》 being a liked album does not make 《唯一》 the song a Favorite; the user explicitly corrected that song to `IN_THE_LIST`.

Do not recreate the missing album image from memory, and do not add albums based on earlier assistant predictions such as `Positions`, `Butterfly`, `Blonde`, or `Voodoo`.

---

## 4. Important distinction: Favorite is not the same as in the list

The user explicitly corrected the earlier assistant:

> **The songs initially mentioned are not automatically favorite songs.**

Confirmed examples:

- 《找自己》 = `IN_THE_LIST`, not automatically Favorite.
- 《天天》 = `IN_THE_LIST`, not automatically Favorite.
- 《唯一》 = `IN_THE_LIST`, not automatically Favorite.
- The first batches of songs were generally songs the user said the subject likes / has in the list; they were not a formal, complete Favorite Songs list.
- A high Overall score is evidence of strong personal response, but the UI should not silently rewrite `IN_THE_LIST` into `FAVORITE`.

Recommended data rule:

```text
artist_status and song_status are separate fields.
score and status are separate fields.
high_score does not imply FAVORITE.
```

---

## 5. Confirmed song inventory by artist

The lists below preserve the evidence level. Unless a song has a separate explicit status or rating record, these entries should be stored as `IN_THE_LIST`, not `FAVORITE`.

### 5.1 单依纯 / Shan Yichun

Confirmed songs associated with the user’s list / discussion:

- 《向日葵朝着夜》
- 《珠玉》
- 《还有什么更好的》
- 《另一种答案》
- 《奇观》
- 《有趣》
- 《纯妹妹》
- 《永不失联的爱》 — user clarified this is not her own song; the score discussed was for her vocal, not the song itself.
- 《给电影人的情书》 — user clarified this is not her own song; the score discussed was for her vocal, not the song itself.

Artist-level importance:

- She is a confirmed Favorite artist.
- She has a special position as the user’s entry point into actively exploring music.
- Her producer is important to the appeal of her work because the user likes how the same song can keep changing through different versions / presentations.

### 5.2 王力宏 / Wang Leehom

Initially listed songs:

- 《你不知道的事》
- 《落叶归根》
- 《就是现在》
- 《花田错》
- 《第一个清晨》
- `Everything`

Additional tested songs:

- 《你不在》
- 《心跳》
- 《大城小爱》
- `Forever Love` — see correction note in the ratings section.
- 《唯一》 — explicitly `IN_THE_LIST`; do not infer Favorite from the album or artist status.

### 5.3 Ariana Grande

Initially listed songs:

- `7 rings`
- `Best Mistake`
- `Tattooed Heart`
- `imperfect for you`
- `Dangerous Woman`
- `hate that I made you love me`

Additional tested songs / status:

- `we can't be friends (wait for your love)` — score 4/10; not a core favorite signal.
- `ghostin` — `NOT_IN_THE_LIST`.
- `needy` — `NOT_IN_THE_LIST`.
- `Into You` — `NOT_IN_THE_LIST`.

Album-level evidence explicitly confirmed earlier:

- `Yours Truly` — favorite album.
- `Sweetener` — favorite album.
- `thank u, next` — favorite album.

### 5.4 陶喆 / David Tao

Initially listed songs:

- 《望春风》
- 《二十二》
- 《普通朋友》
- 《找自己》 — explicitly `IN_THE_LIST`.
- 《流沙》
- 《天天》 — explicitly `IN_THE_LIST`.

Additional tested songs:

- 《爱我还是他》
- 《飞机场的10:30》
- 《寂寞的季节》
- 《蝴蝶》

### 5.5 祁紫檀 / Qi Zitan

Confirmed songs:

- `Dear Friend`
- 《别融化在空气里》
- 《少女之酒》
- 《一颗心》
- 《相信爱》

Artist-level status: `FAVORITE`.

### 5.6 关浩德

Confirmed songs:

- 《一半》
- 《原来》
- `Let Me Go`
- `Lost You Twice`

Artist-level status: `FAVORITE`.

### 5.7 张惠妹 / A-Mei

Confirmed songs initially listed:

- 《掉了》
- 《真实》
- 《连名带姓》
- 《趁早》
- 《哭不出来》

Important correction: the user supplied five songs, not six. Do not invent a sixth.

Additional tested songs:

- 《听海》
- 《如果你也听说》

### 5.8 王菲 / Faye Wong

Confirmed songs:

- 《暗涌》
- 《人间》
- 《天空》
- 《给自己的情书》
- 《执迷不悔》
- 《爱与痛的边缘》

### 5.9 Olivia Rodrigo

The earlier conversation used “娅娅”; the user clarified that 娅娅 means Olivia Rodrigo.

Confirmed songs:

- `vampire`
- `drivers license`
- `Wondering`
- `Drop Dead`

### 5.10 艾怡良 / Eve Ai

- `Forever Young`
- 《我们的总和》

### 5.11 丁世光

- 《一口》
- 《瘦子》
- `Simon`
- 《你的家》
- 《爱我的人》

### 5.12 徐佳莹 / LaLa Hsu

- 《人啊》
- 《惧高症》
- 《言不由衷》
- 《身骑白马》
- 《最初的记忆》
- 《寻人启事》

### 5.13 Billie Eilish

- `BIRDS OF A FEATHER`
- `idontwannabeyouanymore`
- `What Was I Made For?`
- `THE 30TH`

### 5.14 A-Lin

- 《给我一个理由忘记》
- 《挚友》
- 《逃避没有不好》
- 《爱 请问怎么走》
- 《罪恶感》

### 5.15 孙燕姿 / Stefanie Sun

- 《天黑黑》
- 《绿光》
- 《遇见》
- 《雨天》

### 5.16 Bruno Mars

- `Die With a Smile`
- `Leave the Door Open`
- `If I Knew`
- `When I Was Your Man`

### 5.17 陈奕迅 / Eason Chan

The user said: **many songs, but does not often listen to them**.

Confirmed songs:

- `K歌之王`
- 《月球上的人》
- 《约定》
- 《让我留在你身边》
- 《红玫瑰》
- 《爱情转移》

This is a confirmed distinction between liking / recognition and actual frequent listening.

### 5.18 莫文蔚 / Karen Mok

- 《爱情》
- 《盛夏的果实》
- 《这世界那么多人》

Artist-level note from the conversation: `少`.

### 5.19 梁静茹 / Fish Leong

- 《情歌》

### 5.20 Taylor Swift

- `The Fate of Ophelia`

### 5.21 Eliot James Reay

- `I Think They Call This Love`
- `Daydreaming`
- `Sweetness`

### 5.22 张靓颖 / Jane Zhang

- 《另一个天堂》

The user said this artist is `少` and named this song.

### 5.23 韦礼安 / WeiBird

- 《狼》

The user said this artist is `少` and named this song.

### 5.24 邓丽君 / Teresa Teng

The user said `少听` and named:

- 《在水一方》
- 《但愿人长久》

### 5.25 毛不易

The user said `少` and named:

- 《平凡的一天》
- 《一荤一素》

### 5.26 Lady Gaga — uncertain artist-level status

Songs named by the user:

- `Shallow`
- `Die With a Smile`
- `The Cure`
- `Imagine`

Do not treat this as a confirmed Favorite Artist because the user explicitly requested `maybe / uncertain` status for Lady Gaga.

---

## 6. Confirmed negative or low-presence artist evidence

These are useful as boundaries, but they must not be turned into sweeping claims such as “the user dislikes this entire artist.” Preserve the wording and scope.

| Artist | User-confirmed status |
|---|---|
| 周杰伦 / Jay Chou | `无` / no songs in the relevant list. |
| 蔡健雅 / Tanya Chua | `无`. |
| 林宥嘉 / Yoga Lin | `无`. |
| Mariah Carey | `无`. |
| 蔡依林 / Jolin Tsai | `无`. |
| G.E.M. / 邓紫棋 | `无`. |
| 孙盛希 | `无`. |
| 陈粒 | `无`. |
| 刘柏辛 / Lexie Liu | `无`. |
| 窦靖童 | `无`. |
| 刘恋 | `无`. |
| 周深 | `无`. |
| 萧敬腾 | `少`. |
| Sabrina Carpenter | `少`. |
| 余佳运 | `少`, and explicitly not the mystery artist being sought at that point. |
| 郭顶 | `无`. |
| 张学友 | `很少`, specifically 《他在那里》《讲你知》. |

This negative evidence is not a genre verdict. It exists to show that superficial similarity, public acclaim, technical vocal ability, or artist category does not guarantee a match.

---

## 7. Single Yichun: special status and origin story

This is one of the most important sections of the entire source-of-truth.

### Confirmed sequence

1. The user’s first genuinely active exploration of music began after seeing 单依纯 appear on stage.
2. The key performance was her singing `Forever Young`.
3. The trigger was not merely “she sings very well.”
4. The user’s remembered reaction was:

   > **“How songs can be showed like that”**

   The Chinese meaning is close to: “原来一首歌可以这样被呈现。”

5. This led to an important understanding: a song and its presentation are not identical. Different arrangement, vocal choices, dynamics, phrasing, timbre, space, and interpretation can make the same song feel like a different world.
6. The user likes that 单依纯 and her producer can keep changing / re-presenting the same song.
7. Those changes bring surprise.
8. The producer plays an important role in the appeal; do not frame this as singer-only admiration.

### Safe website copy direction

Use the story as an origin point for the user’s way of hearing, not as a claim that the user’s entire musical psychology was permanently determined by one performance.

Suggested concept:

> **A song is not a single fixed answer. It is a set of possible presentations.**

Suggested section title:

> **Why Shan Yichun**

Suggested sub-concepts:

- `One Song, Many Possibilities`
- `Interpretation / Reinterpretation`
- `Surprise without losing identity`
- `The artist and producer as co-authors of a presentation`

Do not invent specific alternate versions, producers, dates, venues, or private memories. None were confirmed in the conversation.

---

## 8. Listening order and evaluation criteria

### Explicitly confirmed order

The user said:

> **“All is considered，旋律是第一个障碍，接着是制作即编曲，接着是音色与歌词，最后还要考虑vocal能力。”**

Translate faithfully as:

1. **Melody** — the first barrier / first gate.
2. **Production / arrangement** — the next major consideration.
3. **Timbre and lyrics**.
4. **Vocal ability** — considered last, not ignored.

### Important qualification

The user also said:

> **“It depends on what caught him.”**

Therefore the order above is a judgment / filtering framework, not a rigid description of first-listen attention. Any musical event can catch attention first: a timbre, bass line, lyric, vocal moment, harmony, drum entrance, or arrangement decision.

### Correct interpretation

- Vocal ability is appreciated but not the first priority.
- Melody is the hardest barrier, but not an absolute veto.
- Groove, production, harmony, vocal arrangement, or a rare musical event can sometimes compensate for a lower melody score, but this is difficult, not normal.
- “All is considered” means the user does not want a dogmatic one-variable theory.

---

## 9. Melody preference

### Confirmed pattern: Type B melodies have longer-term advantage

The user agreed that **B-type melody** is more likely to become a long-term favorite:

- First listen can feel ordinary, unfamiliar, or not immediately beautiful.
- Repeated listens reveal more beauty.
- The melody becomes increasingly compelling over time.
- This happens, but not very often.

Confirmed example:

- 《公转自转》

Important qualifications:

- The user is not deliberately seeking difficult, complex, or obscure melodies.
- Simple melodies can work.
- The user does not worship “slow burn” as a rule.
- The ideal is not necessarily “hard to understand”; it is music with enough remaining life to reward repeated listening.

Safe synthesis for the site:

> **He does not demand a difficult melody. He prefers a melody that is not exhausted by the first listen.**

Do not state that the user dislikes catchy songs in general. This was not confirmed.

---

## 10. Production and arrangement preferences

### Dynamic arrangement

The user confirmed a strong preference for arrangement that changes as a song progresses:

- The second pass can add information.
- The third pass can add or reinterpret information.
- Different sections should not necessarily remain identical.
- A song may establish a state, develop it, surprise the listener, and reassemble earlier ideas.

Safe description:

> **The user likes music that keeps becoming something.**

### Musical events the user notices and can enjoy

The user explicitly named examples such as:

- A sudden chord progression.
- A vocal run / melisma.
- A key change / modulation.
- A lyric line at the right moment.
- An a cappella passage.
- A drum entrance or drum-pattern change.
- A specific arrangement design.
- Harmony or backing vocals arriving at a meaningful moment.
- The arrangement suddenly opening up or pulling away.

These events can be only a few seconds long but may materially change the user’s relationship with the song.

### Foreshadowing, motif return, and payoff

The user confirmed liking:

- Motif recovery.
- Beginning / ending correspondence.
- A musical idea planted early and paid off later.
- The same idea returning in a changed arrangement or harmony.
- Surprise that feels intentional in retrospect.

This is not random novelty. The preferred pattern is:

```text
setup → development → surprise → return / payoff
```

### Late payoff

The user said that if the final 20% becomes amazing, it raises the overall evaluation only:

> **“A bit.”**

Interpretation:

- A great ending is a multiplier, not a rescue operation.
- The earlier 80% still needs to establish a viable foundation.

`Love Language` was named as an example of a satisfying late / ending surprise.

### Complexity versus simplicity

The user does not require complexity.

Both of these can work:

- Dense, surprising, highly designed production.
- Minimal production with enough melodic, timbral, lyrical, or vocal strength.

Confirmed minimal / sparse examples:

- 《奇观》
- Live version of 《向日葵朝着夜》

The key is not quantity of elements. It is whether each element has a reason to exist.

### Unnecessary chords

The user explicitly dislikes `unnecessary chords`.

This does not mean the user dislikes complex harmony. The distinction is:

- Complex because the song needs it: acceptable.
- Simple because the song needs it: acceptable.
- A chord added only to display complexity: not desirable.

### Intentionality

This is a central concept and a good site keyword:

> **Intentionality: every musical decision should feel necessary, meaningful, or alive.**

Do not describe this as “every song must be objectively perfect.” That is explicitly disallowed.

---

## 11. Groove, rhythm, and micro-timing

The user confirmed appreciation for:

- Loose timing.
- Slightly behind-the-beat or ahead-of-the-beat phrasing.
- Micro-timing.
- Pocket.
- Tension between vocal and drums.
- R&B / Neo-Soul-style push and pull.
- Rhythm that does not feel mechanically locked to the grid.

The user said groove can rescue a song, but:

> **“It’s hard but not impossible.”**

Important hierarchy:

- Melody remains the first barrier.
- Groove can make a song compelling or improve its replay value.
- It is rare for the user to first fall for groove and only later fall for the melody.
- Do not write “groove is the user’s primary taste.”

Safe copy:

> **Groove can open a side door, but melody is still the main gate.**

---

## 12. Vocal taste

### Technical skill

The user appreciates vocal skill but does not prioritize it first.

Technical excellence is not sufficient for personal love.

### Human imperfection

The user explicitly prefers human imperfection when it serves feeling or texture:

- Slight break in the voice.
- Breath.
- Edge.
- Borderline pitch.
- A take that is less polished but more emotionally alive.
- A moment that feels unrepeatable or genuinely human.

The user’s answer to choosing a technically imperfect but emotionally convincing take was:

> **“Of course the imperfect.”**

Do not interpret this as “the user dislikes technique.” The safe principle is:

> **Technique should expand expression, not erase human presence.**

### Auto-Tune / pitch correction boundary

The user was explicit:

> **“Totally unacceptable.”**

The relevant boundary is obvious Auto-Tune / obvious pitch correction that replaces or erases human presence.

Do not generalize this into “all vocal effects are prohibited.” The conversation did not establish a complete policy for reverb, delay, distortion, telephone effects, or layered processing.

### Harmony and vocal arrangement

The user likes harmony and vocal arrangement.

Both of these are valid:

- Thick, layered vocal texture.
- Clearly separated vocal parts whose independent movement can be heard.

The user answered `Both` when asked to choose between them.

The user’s key statement:

> **“He likes the harmony.”**

Use harmony as a major production / musical-information feature, not as proof that the user prefers one fixed vocal timbre.

### Timbre

The user confirmed no fixed timbre preference.

The right question is:

> **Does this voice belong to this song?**

Do not infer a preference for breathy, husky, bright, dark, thick, thin, airy, or powerful voices in general.

---

## 13. Lyrics

The user is slightly more receptive to:

- Abstract lyrics.
- Poetic language.
- Lyrics with room for interpretation.

This is a mild preference, not a hard rule.

The user explicitly said there is not yet a real confirmed case showing whether very poor / cringe lyrics can destroy an otherwise excellent song. Do not invent such a case or claim a fixed lyric veto threshold.

The user also said they do not think excessively about memory / autobiographical attachment when listening. Do not build the site around nostalgia or a claim that every favorite song is tied to a personal life event.

---

## 14. Attention and listening behavior

### Event-driven attention

The user said:

> **“It depends on what caught him.”**

This is a crucial qualification. The user does not want a rigid “attention always follows melody, then bass, then vocals” story.

What catches attention can vary by song:

- Melody.
- A voice or timbre.
- Arrangement.
- A lyric.
- Harmony.
- Bass.
- Drums.
- Backing vocals.
- A production event.
- A singular emotional moment.

### Detail awareness

The user described himself as:

> **“Not that professional but would leave an eye on that.”**

Meaning: not a professional track-by-track analyst, but he does notice details such as bass, drums, harmony, and backing vocals when music draws attention to them.

Safe site copy:

> **Not listening in order to analyze; analyzing because the music made him listen closer.**

### Repetition and replay

The user likes songs by repeatedly looping them and does not deliberately avoid replay in order to prevent getting tired of them.

This suggests a strong replay impulse for songs that become personally resonant, but do not invent exact play counts or claim that every Favorite song is played daily.

### Others not getting the taste

The user said:

> **“Not much people can get his taste.”**

The meaning is not that the user is trying to be obscure. It means the specific choices within an artist’s catalog are difficult for other people to predict.

The user does not tend to explain his taste at length, but may tell others which specific part of a song he likes.

Safe phrasing:

> **He will point to the moment, but he does not need to win the argument.**

### Music, imagery, and analysis

The user confirmed both:

- Music can trigger pictures, stories, and self-projection.
- The user can also listen through musical details and structure.

Do not choose only one interpretation.

---

## 15. Artist / person separation

The user’s explicit principle:

> **“Music is music, person creates music, person affects music, person doesn’t affects the songs before his status changed.”**

Interpretation to preserve carefully:

- Music is a work.
- A person creates music.
- The person’s condition, choices, or status can affect what they create going forward.
- A later change in the person’s status does not retroactively alter the song that was already made.

Do not turn this into a general ethical position beyond the stated music-evaluation context.

---

## 16. Album discovery and album philosophy

### Discovery behavior

The user described a clear path:

```text
Accidentally hear one song
        ↓
Search for the album
        ↓
Start at Track 1
        ↓
Listen through the album
```

The user is willing to listen to a complete album, not only isolated playlist singles.

### What makes an album great

Two paths are explicitly valid:

1. **Peak path:** One song hits extremely hard and can make the album great.
2. **Consistency path:** Ten songs at a stable 8/10 can also make the album great.

Do not claim the user only values peaks, and do not claim the user only values average consistency.

### Album cohesion

The user does not require every song to sound the same.

An outlier is acceptable if it has a reason to exist.

Both are valid:

- Unified album sound.
- Diverse album with meaningful contrast.

### Innovation versus repetition

Both are valid:

- Innovation and experimentation.
- Repeating a successful sound.

Innovation is not a moral duty. Repetition is not automatically lazy. The question remains whether the artistic choice works and has a reason to exist.

---

## 17. Scoring philosophy

### Four dimensions

The preferred detailed scorecard is:

1. `Song` — the song / composition itself.
2. `Vocal` — the vocal performance as heard in the relevant version.
3. `Production` — production, arrangement, and sound design.
4. `Overall` — the user’s final personal evaluation.

### Overall is not a simple average

This is confirmed by several examples:

- 《向日葵朝着夜》 has Production 8 but Overall 11.
- 《听海》 has Vocal 9.5 but Overall 4.
- 《纯妹妹》 has Vocal 10 but Overall 8.

Therefore:

```text
Overall ≠ arithmetic mean of Song, Vocal, Production
```

### Resonance

`Resonance` is a crucial concept for explaining why Overall can exceed or fall below the component scores. It represents the unquantified personal relationship / chemistry / “this becomes mine” effect.

However:

- Keep Resonance as a qualitative concept.
- Do not invent a Resonance number.
- Do not reverse-engineer a hidden numeric Resonance score from Overall.
- Do not present Overall as objective quality.

### Technical quality versus personal love

The user can say:

- “This is technically strong.”
- “This vocal is impressive.”
- “This production is excellent.”

and still not want to listen to the song.

Safe site language:

> **Good is not automatically mine.**

Avoid the phrase `objectively perfect`.

---

## 18. Confirmed ratings: full four-dimensional records

These are explicit user-provided four-number ratings in the order:

```text
Song / Vocal / Production / Overall
```

| Artist | Track | Song | Vocal | Production | Overall | Status |
|---|---|---:|---:|---:|---:|---|
| 单依纯 | 《向日葵朝着夜》 | 10 | 10 | 8 | 11 | `CONFIRMED`; strong personal resonance signal |
| 单依纯 | 《珠玉》 | 10 | 10 | 10 | 10 | `CONFIRMED` |
| 单依纯 | 《还有什么更好的》 | 9.5 | 9.8 | 9.8 | 9.8 | `CONFIRMED` |
| 单依纯 | 《另一种答案》 | 9.5 | 8.8 | 9 | 9.5 | `CONFIRMED` |
| 单依纯 | 《奇观》 | 9 | 9.5 | 8 | 8.5 | `CONFIRMED` |
| 单依纯 | 《有趣》 | 8 | 9 | 8.8 | 8.5 | `CONFIRMED` |
| 单依纯 | 《纯妹妹》 | 7 | 10 | 8 | 8 | `CONFIRMED` |
| 王力宏 | 《落叶归根》 | 10 | 10 | 8 | 9.5 | `CONFIRMED` |
| 王力宏 | 《花田错》 | 7.8 | 9 | 10 | 9 | `CONFIRMED` |
| 陶喆 | 《普通朋友》 | 9 | 8 | 9 | 8.7 | `CONFIRMED` |
| Ariana Grande | `Tattooed Heart` | 9 | 9 | 9 | 9 | `CONFIRMED` |

### Important four-score note

`Overall 11` is intentionally preserved. Do not clamp it to 10 or “fix” it as a data error. It is part of the user’s meaning and demonstrates that the user’s personal resonance scale can exceed the nominal 10-point component scale.

---

## 19. Confirmed ratings: three-number records with incomplete / historical schema

Many earlier tests used three numbers, generally in the context of `Song / Vocal / Overall`. Production was not always requested or supplied. Store the raw sequence and the known mapping; use `null` for unknown fields.

| Artist | Track | Song | Vocal | Production | Overall | Additional note |
|---|---|---:|---:|---:|---:|---|
| Olivia Rodrigo | `vampire` | 8 | 5 | `null` | 8 | User request explicitly says Production is unconfirmed. |
| Olivia Rodrigo | `drivers license` | 6 | 6 | `null` | 6 | User said he was “not that interested in the song like others.” |
| 王菲 | 《暗涌》 | 9 | 6 | `null` | 8 | Production unconfirmed. |
| 王菲 | 《人间》 | 8 | 5 | `null` | 8 | Production unconfirmed. |
| 张惠妹 | 《听海》 | 7 | 9.5 | `null` | 4 | Production unconfirmed; strong example of technical vocal quality not becoming personal love. |
| 张惠妹 | 《掉了》 | 9 | 8 | `null` | 9 | Production unconfirmed. |
| 张惠妹 | 《如果你也听说》 | 5 | 5 | `null` | 5 | Historical three-score test. |
| 丁世光 | 《一口》 | 9.5 | 7 | `null` | 8.9 | Production not supplied in this historical record. |
| 丁世光 | `Simon` | 8 | 6 | `null` | 8.5 | Production not supplied in this historical record. |

Do not fill the null Production cells with guesses from genre, reputation, or earlier assistant commentary.

---

## 20. Confirmed ratings: overall-only or single-dimension records

These must not be expanded into invented four-dimensional ratings.

| Artist | Song | Known score | Score type | Status / note |
|---|---|---:|---|---|
| 王力宏 | 《你不在》 | 9 | Overall-only | The user corrected an earlier misunderstanding: the original question intended 《你不在》, not `Forever Love`. |
| 王力宏 | `Forever Love` | 4 | Overall-only | Preserve the corrected value 4. Do not use the earlier assistant’s mistaken `5 / 5.5 / 8.5` interpretation. |
| 王力宏 | 《大城小爱》 | 6 | Overall-only | No component split confirmed. |
| 王力宏 | 《心跳》 | 7 | Overall-only | No component split confirmed. |
| 陶喆 | 《爱我还是他》 | 3 | Overall-only | No component split confirmed. |
| 陶喆 | 《飞机场的10:30》 | 6.5 | Overall-only | No component split confirmed. |
| 陶喆 | 《寂寞的季节》 | 8 | Untyped single score | The current evidence only says “《寂寞的季节》，8”; do not assign it to Song, Vocal, Production, or Overall without new confirmation. |
| 陶喆 | 《蝴蝶》 | 7.9 | Overall-only | No component split confirmed. |
| 方大同 | 《特别的人》 | 3 | Overall-only | No component split confirmed. |
| 林俊杰 | 《修炼爱情》 | 4 | Overall-only | No component split confirmed. |
| 孙燕姿 | 《我怀念的》 | 3 | Overall-only | No component split confirmed. |
| A-Lin | 《有一种悲伤》 | 4 | Overall-only | No component split confirmed. |
| 王菲 | 《红豆》 | 4 | Overall-only | No component split confirmed. |
| Ariana Grande | `we can't be friends (wait for your love)` | 4 | Overall-only | No component split confirmed. |
| Ariana Grande | `pov` | 8.8 | Overall-only | The previous conversation supports Overall 8.8; no four-dimensional breakdown was confirmed. |
| Ariana Grande | `Best Mistake` | approximately 8 | Overall approximate | `IN_THE_LIST`; user said “in the list like 8.” Preserve approximation. |
| 单依纯 | 《永不失联的爱》 | 8 | Vocal-only | User explicitly said this was not a song score, but a score for vocal. Song / Production / Overall unknown. |
| 单依纯 | 《给电影人的情书》 | 9 | Vocal-only | User explicitly said this was not her song and the 9 was for vocal. Song / Production / Overall unknown. |

### Rating corrections that must survive implementation

- `Forever Love = 4`, not the earlier assistant’s mistaken breakdown.
- The original intended high-rated title was 《你不在》 = Overall 9.
- `《寂寞的季节》 = 8` is intentionally untyped.
- `pov = Overall 8.8` only; do not invent Song / Vocal / Production.
- `Production` is unknown for `vampire`, `drivers license`, 《暗涌》, 《人间》, 《听海》, and 《掉了》 in the records above.
- `《永不失联的爱》 = Vocal 8` only.
- `《给电影人的情书》 = Vocal 9` only.

---

## 21. Qualitative patterns supported by the confirmed evidence

These are `OBSERVED_SYNTHESIS`, not immutable laws.

### 21.1 Melody is the gate, not the whole building

The user clearly puts melody first, but Overall cannot be predicted by melody alone. Production, vocal, timbre, lyrics, arrangement events, and resonance all matter.

### 21.2 Production is about purposeful movement

The user likes arrangement that develops and reveals information. “More layers” is not enough; the layers need timing, purpose, and payoff.

### 21.3 Surprise is an amplifier

A sudden chord, harmony, drum entrance, vocal event, modulation, or late section can increase replay value. Surprise alone does not rescue a weak foundation.

### 21.4 Vocal humanity matters more than vocal perfection

The user can admire ability but prefers believable human presence over obvious correction or sterile perfection.

### 21.5 The user likes relationships between elements

The strongest common thread is not one fixed genre or timbre. It is the relationship between melody, arrangement, vocal, harmony, rhythm, lyrics, and the exact moment a choice appears.

### 21.6 The user’s taste is non-doctrinal

The user can accept:

- Simple or complex music.
- Unified or diverse albums.
- Innovation or successful repetition.
- Highly produced or sparse arrangements.
- Strong technique or meaningful imperfection.
- Mainstream or less-known artists.

The constant is not the format. It is whether the result feels intentional and alive.

### 21.7 Resonance defeats arithmetic

The user’s Overall score can exceed technical component scores or fall far below them. The site should show this as personal resonance, not as a mathematical error.

---

## 22. Quote bank

Use these as direct quote candidates. Preserve the wording; do not “correct” the user’s English unless presenting a clearly labeled editorial translation.

### Origin and presentation

- “How songs can be showed like that”

### Attention and explanation

- “It depends on what caught him”
- “Not that professional but would leave an eye on that”
- “Doesn’t explain that even though he might told others which part of the song he actually likes”

### Intentionality and composition

- “All have the reason to exist”
- “Never mind that, all have the reason to exist”
- “Pity”

### Imperfection and vocal presence

- “Of course the imperfect”
- “Totally unacceptable”

### Harmony and arrangement

- “He likes the harmony”
- “Both”
- “It’s hard but not impossible”
- “Not too much”
- “Of course”
- “Yes, like love language”
- “A bit”
- “Of course from the very start”

### Album / variation / openness

- “Yes”
- “Both”
- “First one”
- “Both likes”

### Artist / person separation

- “Music is music, person creates music, person affects music, person doesn’t affects the songs before his status changed”

### Recommended editorial lines derived from the quotes

These are synthesis, not direct user quotations; label them as site copy rather than quote blocks if used:

- `Melody opens the door.`
- `Arrangement makes me stay.`
- `Details make me return.`
- `Resonance makes it mine.`
- `Every element needs a reason to exist.`
- `Good is not automatically mine.`

---

## 23. Website information architecture

The following structure was proposed in the conversation and fits the confirmed material.

### 23.1 Hero

Suggested content:

```text
MUSIC,
AS I HEAR IT.

A personal archive of songs, sounds,
artists and the moments that stay.
```

Include a small identity line if desired, but do not invent a biography, location, profession, or exact establishment year.

### 23.2 How I Listen

Show the user’s listening path:

```text
MELODY → PRODUCTION / ARRANGEMENT → TIMBRE + LYRICS → VOCAL
```

Add the qualification:

> **Nothing is absolute. All is considered.**

### 23.3 What Makes Me Stay

Potential cards / tags:

- Beautiful melody.
- Purposeful arrangement.
- Meaningful lyrics.
- Human vocals.
- Harmony.
- Groove.
- Surprise.
- Reinterpretation.
- Resonance.

Do not make these equal-weight objective requirements. They are a visual vocabulary for the user’s confirmed preferences.

### 23.4 Surprise Factor

Use an editorial timeline or annotated diagram:

```text
0:00        development        surprise        payoff        END
setup  ────────────────→  new detail  ───────→ return / release
```

Possible annotations:

- New harmony.
- Added vocal layer.
- Groove shift.
- Drum change.
- Key change.
- A cappella.
- Motif return.
- Late payoff.

### 23.5 Human Voice

Contrast:

- `TECHNIQUE` — appreciated.
- `HUMAN PRESENCE` — essential.
- `IMPERFECTION` — often welcome.
- `OBVIOUS PITCH CORRECTION` — unacceptable.
- `HARMONY / LAYERING` — welcome when purposeful.

### 23.6 Why Shan Yichun

Make this a dedicated feature section, not just an artist card.

Core idea:

> **The song can change without losing its identity.**

Tell the `Forever Young` stage / “How songs can be showed like that” origin story, and explain the importance of the singer–producer relationship without inventing extra facts.

### 23.7 Favorite Artists constellation

Use only confirmed Favorite artists in the primary constellation:

- 单依纯.
- 王力宏.
- Ariana Grande.
- 祁紫檀.
- 陶喆.
- 关浩德.

Add `Lady Gaga — maybe` only as a visually distinct uncertain node if desired.

Do not place every artist with songs in the list into the Favorite constellation.

### 23.8 Scorecard

Show:

- Song.
- Vocal.
- Production.
- Overall.

Allow missing values. Do not render unknown Production as 0.

Add a small legend:

> **A score is a record of personal response, not an objective verdict.**

### 23.9 10/10 Wall / High Resonance Wall

Potential records:

- 《珠玉》 — 10 / 10 / 10 / 10.
- 《向日葵朝着夜》 — 10 / 10 / 8 / 11.
- 《还有什么更好的》 — 9.5 / 9.8 / 9.8 / 9.8.
- 《落叶归根》 — 10 / 10 / 8 / 9.5.
- `Tattooed Heart` — 9 / 9 / 9 / 9.

Do not call these “objectively perfect.”

### 23.10 Good ≠ Mine

Use contrast pairs such as:

- 《听海》 — Vocal 9.5, Overall 4.
- 《向日葵朝着夜》 — Production 8, Overall 11.

This section is central to the user’s distinction between recognition and love.

### 23.11 Music Discovery

Render:

```text
ONE SONG → FIND THE ALBUM → START AT TRACK 1 → FULL LISTEN
```

### 23.12 Not a Requirement

Do not frame these as things the user hates. They are not mandatory requirements:

- Perfect vocals.
- Complex chords.
- Constant innovation.
- One fixed genre.
- One specific timbre.
- Maximum production.
- Album uniformity.

Closing line:

> **But every choice needs a reason.**

### 23.13 Final manifesto

Possible final copy, clearly presented as editorial synthesis:

```text
A good song ends.
A great song stays.

Not because it is perfect.
Because something in it keeps changing
every time I listen.
```

Do not attribute this wording directly to the user unless they later approve it as a quote.

---

## 24. Visual and design direction

### Confirmed direction

- Simple and retro.
- Vertical / long-form composition.
- English-first.
- High information density.
- Music magazine / editorial feel.
- The user liked the idea of a magazine-like music poster as a visual reference.

### Design language

- Cream / aged paper base.
- Black or charcoal typography.
- Olive, sepia, and dark red accents.
- Serif paired with condensed sans-serif.
- Distressed print / paper texture used with restraint.
- Magazine editorial grid.
- Handwritten annotations.
- Vinyl / cassette motifs.
- Generous whitespace while retaining high information density.
- Chinese titles and artist names where they carry meaning; English for most navigation and conceptual copy.

### Visual restraint

- Do not turn the site into a generic “retro filter” template.
- Do not use excessive grain, fake tape glitches, or decorative noise that harms readability.
- Keep the data legible.
- Make uncertainty and incomplete scores visually honest rather than hiding them.
- Use diagrams only where they clarify listening relationships or sequence.

---

## 25. Technical handoff proposal for Codex

### Suggested stack

- Next.js.
- TypeScript.
- Tailwind CSS.

### Data-driven architecture

Keep music facts outside React components. Suggested files:

```text
/data
  artists.json
  songs.json
  profile.json
  ratings.json
  listening-philosophy.json
```

Suggested reusable components:

```text
/components
  Hero
  ArtistConstellation
  ArtistProfile
  ListeningPath
  PhilosophySection
  SurpriseTimeline
  HumanVoiceSection
  SongScoreCard
  RatingLegend
  HighResonanceWall
  GoodVsMine
  AlbumDiscoveryFlow
  QuoteBlock
  EditorialAnnotation
```

### Recommended data fields

```json
{
  "artist": "Olivia Rodrigo",
  "song": "vampire",
  "artistStatus": "UNKNOWN",
  "songStatus": "IN_THE_LIST",
  "scores": {
    "song": 8,
    "vocal": 5,
    "production": null,
    "overall": 8
  },
  "scoreSchema": "historical_song_vocal_overall",
  "confidence": "CONFIRMED",
  "notes": [
    "Production was not confirmed.",
    "Do not infer missing values."
  ]
}
```

### Status enum

```text
FAVORITE
IN_THE_LIST
NOT_IN_THE_LIST
UNCERTAIN
UNKNOWN
```

### Score rules

- Store raw values exactly, including `11`.
- Store `null` for unknown Production or other missing dimensions.
- Store whether a score is four-dimensional, historical three-dimensional, overall-only, vocal-only, or untyped.
- Do not silently normalize `11` to `10`.
- Do not convert approximate `Best Mistake ≈ 8` into an exact 8 without preserving `approximate: true`.
- Do not calculate Resonance as a hidden fifth score.
- Do not calculate Overall as an average.

### Rendering rules

- Show status badges when status is known.
- Show `—` or `Not recorded` for null, never `0`.
- For unknown artist-level status, show `Unknown` rather than promoting the artist.
- For Lady Gaga, show `Maybe` / `Uncertain`.
- Add a data note or tooltip when a record has an incomplete historical schema.

---

## 26. Explicit DO NOT INFER rules

Codex must follow these rules throughout design, copy, data modeling, and UI.

1. **Do not treat `IN_THE_LIST` as `FAVORITE`.**
2. **Do not treat a high score as an explicit Favorite label.**
3. **Do not invent missing Production ratings.**
4. **Do not split a single score into Song / Vocal / Production / Overall.**
5. **Do not split 《寂寞的季节》 8 into any dimension.**
6. **Do not turn `pov 8.8` into a four-dimensional score.**
7. **Do not turn 《永不失联的爱》8 into Overall; it was Vocal-only.**
8. **Do not turn 《给电影人的情书》9 into Overall; it was Vocal-only.**
9. **Do not use the earlier mistaken `Forever Love` breakdown; the confirmed value is Overall 4, and the originally intended high-rated song was 《你不在》.**
10. **Do not assume a fixed genre preference.** R&B / Soul / Neo-Soul are useful descriptive languages in synthesis, not a confirmed exclusive identity.
11. **Do not assume a fixed timbre preference.** The user explicitly said no preference; fit depends on the song.
12. **Do not assume all technically excellent vocalists are liked.** The user appreciates skill but does not prioritize it first.
13. **Do not assume all classic songs are liked.** Public consensus and classic status have no automatic authority.
14. **Do not assume all mainstream music is rejected.** Mainstream is not automatically a negative.
15. **Do not assume all experimental music is liked.** Experiment is not automatically a positive.
16. **Do not assume album cohesion is mandatory.** An outlier is acceptable if it has a reason to exist.
17. **Do not assume innovation is mandatory.** Repetition can work if it works.
18. **Do not use `objectively perfect`.** Scores are personal responses.
19. **Do not invent personal memories, trauma, relationships, locations, or autobiographical explanations for songs.** The user said music can trigger imagery and projection, but did not provide a complete life story for each song.
20. **Do not invent producers, alternate versions, performance dates, or detailed facts about the Forever Young stage.**
21. **Do not present earlier assistant guesses as user facts.**
22. **Do not infer that Lady Gaga is a confirmed Favorite artist.** Keep `UNCERTAIN`.
23. **Do not add missing Favorite Artists hidden behind “等.”**
24. **Do not turn “not in the list” into “the user hates the artist.”** Preserve scope.
25. **Do not infer a lyric veto rule.** The user has not confirmed a case where bad lyrics destroy an otherwise great song.
26. **Do not infer that the user always pays attention in the same order.** The user explicitly said it depends on what catches him.
27. **Do not infer exact listening frequency from the statement that the user loops favorite songs.**

---

## 27. Machine-readable compact summary

```json
{
  "project": {
    "title": "How I Hear Music",
    "subtitle": "A Personal Music Taste Archive",
    "subject": "the user",
    "age": 20,
    "primaryLanguage": "English",
    "secondaryLanguage": "Chinese",
    "visualDirection": [
      "simple retro",
      "vertical editorial magazine",
      "high information density",
      "cream aged paper",
      "charcoal black",
      "olive sepia dark red accents",
      "serif plus condensed sans",
      "restrained print texture"
    ]
  },
  "artistStatus": {
    "FAVORITE": [
      "单依纯",
      "王力宏",
      "Ariana Grande",
      "祁紫檀",
      "陶喆",
      "关浩德"
    ],
    "UNCERTAIN": ["Lady Gaga"]
  },
  "listeningOrder": [
    "melody",
    "production_or_arrangement",
    "timbre_and_lyrics",
    "vocal_ability"
  ],
  "qualifications": [
    "all is considered",
    "nothing is absolute",
    "attention depends on what catches him",
    "every element needs a reason to exist"
  ],
  "preferences": {
    "melody": [
      "B-type melodies often grow into long-term favorites",
      "simple melodies can work",
      "not intentionally seeking difficult melodies"
    ],
    "arrangement": [
      "dynamic development",
      "new information across repetitions",
      "motif return",
      "foreshadowing and payoff",
      "purposeful surprise",
      "minimal arrangements can work"
    ],
    "groove": [
      "micro-timing",
      "pocket",
      "behind_or_ahead_of_beat phrasing",
      "vocal_drum tension",
      "can rescue a song but rarely replaces melody"
    ],
    "vocal": [
      "skill appreciated but not first priority",
      "human imperfection welcome",
      "obvious Auto-Tune_or_pitch_correction unacceptable",
      "harmony and vocal arrangement welcome",
      "no fixed timbre preference"
    ],
    "lyrics": [
      "slight preference for abstract poetic open-ended lyrics",
      "no confirmed lyric-veto case"
    ]
  },
  "scoreDimensions": ["song", "vocal", "production", "overall"],
  "scoreRules": [
    "overall_is_not_average",
    "resonance_is_qualitative_not_numeric",
    "unknown_is_null_not_zero",
    "preserve_overall_11"
  ],
  "discovery": [
    "accidental song",
    "find album",
    "start track 1",
    "listen through"
  ],
  "hardBoundaries": [
    "do not infer in_the_list as favorite",
    "do not invent production ratings",
    "do not assume genre preference",
    "do not assume timbre preference",
    "do not assume all classics are liked",
    "do not use objectively perfect"
  ]
}
```

---

## 28. Final build brief

Build a long-form personal music archive that feels like an intelligently designed music magazine: visually restrained, information-rich, personal, and slightly archival. The site’s subject is not “a person with a list of favorite artists.” The subject is a listening method.

The emotional center is the discovery that a song can be presented in more than one way. The analytical center is the sequence `melody → production / arrangement → timbre + lyrics → vocal`, qualified by `all is considered`. The philosophical center is intentionality: simple or complex, old or new, mainstream or obscure, every choice must feel like it has a reason to exist.

The data must remain editable and honest. Unknown is not zero. In-the-list is not Favorite. Technical quality is not personal love. Resonance is real, but it is not a fake number.
