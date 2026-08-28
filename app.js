const byId = (id) => document.getElementById(id);

const fetchData = async (path) => {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Could not load " + path);
  return response.json();
};

const [profile, artists, songs, library] = await Promise.all([
  fetchData("./data/music-profile.json"),
  fetchData("./data/artists.json"),
  fetchData("./data/songs.json"),
  fetchData("./data/library.json"),
]);

const statusLabels = {
  FAVORITE: "Favorite",
  IN_THE_LIST: "In the list",
  NOT_IN_THE_LIST: "Not in the list",
  UNCERTAIN: "Maybe",
  UNKNOWN: "Unknown",
};

const schemaLabels = {
  four_dimension: "4 fields",
  historical_song_vocal_overall: "historical 3",
  overall_only: "overall only",
  overall_approximate: "overall ≈",
  vocal_only: "vocal only",
  untyped_single_score: "untyped",
};

const htmlMap = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
const safe = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => htmlMap[character]);
const score = (value) => (value === null || value === undefined ? "—" : value);
const statusLabel = (status) => statusLabels[status] || status;

const writeText = (id, value) => { byId(id).textContent = value; };
document.title = profile.title + " — " + profile.subtitle;
writeText("hero-deck", profile.tagline);
writeText("hero-note", profile.heroNote);
writeText("first-gate-copy", profile.firstGateCopy);
writeText("method-copy", profile.methodCopy);
writeText("surprise-statement", profile.surpriseFactor.statement);
writeText("late-payoff-note", profile.surpriseFactor.latePayoffNote + " Example: " + profile.surpriseFactor.example + ".");
writeText("origin-eyebrow", profile.origin.eyebrow);
writeText("origin-artist", profile.origin.artist);
writeText("origin-lede", profile.origin.lede);
writeText("origin-copy", profile.origin.text);
writeText("origin-side-note", profile.origin.sideNote);
writeText("producer-note", profile.origin.producerNote);
writeText("interview-title", profile.interview.title);
writeText("interview-intro", profile.interview.intro);
writeText("interview-aside-copy", profile.interview.aside);
writeText("voice-statement", profile.humanVoice.statement);
writeText("voice-timbre", profile.humanVoice.timbreNote);
writeText("voice-refusal", profile.humanVoice.refusal);
writeText("constellation-title", artists.constellationTitle);
writeText("score-legend", songs.scoreLegend);
writeText("discovery-title", profile.discovery.title);
writeText("discovery-intro", profile.discovery.intro);
writeText("album-principle", profile.discovery.albumPrinciple);
writeText("requirements-title", profile.notRequirements.title);
writeText("requirements-intro", profile.notRequirements.intro);
writeText("closing-line-one", profile.closing.lineOne);
writeText("closing-line-two", profile.closing.lineTwo);
writeText("closing-note", profile.closing.note + " " + profile.closing.signoff);

byId("listening-order").innerHTML = profile.listeningOrder.map((item, index) => [
  "<article class='order-item' style='--item:", index, "'>",
  "<span class='order-label mono'>", safe(item.label), "</span>",
  "<div><h3>", safe(item.name), "</h3><p>", safe(item.note), "</p></div></article>",
].join("")).join("");

byId("qualifications").innerHTML = profile.qualifications.map((item) => "<span>" + safe(item) + "</span>").join("");

byId("surprise-timeline").innerHTML = profile.surpriseFactor.stages.map((stage, index) => [
  "<article class='timeline-stage' style='--item:", index, "'>",
  "<span class='timeline-time mono'>", safe(stage.time), "</span>",
  "<h3>", safe(stage.label), "</h3><p>", safe(stage.detail), "</p></article>",
].join("")).join("");

byId("surprise-details").innerHTML = profile.surpriseFactor.details.map((detail, index) => [
  "<span style='--item:", index, "'>", safe(detail), "</span>",
].join("")).join("");

byId("voice-positions").innerHTML = profile.humanVoice.positions.map((position) => [
  "<article class='voice-position'><span>", safe(position.label), "</span>",
  "<strong>", safe(position.verdict), "</strong></article>",
].join("")).join("");

byId("voice-affirmations").innerHTML = profile.humanVoice.affirmations.map((item) => "<span>✓ " + safe(item) + "</span>").join("");

byId("interview-index").innerHTML = profile.interview.questions.map((item, index) => [
  "<li><a href='#interview-q-", index + 1, "'><span>Q", String(index + 1).padStart(2, "0"), "</span>", safe(item.question), "</a></li>",
].join("")).join("");

byId("interview-list").innerHTML = profile.interview.questions.map((item, index) => [
  "<article class='interview-entry' id='interview-q-", index + 1, "' style='--item:", index, "'>",
  "<div class='interview-question'><span class='mono'>Q", String(index + 1).padStart(2, "0"), "</span><h3>", safe(item.question), "</h3></div>",
  "<div class='interview-answer'><p>", safe(item.answer), "</p><span class='mono'>", safe(item.note), "</span></div>",
  "</article>",
].join("")).join("");

byId("featured-artists").innerHTML = artists.featured.map((artist, index) => [
  "<article class='artist-node ", artist.id === "shan-yichun" ? "is-origin" : "", "' style='--item:", index, "'>",
  "<span class='artist-index mono'>0", index + 1, "</span>",
  "<h3>", safe(artist.name), "</h3>",
  "<p>", safe(artist.romanized || artist.name), "</p>",
  "<span class='artist-status'>", statusLabel(artist.status), "</span>",
  artist.role ? "<small>" + safe(artist.role) + "</small>" : "",
  "</article>",
].join("")).join("");

byId("uncertain-artists").innerHTML = artists.uncertain.map((artist) => [
  "<span class='uncertain-label'>", safe(artist.label.toUpperCase()), " /</span>",
  "<strong>", safe(artist.name), "</strong><p>", safe(artist.note), "</p>",
].join("")).join("");

const scoreArtists = artists.featured.map((artist) => ({ id: artist.id, label: artist.name }));
scoreArtists.push({ id: "other", label: "Other records" });
let activeScoreFilter = "all";

const renderScoreControls = () => {
  const controls = [{ id: "all", label: "All records" }, ...scoreArtists];
  byId("score-controls").innerHTML = controls.map((control) => [
    "<button class='", activeScoreFilter === control.id ? "active" : "", "'",
    " data-score-filter='", safe(control.id), "' type='button'>", safe(control.label), "</button>",
  ].join("")).join("");
};

const renderScores = () => {
  const featuredIds = new Set(artists.featured.map((artist) => artist.id));
  const records = songs.entries.filter((entry) => {
    if (activeScoreFilter === "all") return true;
    if (activeScoreFilter === "other") return !featuredIds.has(entry.artistId);
    return entry.artistId === activeScoreFilter;
  });

  byId("score-rows").innerHTML = records.map((entry) => {
    const values = entry.scores || {};
    const record = entry.scoreSchema === "untyped_single_score"
      ? "raw " + entry.rawScore
      : (schemaLabels[entry.scoreSchema] || "record");
    return [
      "<tr>",
      "<td data-label='Artist / song'><span class='table-artist'>", safe(entry.artist), "</span><strong>", safe(entry.title), "</strong></td>",
      "<td data-label='Song'>", score(values.song), "</td>",
      "<td data-label='Vocal'>", score(values.vocal), "</td>",
      "<td data-label='Production'>", score(values.production), "</td>",
      "<td data-label='Overall' class='overall-cell'>", score(values.overall), "</td>",
      "<td data-label='Record'><span class='record-type'>", safe(record), "</span>",
      "<span class='status-pill status-", safe(entry.songStatus.toLowerCase()), "'>", statusLabel(entry.songStatus), "</span></td>",
      "</tr>",
    ].join("");
  }).join("");
};

renderScoreControls();
renderScores();

byId("score-controls").addEventListener("click", (event) => {
  const button = event.target.closest("[data-score-filter]");
  if (!button) return;
  activeScoreFilter = button.dataset.scoreFilter;
  renderScoreControls();
  renderScores();
});

byId("reflection-examples").innerHTML = songs.scoreReflections.examples.map((example, index) => [
  "<article class='reflection-card' style='--item:", index, "'>",
  "<span class='mono'>", safe(example.metric), "</span>",
  "<h3>", safe(example.title), "</h3><p>", safe(example.note), "</p></article>",
].join("")).join("");

byId("high-resonance-wall").innerHTML = songs.scoreReflections.highResonanceWall.map((title) => {
  const entry = songs.entries.find((item) => item.title === title);
  return "<span><b>" + safe(title) + "</b><small>Overall " + score(entry?.scores?.overall) + "</small></span>";
}).join("");

const labConfig = songs.interaction;
const labRecords = labConfig.deck.map((reference) => songs.entries.find((entry) => entry.artistId === reference.artistId && entry.title === reference.title)).filter(Boolean);
const labDefaults = { song: 7.5, vocal: 7.5, production: 7.5, overall: 7.5 };
let activeLabIndex = 0;
let activeLabTags = [];

const formatRating = (value) => {
  const numeric = Number(value);
  return Number.isInteger(numeric) ? numeric.toFixed(0) : numeric.toFixed(1);
};

const labRecordKey = (record) => record.artistId + "::" + record.title;
const readLabStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(labConfig.storageKey) || "{}");
  } catch {
    return {};
  }
};
const writeLabStorage = (value) => {
  try {
    localStorage.setItem(labConfig.storageKey, JSON.stringify(value));
  } catch {
    // The interaction remains usable if browser storage is unavailable.
  }
};
const activeLabRecord = () => labRecords[activeLabIndex];

const buildDifferenceSummary = (record, visitor) => {
  const differences = labConfig.scoreFields.map((field) => ({
    field,
    visitor: Number(visitor.scores[field.id]),
    andrew: Number(record.scores[field.id]),
  })).map((item) => ({ ...item, distance: Math.abs(item.visitor - item.andrew) })).sort((a, b) => b.distance - a.distance);
  const largest = differences[0];
  if (largest.distance < 0.3) return "You met Andrew almost exactly. Same record, same landing point.";
  const listener = largest.visitor > largest.andrew ? "You" : "Andrew";
  return listener + " heard more in " + largest.field.label + ". The widest distance is " + formatRating(largest.distance) + " points.";
};

const renderLabResults = () => {
  const record = activeLabRecord();
  const saved = readLabStorage()[labRecordKey(record)];
  if (!saved?.revealed) {
    byId("lab-results").innerHTML = [
      "<div class='lab-lock'><span class='mono'>ANDREW'S SCORE / HIDDEN</span>",
      "<h4>Rate before you reveal.</h4><p>Your score is not compared against an average. It opens a conversation about what each listener heard.</p></div>",
      "<div class='lab-moments-note'><span class='mono'>MUSICAL MOMENTS</span><p>", safe(labConfig.annotationNote), "</p></div>",
    ].join("");
    return;
  }
  const rows = labConfig.scoreFields.map((field) => [
    "<div class='lab-score-row'><span>", safe(field.label), "</span><b>", formatRating(saved.scores[field.id]), "</b><em>", formatRating(record.scores[field.id]), "</em></div>",
  ].join("")).join("");
  const selectedTags = (saved.tags || []).map((tagId) => labConfig.resonanceTags.find((tag) => tag.id === tagId)?.label).filter(Boolean);
  byId("lab-results").innerHTML = [
    "<div class='lab-reveal-head'><span class='mono'>REVEALED / SCORES ARE NOT AVERAGES</span><h4>Two ways of hearing <em>", safe(record.title), "</em>.</h4></div>",
    "<div class='lab-score-labels'><span>FIELD</span><span>YOU</span><span>ANDREW</span></div><div class='lab-score-compare'>", rows, "</div>",
    "<div class='lab-difference'><span class='mono'>TASTE DIFFERENCE</span><p>", safe(buildDifferenceSummary(record, saved)), "</p></div>",
    selectedTags.length ? "<div class='lab-tag-result'><span class='mono'>YOU MARKED</span><p>" + selectedTags.map(safe).join(" · ") + "</p></div>" : "",
  ].join("");
};

const renderListeningLab = () => {
  const record = activeLabRecord();
  const saved = readLabStorage()[labRecordKey(record)];
  activeLabTags = saved?.tags || [];
  writeText("lab-title", labConfig.title);
  writeText("lab-intro", labConfig.intro);
  writeText("lab-annotation-note", labConfig.annotationNote);
  writeText("lab-record-number", "RECORD " + String(activeLabIndex + 1).padStart(2, "0") + " / " + String(labRecords.length).padStart(2, "0"));
  writeText("lab-artist", record.artist);
  writeText("lab-song-title", record.title);
  byId("lab-records").innerHTML = labRecords.map((item, index) => [
    "<button class='", index === activeLabIndex ? "active" : "", "' data-lab-record='", index, "' type='button'><span>", String(index + 1).padStart(2, "0"), "</span>", safe(item.title), "</button>",
  ].join("")).join("");
  byId("lab-sliders").innerHTML = labConfig.scoreFields.map((field) => {
    const value = saved?.scores?.[field.id] ?? labDefaults[field.id];
    return [
      "<label class='lab-slider'><span><b>", safe(field.label), "</b><small>", safe(field.hint), "</small></span>",
      "<input data-lab-score='", safe(field.id), "' type='range' min='1' max='10' step='0.1' value='", value, "'><output>", formatRating(value), "</output></label>",
    ].join("");
  }).join("");
  byId("lab-tags").innerHTML = labConfig.resonanceTags.map((tag) => [
    "<button class='", activeLabTags.includes(tag.id) ? "active" : "", "' data-lab-tag='", safe(tag.id), "' type='button' aria-pressed='", activeLabTags.includes(tag.id), "'>", safe(tag.label), "</button>",
  ].join("")).join("");
  renderLabResults();
};

byId("lab-records").addEventListener("click", (event) => {
  const button = event.target.closest("[data-lab-record]");
  if (!button) return;
  activeLabIndex = Number(button.dataset.labRecord);
  renderListeningLab();
});

byId("lab-next").addEventListener("click", () => {
  activeLabIndex = (activeLabIndex + 1) % labRecords.length;
  renderListeningLab();
});

byId("lab-sliders").addEventListener("input", (event) => {
  const input = event.target.closest("[data-lab-score]");
  if (!input) return;
  input.nextElementSibling.value = formatRating(input.value);
  input.nextElementSibling.textContent = formatRating(input.value);
});

byId("lab-tags").addEventListener("click", (event) => {
  const button = event.target.closest("[data-lab-tag]");
  if (!button) return;
  const tagId = button.dataset.labTag;
  if (activeLabTags.includes(tagId)) activeLabTags = activeLabTags.filter((item) => item !== tagId);
  else if (activeLabTags.length < 3) activeLabTags = [...activeLabTags, tagId];
  byId("lab-tags").querySelectorAll("[data-lab-tag]").forEach((tag) => {
    const active = activeLabTags.includes(tag.dataset.labTag);
    tag.classList.toggle("active", active);
    tag.setAttribute("aria-pressed", String(active));
  });
});

byId("lab-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const record = activeLabRecord();
  const scores = Object.fromEntries(labConfig.scoreFields.map((field) => [field.id, Number(byId("lab-sliders").querySelector("[data-lab-score='" + field.id + "']").value)]));
  const saved = readLabStorage();
  saved[labRecordKey(record)] = { scores, tags: activeLabTags, revealed: true, updatedAt: new Date().toISOString() };
  writeLabStorage(saved);
  renderListeningLab();
});

byId("lab-reset").addEventListener("click", () => {
  const saved = readLabStorage();
  delete saved[labRecordKey(activeLabRecord())];
  writeLabStorage(saved);
  renderListeningLab();
});

renderListeningLab();

byId("discovery-path").innerHTML = profile.discovery.steps.map((step, index) => [
  "<span style='--item:", index, "'><b>", String(index + 1).padStart(2, "0"), "</b>", safe(step), "</span>",
].join("")).join("");

byId("album-qualifiers").innerHTML = profile.discovery.albumQualifiers.map((item) => "<span>" + safe(item) + "</span>").join("");
byId("album-shelf").innerHTML = profile.albumArchive.map((album, index) => [
  "<article style='--item:", index, "'>",
  album.coverUrl ? "<div class='album-cover-frame'><img class='album-cover' src='" + safe(album.coverUrl) + "' alt='" + safe(album.artist + " — " + album.title) + " album cover' loading='lazy'></div>" : "<div class='album-cover-frame'><div class='album-cover album-cover-fallback'>NO COVER</div></div>",
  "<span class='mono'>A", String(index + 1).padStart(2, "0"), "</span>",
  "<h3>", safe(album.title), "</h3><p>", safe(album.artist || "Artist pending"), "</p></article>",
].join("")).join("");

let selectedArchiveId = songs.catalog[0].artistId;

const renderArchive = () => {
  const active = songs.catalog.find((item) => item.artistId === selectedArchiveId) || songs.catalog[0];
  byId("archive-artists").innerHTML = songs.catalog.map((artist, index) => [
    "<button class='", artist.artistId === active.artistId ? "active" : "", "' data-archive-artist='", safe(artist.artistId), "' type='button'>",
    "<span>", String(index + 1).padStart(2, "0"), "</span>", safe(artist.artist), "</button>",
  ].join("")).join("");
  writeText("archive-count", active.titles.length + " TITLES / " + statusLabel(active.status).toUpperCase());
  writeText("archive-artist-name", active.artist);
  writeText("archive-status", statusLabel(active.status));
  const listed = active.titles.map((title, index) => {
    const record = songs.entries.find((entry) => entry.artistId === active.artistId && entry.title === title);
    const overall = record?.scores?.overall;
    return [
      "<article style='--item:", index, "'><span>", String(index + 1).padStart(2, "0"), "</span>",
      "<strong>", safe(title), "</strong>",
      overall !== null && overall !== undefined ? "<em>" + overall + "</em>" : "",
      "</article>",
    ].join("");
  }).join("");
  const excluded = active.notInList?.length
    ? "<div class='not-in-list'><span class='mono'>NOT IN THE LIST</span><p>" + active.notInList.map(safe).join(" · ") + "</p></div>"
    : "";
  byId("archive-songs").innerHTML = listed + excluded;
};

renderArchive();
byId("archive-artists").addEventListener("click", (event) => {
  const button = event.target.closest("[data-archive-artist]");
  if (!button) return;
  selectedArchiveId = button.dataset.archiveArtist;
  renderArchive();
});

byId("boundary-content").innerHTML = [
  "<p>", safe(artists.boundaries.note), "</p>",
  "<div><span class='mono'>NOT IN THE LIST</span><p>", artists.boundaries.notInTheList.map(safe).join(" · "), "</p></div>",
  "<div><span class='mono'>LOW PRESENCE</span><p>", artists.boundaries.lowPresence.map(safe).join(" · "), "</p></div>",
].join("");

const importSources = library.supportedSources;
let activeImportSource = importSources[0].id;
let importPreview = [];

const cleanText = (value) => String(value || "").trim().replace(/\s+/g, " ");
const canonicalText = (value) => cleanText(value).normalize("NFKC").toLowerCase()
  .replace(/[‘’'"“”]/g, "")
  .replace(/[()（）\[\]【】]/g, "")
  .replace(/[·•,，.。:：!！?？/\\]/g, "")
  .replace(/\b(feat|ft)\.?\b.*$/i, "")
  .replace(/\s+/g, "");
const trackKey = (track) => canonicalText(track.title) + "::" + canonicalText(track.artist) + "::" + canonicalText(track.album);
const titleArtistKey = (track) => canonicalText(track.title) + "::" + canonicalText(track.artist);
const currentSource = () => importSources.find((source) => source.id === activeImportSource) || importSources[0];
const readInbox = () => {
  try { return JSON.parse(localStorage.getItem(library.storageKey) || "[]"); } catch { return []; }
};
const writeInbox = (entries) => {
  try { localStorage.setItem(library.storageKey, JSON.stringify(entries)); } catch { /* Local review remains optional. */ }
};
const allKnownTracks = () => songs.entries.filter((entry) => entry.scores !== null).map((entry) => ({ title: entry.title, artist: entry.artist, album: "", source: "archive" }));

const identifySourceFromUrl = (value) => {
  try {
    const host = new URL(value).hostname.toLowerCase();
    if (host.endsWith("qq.com")) return "qqmusic";
    if (host.endsWith("163.com")) return "netease";
  } catch { /* A blank or partial link is handled in the form result. */ }
  return null;
};
const parseTracks = (value) => value.split(/\r?\n/).map((line) => cleanText(line.replace(/^\s*\d+[.、)\-]\s*/, ""))).filter(Boolean).map((line) => {
  const parts = line.split(/\t+|\s+[—–]\s+|\s+-\s+/).map(cleanText).filter(Boolean);
  return { title: parts[0] || line, artist: parts[1] || "Artist not recorded", album: parts[2] || "" };
}).filter((track) => track.title);
const classifyImport = (tracks) => {
  const inbox = readInbox();
  const known = allKnownTracks();
  const seen = new Set();
  return tracks.map((track) => {
    const exact = trackKey(track);
    const loose = titleArtistKey(track);
    let state = "new";
    if (seen.has(exact) || inbox.some((item) => trackKey(item) === exact)) state = "duplicate";
    else if (known.some((item) => titleArtistKey(item) === loose)) state = "matched";
    seen.add(exact);
    return { ...track, state };
  });
};
const renderImportSources = () => {
  byId("import-sources").innerHTML = importSources.map((source) => [
    "<button class='", source.id === activeImportSource ? "active" : "", "' type='button' data-import-source='", safe(source.id), "'><span>", safe(source.label), "</span><small>", safe(source.status), "</small></button>",
  ].join("")).join("");
};
const renderImportPreview = (message = "") => {
  if (!importPreview.length) {
    byId("import-preview").innerHTML = "<div class='import-preview-empty'><span class='mono'>IMPORT PREVIEW</span><h3>Bring a playlist to the desk.</h3><p>" + safe(message || "Choose a service, add its public share link, then paste the tracks you want to review.") + "</p></div>";
    return;
  }
  const counts = importPreview.reduce((total, item) => ({ ...total, [item.state]: (total[item.state] || 0) + 1 }), {});
  byId("import-preview").innerHTML = [
    "<div class='import-preview-head'><span class='mono'>IMPORT PREVIEW / ", safe(currentSource().label.toUpperCase()), "</span><h3>", importPreview.length, " tracks found</h3><p><b>", counts.new || 0, " new</b> · ", counts.matched || 0, " already in archive · ", counts.duplicate || 0, " duplicate</p></div>",
    "<div class='import-preview-list'>", importPreview.map((track) => "<article><span class='import-state "+ safe(track.state) + "'>" + safe(track.state) + "</span><strong>" + safe(track.title) + "</strong><small>" + safe(track.artist + (track.album ? " · " + track.album : "")) + "</small></article>").join(""), "</div>",
    "<button class='import-confirm' id='import-confirm' type='button'>ADD NEW TRACKS TO INBOX</button>",
  ].join("");
};
const renderInbox = () => {
  const inbox = readInbox();
  writeText("inbox-count", inbox.length + " WAITING");
  byId("inbox-list").innerHTML = inbox.length ? inbox.map((track, index) => [
    "<article><span class='mono'>", String(index + 1).padStart(2, "0"), "</span><div><strong>", safe(track.title), "</strong><p>", safe(track.artist + (track.album ? " · " + track.album : "")), "</p></div><small>", safe(track.sourceLabel), "</small><div class='inbox-actions'><button data-inbox-action='keep' data-inbox-id='", safe(track.id), "' type='button'>KEEP</button><button data-inbox-action='ignore' data-inbox-id='", safe(track.id), "' type='button'>IGNORE</button></div></article>",
  ].join("")).join("") : "<p class='inbox-empty'>" + safe(library.copy.empty) + "</p>";
};

writeText("inbox-title", library.title);
writeText("inbox-intro", library.copy.intro);
writeText("inbox-privacy", library.copy.privacy);
writeText("import-guide", library.copy.pasteGuide);
writeText("import-adapter-note", library.copy.adapterNote);
renderImportSources();
renderImportPreview();
renderInbox();

byId("import-sources").addEventListener("click", (event) => {
  const button = event.target.closest("[data-import-source]");
  if (!button) return;
  activeImportSource = button.dataset.importSource;
  renderImportSources();
  byId("import-url").placeholder = currentSource().urlHint;
});
byId("import-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const url = cleanText(byId("import-url").value);
  const detected = url ? identifySourceFromUrl(url) : activeImportSource;
  if (url && detected !== activeImportSource) {
    importPreview = [];
    renderImportPreview("That link does not match the selected service. Choose the correct source or paste its public playlist link.");
    return;
  }
  const parsed = parseTracks(byId("import-tracks").value);
  if (!parsed.length) {
    importPreview = [];
    renderImportPreview("Add at least one track line to prepare an import preview. A public URL is saved as the source after you confirm.");
    return;
  }
  importPreview = classifyImport(parsed).map((track) => ({ ...track, sourceUrl: url, source: activeImportSource, sourceLabel: currentSource().label }));
  renderImportPreview();
});
byId("import-preview").addEventListener("click", (event) => {
  if (event.target.closest("#import-confirm")) {
    const inbox = readInbox();
    const additions = importPreview.filter((track) => track.state === "new").map((track) => ({ ...track, id: "inbox_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7), importedAt: new Date().toISOString() }));
    writeInbox([...inbox, ...additions]);
    importPreview = [];
    byId("import-tracks").value = "";
    renderImportPreview(additions.length ? additions.length + " new track" + (additions.length === 1 ? " is" : "s are") + " now waiting in your inbox." : "Everything in this preview was already known or duplicated, so nothing was added.");
    renderInbox();
  }
});
byId("import-clear").addEventListener("click", () => {
  byId("import-url").value = "";
  byId("import-tracks").value = "";
  importPreview = [];
  renderImportPreview();
});
byId("inbox-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-inbox-action]");
  if (!button) return;
  const inbox = readInbox().filter((track) => track.id !== button.dataset.inboxId);
  writeInbox(inbox);
  renderInbox();
});

byId("requirements-grid").innerHTML = profile.notRequirements.items.map((item, index) => "<span style='--item:" + index + "'>" + safe(item) + "</span>").join("");
byId("principles-list").innerHTML = profile.principles.map((item, index) => "<p><b>0" + (index + 1) + "</b>" + safe(item) + "</p>").join("");

const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  byId("scroll-progress").style.transform = "scaleX(" + (scrollable > 0 ? window.scrollY / scrollable : 0) + ")";
};

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealTargets = document.querySelectorAll("[data-reveal]");
if (reduceMotion) {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((target) => observer.observe(target));
}
