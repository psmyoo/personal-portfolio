// Hero atmosphere: drifting fog + rising embers
(function () {
  const canvas = document.querySelector(".embers");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const GOLD = [232, 201, 135];
  const TEAL = [96, 226, 212];

  function spawn(anywhere) {
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: 0.8 + Math.random() * 1.8,
      vy: 0.15 + Math.random() * 0.45,
      sway: 0.3 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      c: Math.random() < 0.3 ? TEAL : GOLD,
      tw: 2 + Math.random() * 3,
    };
  }

  const embers = Array.from({ length: 70 }, () => spawn(true));
  const fog = Array.from({ length: 6 }, (_, i) => ({
    x: Math.random() * w,
    y: h * (0.4 + Math.random() * 0.45),
    r: 260 + Math.random() * 300,
    sp: 0.05 + Math.random() * 0.12,
    dir: i % 2 ? 1 : -1,
    a: 0.05 + Math.random() * 0.05,
  }));

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let t = 0;

  function frame() {
    t += 0.016;
    ctx.clearRect(0, 0, w, h);

    for (const f of fog) {
      f.x += f.sp * f.dir;
      if (f.x < -f.r) f.x = w + f.r;
      if (f.x > w + f.r) f.x = -f.r;
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
      g.addColorStop(0, "rgba(24, 48, 78, " + f.a + ")");
      g.addColorStop(1, "rgba(24, 48, 78, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
    }

    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < embers.length; i++) {
      const p = embers[i];
      p.y -= p.vy;
      p.x += Math.sin(t * p.sway + p.phase) * 0.3;
      if (p.y < -10) {
        embers[i] = spawn(false);
        continue;
      }
      const a = 0.32 + 0.32 * Math.sin(t * p.tw + p.phase);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, "rgba(" + p.c[0] + "," + p.c[1] + "," + p.c[2] + "," + a + ")");
      g.addColorStop(1, "rgba(" + p.c[0] + "," + p.c[1] + "," + p.c[2] + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";

    if (!reduced) requestAnimationFrame(frame);
  }
  frame();
})();
