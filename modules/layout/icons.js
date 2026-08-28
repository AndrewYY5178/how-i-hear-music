const paths = {
  tracks: '<path d="M7 8h18M7 16h18M7 24h12"/><circle cx="4" cy="8" r="1"/><circle cx="4" cy="16" r="1"/><circle cx="4" cy="24" r="1"/>',
  albums: '<circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="3"/><path d="M16 5v8"/>',
  artists: '<rect x="12" y="5" width="8" height="14" rx="4"/><path d="M8 15a8 8 0 0 0 16 0M16 23v5M12 28h8"/>',
  philosophy: '<path d="M10 5v11a6 6 0 0 0 12 0V5M10 12h12M16 22v5"/>',
  profile: '<path d="M22 8c-8 0-13 5-13 12 0 4 2 7 5 7 2 0 3-2 3-4 0-3-2-4-2-7 0-3 2-5 5-5 3 0 5 2 5 5 0 4-2 7-5 9"/>',
  resonance: '<path d="M6 9h8M18 9h8M6 16h5M21 16h5M6 23h8M18 23h8"/><path d="M14 7l4 4-4 4M18 17l-4 4 4 4"/>',
  compare: '<path d="M5 11c4-5 8 5 12 0s8 5 10 0M5 21c4-5 8 5 12 0s8 5 10 0"/>',
};

export const icon = (name, label = "") => `<svg class="gate-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="${label ? "false" : "true"}"${label ? ` aria-label="${label}" role="img"` : ""}>${paths[name] || ""}</svg>`;
