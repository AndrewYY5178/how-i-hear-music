import { allAlbums, allTracks, rating, safe, storage, trackId } from "./music/data.js";
import { radar, waveform } from "./rating/visuals.js";

const shuffled = (records) => {
  const result = [...records];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
};

const withCurrentScores = (track) => ({
  ...track,
  scores: storage.get("how-i-hear-music:rating-sessions:v2", {})[trackId(track)]?.scores || track.scores || {},
});

export const home = () => {
  const ratedTracks = shuffled(allTracks().map(withCurrentScores).filter((track) => Number.isFinite(Number(track.scores?.overall))));
  const current = ratedTracks.slice(0, 4);
  const featuredTrack = ratedTracks[4] || ratedTracks[0] || withCurrentScores(allTracks()[0] || {});
  const albumCandidates = shuffled(allAlbums().map((album) => {
    const tracks = (album.tracks?.length ? album.tracks : allTracks().filter((track) => track.artist === album.artist && track.album === album.title)).map(withCurrentScores);
    return { ...album, tracks: tracks.map((track) => ({ title: track.title, overall: track.scores?.overall })) };
  }));
  const featuredAlbum = albumCandidates.find((album) => album.tracks.some((track) => Number.isFinite(Number(track.overall)))) || albumCandidates[0] || { title: "—", artist: "", tracks: [] };
  return `<section class="home-hero"><h1>How I<br><em>hear music.</em></h1><p>Melody opens the door.<br>Everything else has to earn its place.</p></section><section class="home-section"><span class="eyebrow mono">CURRENTLY LISTENING</span><div class="current-grid">${current.map((track) => `<article><p>${safe(track.artist)}</p><h2>${safe(track.title)}</h2><strong>${rating(track.scores.overall)}</strong></article>`).join("")}</div></section><section class="featured-shape"><div class="featured-shape-copy"><span class="eyebrow mono">FEATURED SHAPE</span><h2>${safe(featuredTrack.title)}</h2><p>${safe(featuredTrack.artist)}</p></div><div class="featured-shape-visual">${radar(featuredTrack.scores, { className: "home-radar" })}</div><div class="feature-score" aria-label="Track score breakdown">${["song", "vocal", "production", "overall"].map((field) => `<span>${field}<b>${rating(featuredTrack.scores[field])}</b></span>`).join("")}</div></section><section class="featured-landscape"><div><span class="eyebrow mono">FEATURED LANDSCAPE</span><h2>${safe(featuredAlbum.title)}</h2><p>${safe(featuredAlbum.artist)}</p></div><div>${waveform(featuredAlbum.tracks)}</div></section><section class="short-manifesto"><p>Music can be minimal or maximal, familiar or surprising. The only question is whether it stays alive.</p></section>`;
};
