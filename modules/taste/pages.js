import { data, rating, safe } from "../music/data.js";
import { radar } from "../rating/visuals.js";
import { link, pageHeader, secondaryNav } from "../layout/shell.js";

const tasteNav = () => secondaryNav([["/taste/philosophy", "Philosophy"], ["/taste/profile", "Profile"], ["/taste/good-not-mine", "Good ≠ Mine"], ["/taste/compare", "Compare"]]);
export const tasteHome = () => `${pageHeader("TASTE", "How I hear music.", "The listening method behind the archive.")}${tasteNav()}<div class="taste-gates">${[["LISTENING PHILOSOPHY", "/taste/philosophy", "The parts that need a reason to exist."], ["MY TASTE PROFILE", "/taste/profile", "A visual summary, not a personality test."], ["GOOD ≠ MINE", "/taste/good-not-mine", "Respect and resonance are different things."], ["COMPARE WITH ME", "/taste/compare", "Rate a track, then reveal the distance."]].map(([title, href, copy]) => `<article><span class="mono">${title}</span><p>${copy}</p>${link(href, "Enter →", "text-link")}</article>`).join("")}</div>`;

export const philosophy = () => `${pageHeader("TASTE / PHILOSOPHY", "Every element needs a reason.", data.profile.methodCopy)}${tasteNav()}<div class="essay-stack"><article><span>01</span><h2>Melody opens the door.</h2><p>${safe(data.profile.firstGateCopy)}</p></article>${data.profile.listeningOrder.map((item, index) => `<article><span>${String(index + 2).padStart(2, "0")}</span><h2>${safe(item.name)}</h2><p>${safe(item.note)}</p></article>`).join("")}<article><span>06</span><h2>Surprise belongs to the song.</h2><p>${safe(data.profile.surpriseFactor.latePayoffNote)}</p></article><article><span>07</span><h2>The human voice stays human.</h2><p>${safe(data.profile.humanVoice.refusal)}</p></article></div>`;

export const profile = () => {
  const traits = [["MELODY", "high priority"], ["PRODUCTION", "high priority"], ["VOCAL SKILL", "appreciated, not decisive"], ["HARMONY", "strong affinity"], ["GROOVE", "strong affinity"], ["COMPLEXITY", "context dependent"]];
  return `${pageHeader("TASTE / PROFILE", "A listening profile.", "A compact map of priorities—not a verdict on music.")}${tasteNav()}<div class="profile-grid">${traits.map(([label, note]) => `<article><span class="mono">${label}</span><strong>${note}</strong></article>`).join("")}</div>`;
};

export const goodNotMine = () => {
  const entries = data.songs.scoreReflections.examples.map((example) => data.songs.entries.find((entry) => entry.title === example.title)).filter(Boolean);
  return `${pageHeader("TASTE / GOOD ≠ MINE", "I know it's good. It's just not mine.", "Technical admiration and personal resonance do not need to agree.")}${tasteNav()}<div class="good-not-mine">${entries.map((track) => `<article><div>${radar(track.scores, { className: "mini-radar" })}</div><p>${safe(track.artist)}</p><h2>${safe(track.title)}</h2><dl><div><dt>SONG</dt><dd>${rating(track.scores.song)}</dd></div><div><dt>VOCAL</dt><dd>${rating(track.scores.vocal)}</dd></div><div><dt>OVERALL</dt><dd>${rating(track.scores.overall)}</dd></div></dl></article>`).join("")}</div>`;
};

export const compare = () => `${pageHeader("TASTE / COMPARE", "Two ways of hearing.", "Rate a selected track in the dedicated workspace, then reveal Andrew’s response.", link("/rate", "RATE A TRACK", "button primary"))}${tasteNav()}<section class="compare-callout"><span class="mono">TASTE MATCH / LOCAL-ONLY</span><h2>Comparison begins with a real score.</h2><p>Your ratings remain in this browser. Taste Match, Guess My Score and This or That have a home here when enough comparisons exist.</p></section>`;
