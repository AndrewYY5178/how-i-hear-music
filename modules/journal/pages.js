import { rating, safe, storage } from "../music/data.js";
import { link, pageHeader } from "../layout/shell.js";

export const journal = () => {
  const entries = storage.get("how-i-hear-music:journal:v1", []);
  return `${pageHeader("JOURNAL", "Taste over time.", "The archive records what stays. Journal records what changes.")}<section class="journal-list">${entries.length ? entries.map((entry) => `<article><time class="mono">${new Date(entry.at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</time><div><span class="mono">${entry.type === "album" ? "ALBUM COMPLETED" : "RATING SAVED"}</span><h2>${safe(entry.title)}</h2>${entry.note ? `<p class="journal-note">${safe(entry.note)}</p>` : ""}<p class="journal-byline">${safe(entry.artist || "")}</p></div><strong>${entry.type === "album" ? rating(entry.overall) : rating(entry.scores?.overall)}</strong></article>`).join("") : `<article class="journal-empty"><span class="mono">NO ENTRIES YET</span><h2>The timeline begins with a saved rating.</h2><p>Rate a track or complete an album session to create the first entry.</p>${link("/rate", "BEGIN A RATING →", "text-link")}</article>`}</section>`;
};
