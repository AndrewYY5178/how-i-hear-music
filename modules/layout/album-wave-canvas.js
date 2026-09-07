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
  const paintOrbit = (time) => {
    const width = innerWidth;
    const height = innerHeight;
    const paper = document.documentElement.dataset.theme === "chromatic" ? [210, 211, 215] : [231, 223, 207];
    context.clearRect(0, 0, width, height);
    context.fillStyle = color(paper, 1);
    context.fillRect(0, 0, width, height);
    context.save();
    context.globalCompositeOperation = "multiply";
    colors.forEach((tone, index) => {
      const phase = time * (.000075 + index * .000012) + index * 2.1;
      const x = width * (.23 + index * .29) + Math.sin(phase * 1.17) * width * .12;
      const y = height * (.30 + (index % 2) * .34) + Math.cos(phase * .93) * height * .11;
      const radius = Math.min(width, height) * (.34 + index * .035);
      const disc = context.createRadialGradient(x, y, radius * .08, x, y, radius);
      const alpha = document.documentElement.dataset.theme === "chromatic" ? .25 : .16;
      disc.addColorStop(0, color(tone, alpha));
      disc.addColorStop(.62, color(tone, alpha * .72));
      disc.addColorStop(1, color(tone, 0));
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = disc;
      context.fill();
      context.beginPath();
      context.arc(x, y, radius * .72, 0, Math.PI * 2);
      context.strokeStyle = color(tone, alpha * .34);
      context.lineWidth = 1;
      context.stroke();
    });
    context.restore();
  };
  const animate = (time) => {
    if (!field.isConnected) return;
    paintOrbit(time);
    if (!reducedMotion() && visible) frame = requestAnimationFrame(animate);
  };
  const restart = () => {
    cancelAnimationFrame(frame);
    paintOrbit(performance.now());
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
