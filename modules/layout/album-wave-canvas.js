const rgb = (value) => {
  const matches = String(value || "").match(/\d+(?:\.\d+)?/g);
  if (!matches || matches.length < 3) return [90, 86, 78];
  return matches.slice(0, 3).map((channel) => Math.max(0, Math.min(255, Number(channel))));
};

const color = (channels, opacity = 1) => `rgba(${channels.join(" ")} / ${opacity})`;

const paletteFor = (field) => {
  const styles = getComputedStyle(field);
  return [1, 2, 3].map((index) => rgb(styles.getPropertyValue(`--album-color-${index}`)));
};

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export const bindAlbumWaveCanvas = (field) => {
  const canvas = field?.querySelector("[data-album-wave-canvas]");
  if (!canvas) return { refresh() {}, stop() {} };
  const context = canvas.getContext("2d");
  if (!context) return { refresh() {}, stop() {} };

  let frame = 0;
  let visible = !document.hidden;
  let colors = paletteFor(field);
  const resize = () => {
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(innerWidth * scale));
    canvas.height = Math.max(1, Math.round(innerHeight * scale));
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    context.setTransform(scale, 0, 0, scale, 0, 0);
  };
  const paintWave = (time) => {
    const width = innerWidth;
    const height = innerHeight;
    const paper = document.documentElement.dataset.theme === "chromatic" ? [210, 211, 215] : [231, 223, 207];
    context.clearRect(0, 0, width, height);
    context.fillStyle = color(paper, 1);
    context.fillRect(0, 0, width, height);
    context.save();
    context.filter = `blur(${Math.max(54, Math.round(Math.min(width, height) * .085))}px)`;
    context.globalCompositeOperation = "multiply";
    colors.forEach((tone, index) => {
      const phase = time * (.00011 + index * .000017) + index * 2.18;
      const bandHeight = height * (.34 + index * .05);
      const y = height * (.16 + index * .29) + Math.sin(phase * 1.7) * height * .12;
      const amplitude = height * (.11 + index * .022);
      context.beginPath();
      context.moveTo(-width * .18, y + Math.sin(phase) * amplitude);
      for (let x = -width * .18; x <= width * 1.18; x += Math.max(28, width / 22)) {
        const progress = x / width;
        const crest = Math.sin(progress * Math.PI * (1.35 + index * .22) + phase) * amplitude;
        const drift = Math.cos(progress * Math.PI * 3.1 - phase * 1.38) * amplitude * .31;
        context.lineTo(x, y + crest + drift);
      }
      context.lineTo(width * 1.18, y + bandHeight);
      context.lineTo(-width * .18, y + bandHeight);
      context.closePath();
      context.fillStyle = color(tone, document.documentElement.dataset.theme === "chromatic" ? .73 : .54);
      context.fill();
    });
    context.restore();
    context.save();
    context.globalCompositeOperation = "screen";
    colors.forEach((tone, index) => {
      const phase = time * (.00016 + index * .000021) + index * 1.6;
      const x = width * (.22 + index * .31) + Math.sin(phase) * width * .17;
      const y = height * (.44 + (index % 2) * .24) + Math.cos(phase * 1.24) * height * .16;
      const radius = Math.max(width, height) * (.30 + index * .04);
      const glow = context.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, color(tone, document.documentElement.dataset.theme === "chromatic" ? .26 : .15));
      glow.addColorStop(1, color(tone, 0));
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
    });
    context.restore();
  };
  const animate = (time) => {
    if (!field.isConnected) return;
    paintWave(time);
    if (!reducedMotion() && visible) frame = requestAnimationFrame(animate);
  };
  const restart = () => {
    cancelAnimationFrame(frame);
    paintWave(performance.now());
    if (!reducedMotion() && visible) frame = requestAnimationFrame(animate);
  };
  const onVisibilityChange = () => { visible = !document.hidden; if (visible) restart(); else cancelAnimationFrame(frame); };
  const onResize = () => { resize(); restart(); };
  resize();
  restart();
  addEventListener("resize", onResize, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
  return {
    refresh() { colors = paletteFor(field); restart(); },
    stop() { cancelAnimationFrame(frame); removeEventListener("resize", onResize); document.removeEventListener("visibilitychange", onVisibilityChange); }
  };
};
