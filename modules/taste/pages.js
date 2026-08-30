import { allArtists, allTracks, data, findTrack, rating, safe, storage, trackId } from "../music/data.js";
import { radar } from "../rating/visuals.js";
import { link, pageHeader, secondaryNav } from "../layout/shell.js";
import { icon } from "../layout/icons.js";
import { antiRecommendationPatterns, currentEvidence } from "../music/analysis.js";
import { insightLabel, insightStats } from "../music/insights.js";
import { readSonic, sonicDimensions } from "../music/sonic.js";
import { addTasteGroup, readTasteGroups, removeTasteGroup } from "../music/groups.js";
import { listeningPortrait } from "../music/portrait.js";

const tasteNav = () => secondaryNav([["/taste/philosophy", "Philosophy"], ["/taste/profile", "Profile"], ["/taste/good-not-mine", "Good ≠ Mine"], ["/taste/compare", "Compare"]]);
const tasteGates = [["LISTENING PHILOSOPHY", "/taste/philosophy", "The parts that need a reason to exist.", "philosophy"], ["MY TASTE PROFILE", "/taste/profile", "A visual summary, not a personality test.", "profile"], ["GOOD ≠ MINE", "/taste/good-not-mine", "Respect and resonance are different things.", "resonance"], ["COMPARE WITH ME", "/taste/compare", "Rate a track, then reveal the distance.", "compare"]];
const analysisRoutes = [["BOUNDARIES", "/taste/anti-recommendation"], ["SONIC MAP", "/taste/sonic-map"], ["TASTE CONSTELLATION", "/taste/family-tree"], ["LISTENING PORTRAIT", "/taste/portrait"]];
export const tasteHome = () => `${pageHeader("TASTE", "How I hear music.", "The listening method behind the archive.")}${tasteNav()}<div class="taste-gates">${tasteGates.map(([title, href, copy, iconName]) => `<article><span class="taste-symbol">${icon(iconName)}</span><span class="mono">${title}</span><p>${copy}</p>${link(href, "Enter →", "text-link")}</article>`).join("")}</div><nav class="taste-analysis-index" aria-label="Personal analysis">${analysisRoutes.map(([label, href], index) => link(href, `${String(index + 1).padStart(2, "0")} / ${label} →`)).join("")}</nav>`;

export const philosophy = () => `${pageHeader("TASTE / PHILOSOPHY", "Every element needs a reason.", data.profile.methodCopy)}${tasteNav()}<div class="essay-stack"><article><span>01</span><h2>Melody opens the door.</h2><p>${safe(data.profile.firstGateCopy)}</p></article>${data.profile.listeningOrder.map((item, index) => `<article><span>${String(index + 2).padStart(2, "0")}</span><h2>${safe(item.name)}</h2><p>${safe(item.note)}</p></article>`).join("")}<article><span>06</span><h2>Surprise belongs to the song.</h2><p>${safe(data.profile.surpriseFactor.latePayoffNote)}</p></article><article><span>07</span><h2>The human voice stays human.</h2><p>${safe(data.profile.humanVoice.refusal)}</p></article></div>`;

export const profile = () => {
  const traits = [["MELODY", "high priority"], ["PRODUCTION", "high priority"], ["VOCAL SKILL", "appreciated, not decisive"], ["HARMONY", "strong affinity"], ["GROOVE", "strong affinity"], ["COMPLEXITY", "context dependent"]];
  const stats = insightStats(currentEvidence());
  return `${pageHeader("TASTE / PROFILE", "A listening profile.", "A compact map of priorities—not a verdict on music.")}${tasteNav()}<div class="profile-grid">${traits.map(([label, note]) => `<article><span class="mono">${label}</span><strong>${note}</strong></article>`).join("")}</div><section class="insight-analysis"><span class="mono">WHAT MAKES 9+ TRACKS WORK?</span>${stats.length ? `<div>${stats.map((item) => `<p><strong>${Math.round(item.count / item.total * 100)}%</strong><span>${safe(insightLabel[item.tag])}</span><small>${item.count} OF ${item.total} TAGGED TRACKS</small></p>`).join("")}</div>` : `<h2>Not enough explicit listening reasons yet.</h2>`}</section>`;
};

export const goodNotMine = () => {
  const entries = data.songs.scoreReflections.examples.map((example) => data.songs.entries.find((entry) => entry.title === example.title)).filter(Boolean);
  return `${pageHeader("TASTE / GOOD ≠ MINE", "I know it's good. It's just not mine.", "Technical admiration and personal resonance do not need to agree.")}${tasteNav()}<div class="good-not-mine">${entries.map((track) => `<article><div>${radar(track.scores, { className: "mini-radar" })}</div><p>${safe(track.artist)}</p><h2>${safe(track.title)}</h2><dl><div><dt>SONG</dt><dd>${rating(track.scores.song)}</dd></div><div><dt>VOCAL</dt><dd>${rating(track.scores.vocal)}</dd></div><div><dt>OVERALL</dt><dd>${rating(track.scores.overall)}</dd></div></dl></article>`).join("")}</div>`;
};

export const compare = () => {
  const ratings = storage.get("how-i-hear-music:rating-sessions:v2", {}); const comparisons = Object.entries(ratings).map(([id, visitor]) => ({ track: findTrack(id), visitor })).filter(({ track, visitor }) => Number.isFinite(track?.scores?.overall) && Number.isFinite(visitor?.scores?.overall));
  const distances = comparisons.map(({ track, visitor }) => Math.abs(track.scores.overall - visitor.scores.overall)); const average = distances.length ? distances.reduce((sum, value) => sum + value, 0) / distances.length : null; const match = average === null ? null : Math.max(0, Math.round((1 - average / 11) * 100));
  const content = comparisons.length >= 3 ? `<span class="mono">TASTE MATCH / ${comparisons.length} SHARED TRACKS</span><h2>${match}% listening proximity.</h2><p>This is the average distance between your Overall scores and Andrew’s—not a compatibility verdict.</p><div class="taste-distances">${comparisons.slice(0, 6).map(({ track, visitor }) => `<span><b>${safe(track.title)}</b><em>${rating(visitor.scores.overall)} / ${rating(track.scores.overall)}</em></span>`).join("")}</div>` : `<span class="mono">TASTE MATCH / LOCAL-ONLY</span><h2>${comparisons.length ? `${3 - comparisons.length} more shared ${3 - comparisons.length === 1 ? "track" : "tracks"}.` : "Comparison begins with a real score."}</h2><p>Rate at least three archived tracks. Your ratings remain in this browser and no public profile is created.</p>`;
  return `${pageHeader("TASTE / COMPARE", "Two ways of hearing.", "Rate selected tracks in the dedicated workspace, then reveal the distance.", link("/rate", "RATE A TRACK", "button primary"))}${tasteNav()}<section class="compare-callout">${content}</section>`;
};

export const antiRecommendation = () => {
  const patterns = antiRecommendationPatterns();
  return `${pageHeader("TASTE / BOUNDARIES", "What probably won't work for me?", "Patterns require at least three rated tracks. They describe recurring distance, never a genre stereotype.")}${patterns.length ? `<section class="anti-patterns">${patterns.map((pattern) => `<article><span class="mono">PATTERN FROM ${pattern.records.length} TRACKS</span><h2>${safe(pattern.title)}</h2><p>${safe(pattern.copy)}</p><div>${pattern.records.slice(0, 5).map((record) => link(`/archive/tracks/${record.id}`, record.title)).join("")}</div></article>`).join("")}</section>` : `<section class="analysis-empty"><span class="mono">NOT ENOUGH EVIDENCE</span><h2>No boundary repeats across three tracks yet.</h2><p>More explicit ratings may reveal a pattern; the site will not manufacture one.</p></section>`}`;
};

const sonicAxis = (key) => sonicDimensions[key] || sonicDimensions.warmCold;
export const sonicMap = () => {
  const params = new URLSearchParams(location.search); const keys = Object.keys(sonicDimensions); const xKey = keys.includes(params.get("x")) ? params.get("x") : "warmCold"; const yKey = keys.includes(params.get("y")) ? params.get("y") : "denseSparse"; const values = readSonic();
  const points = Object.entries(values).map(([id, sonic]) => ({ track: findTrack(id), sonic })).filter((item) => item.track && Number.isFinite(Number(item.sonic[xKey])) && Number.isFinite(Number(item.sonic[yKey])));
  const axisOptions = (selected) => keys.map((key) => `<option value="${key}"${key === selected ? " selected" : ""}>${sonicDimensions[key].label}</option>`).join(""); const x = sonicAxis(xKey); const y = sonicAxis(yKey);
  const chart = points.length ? `<svg class="sonic-map" viewBox="0 0 720 520" role="img" aria-label="Sonic map"><line x1="60" y1="260" x2="660" y2="260"></line><line x1="360" y1="40" x2="360" y2="480"></line><text x="60" y="500">${x.low}</text><text x="660" y="500" text-anchor="end">${x.high}</text><text x="360" y="24" text-anchor="middle">${y.low}</text><text x="360" y="516" text-anchor="middle">${y.high}</text>${points.map(({ track, sonic }) => `<g transform="translate(${360 + Number(sonic[xKey]) * 280} ${260 + Number(sonic[yKey]) * 200})"><circle r="5"></circle><text x="10" y="4">${safe(track.title)}</text></g>`).join("")}</svg>` : `<div class="analysis-empty"><span class="mono">NO SONIC CHARACTER YET</span><h2>Save Listening Temperature on a Track detail page.</h2></div>`;
  return `${pageHeader("TASTE / SONIC MAP", "Character, not quality.", "Choose two axes. Every point comes from an explicit local descriptor.")}<form class="sonic-axis-form"><label><span class="mono">X AXIS</span><select name="x">${axisOptions(xKey)}</select></label><label><span class="mono">Y AXIS</span><select name="y">${axisOptions(yKey)}</select></label><button class="button" type="submit">REDRAW</button></form>${chart}`;
};

const groupMemberOptions = (type) => (type === "track" ? allTracks().map((track) => [trackId(track), `${track.title} — ${track.artist}`]) : allArtists().map((artist) => [artist.id, artist.name])).map(([id, label]) => `<option value="${safe(id)}">${safe(label)}</option>`).join("");
const memberName = (type, id) => type === "track" ? findTrack(id)?.title : allArtists().find((artist) => artist.id === id)?.name;
export const familyTree = () => {
  const groups = readTasteGroups();
  return `${pageHeader("TASTE / CONSTELLATION", "Musical family, without genre boxes.", "One artist or track may appear in several manually curated branches.")}<section class="taste-constellation">${groups.length ? groups.map((group) => `<article><span class="mono">${safe(group.memberType.toUpperCase())} GROUP</span><h2>${safe(group.name)}</h2>${group.description ? `<p>${safe(group.description)}</p>` : ""}<ul>${group.memberIds.map((id) => `<li>${safe(memberName(group.memberType, id) || "Missing local record")}</li>`).join("")}</ul><button type="button" data-remove-group="${safe(group.id)}">REMOVE GROUP</button></article>`).join("") : `<div class="analysis-empty"><span class="mono">NO GROUPS YET</span><h2>Build the first branch from what actually matters.</h2></div>`}</section><form class="taste-group-form"><span class="mono">CURATE A GROUP</span><label><span>NAME</span><input name="name" required maxlength="60" placeholder="Harmony-heavy"></label><label><span>DESCRIPTION</span><input name="description" maxlength="160" placeholder="What connects these records?"></label><label><span>MEMBER TYPE</span><select name="memberType"><option value="artist">ARTISTS</option><option value="track">TRACKS</option></select></label><label><span>MEMBERS</span><select name="memberIds" multiple size="8">${groupMemberOptions("artist")}</select></label><button class="button primary" type="submit">ADD GROUP</button><p data-group-status>Stored only in this browser.</p></form>`;
};

export const portrait = () => {
  const scope = new URLSearchParams(location.search).get("scope") || "9plus"; const evidence = currentEvidence(); const tracks = scope === "all" ? evidence : evidence.filter((track) => Number(track.scores?.overall) >= (scope === "favorites" ? 9.5 : 9)); const albums = storage.get("how-i-hear-music:journal:v1", []).filter((entry) => entry.type === "album" && Array.isArray(entry.tracks));
  return `${pageHeader("TASTE / LISTENING PORTRAIT", "The archive as a print.", "Track shapes and album landscapes become one sampled composition—not a dashboard.")}<nav class="portrait-filters">${[["9plus", "9+ TRACKS"], ["favorites", "FAVORITES"], ["all", "ALL TIME"]].map(([value, label]) => link(`/taste/portrait?scope=${value}`, label, value === scope ? "active" : "")).join("")}</nav>${listeningPortrait({ tracks, albums, year: "MY LISTENING PORTRAIT" })}`;
};

export const bindTaste = (path, navigate) => {
  if (path === "/taste/sonic-map") document.querySelector(".sonic-axis-form")?.addEventListener("submit", (event) => { event.preventDefault(); const values = new FormData(event.currentTarget); navigate(`/taste/sonic-map?x=${encodeURIComponent(values.get("x"))}&y=${encodeURIComponent(values.get("y"))}`); });
  if (path !== "/taste/family-tree") return;
  const form = document.querySelector(".taste-group-form"); const type = form?.elements.memberType; const members = form?.elements.memberIds;
  type?.addEventListener("change", () => { members.innerHTML = groupMemberOptions(type.value); });
  form?.addEventListener("submit", (event) => { event.preventDefault(); const values = new FormData(form); try { addTasteGroup({ name: values.get("name"), description: values.get("description"), memberType: values.get("memberType"), memberIds: values.getAll("memberIds") }); navigate(path); } catch (error) { form.querySelector("[data-group-status]").textContent = error.message; } });
  document.querySelector(".taste-constellation")?.addEventListener("click", (event) => { const button = event.target.closest("[data-remove-group]"); if (!button) return; removeTasteGroup(button.dataset.removeGroup); navigate(path); });
};
