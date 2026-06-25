"use client";

import { useEffect, useRef } from "react";

type Pt = { x: number; y: number; w: number };

// Classic two-pass heatmap: additive grayscale alpha blobs, then recolor
// each pixel through a blue→red ramp keyed on accumulated alpha.
export function Heatmap({ points }: { points: Pt[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    function draw() {
      if (!wrap || !canvas) return;
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.max(1, Math.round(rect.width));
      const H = Math.max(1, Math.round(rect.height));
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      // pass 1 — alpha intensity
      const radius = Math.max(26, W * 0.06);
      ctx.globalCompositeOperation = "lighter";
      for (const p of points) {
        const cx = p.x * W;
        const cy = p.y * H;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        const a = Math.min(0.9, 0.18 + p.w * 0.22);
        g.addColorStop(0, `rgba(0,0,0,${a})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // pass 2 — recolor by alpha
      ctx.globalCompositeOperation = "source-over";
      const img = ctx.getImageData(0, 0, W * dpr, H * dpr);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const a = d[i + 3] / 255;
        if (a === 0) continue;
        const [r, g, b] = ramp(a);
        d[i] = r;
        d[i + 1] = g;
        d[i + 2] = b;
        d[i + 3] = Math.min(255, a * 235);
      }
      ctx.putImageData(img, 0, 0);
    }

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [points]);

  return (
    <div ref={wrapRef} className="relative aspect-[16/11] w-full overflow-hidden rounded-xl border border-line bg-white">
      <Screenshot />
      <canvas ref={canvasRef} className="absolute inset-0 mix-blend-multiply" />
      <div className="absolute bottom-2 right-2 flex items-center gap-2 rounded-md bg-white/85 px-2 py-1 font-mono text-[10px] text-stone-600 shadow-sm backdrop-blur">
        <span>low</span>
        <span className="h-2 w-16 rounded-full" style={{ background: "linear-gradient(90deg,#3b6fe0,#27c2c2,#39b54a,#ecd44a,#e0533d)" }} />
        <span>high</span>
      </div>
    </div>
  );
}

// blue → cyan → green → yellow → red
function ramp(t: number): [number, number, number] {
  const stops: [number, number, number, number][] = [
    [0.0, 59, 111, 224],
    [0.35, 39, 194, 194],
    [0.55, 57, 181, 74],
    [0.78, 236, 212, 74],
    [1.0, 224, 83, 61],
  ];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, r0, g0, b0] = stops[i - 1];
      const [t1, r1, g1, b1] = stops[i];
      const f = (t - t0) / (t1 - t0 || 1);
      return [Math.round(r0 + (r1 - r0) * f), Math.round(g0 + (g1 - g0) * f), Math.round(b0 + (b1 - b0) * f)];
    }
  }
  return [224, 83, 61];
}

/* A static stand-in for the captured cart-page screenshot. Layout is aligned
   to the heatmap coordinates: cart icon top-right, promo banner ~21%,
   checkout button ~72%. */
function Screenshot() {
  return (
    <div className="absolute inset-0 select-none text-[#1c2230]">
      <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
        <span className="text-sm font-bold">acme<span className="text-emerald-600">.</span>store</span>
        <span className="relative">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M3 4h2l2.2 11.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L20 7H6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="20" r="1.3" /><circle cx="18" cy="20" r="1.3" />
          </svg>
          <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-emerald-600 text-[9px] font-bold text-white">1</span>
        </span>
      </div>
      <div className="mx-auto max-w-md px-5 pt-4">
        <div className="text-base font-bold">Your cart</div>
        <div className="mt-3 rounded-lg bg-amber-100 px-3 py-2 text-[12px] font-medium text-amber-800">★ Save 15% this week — limited time</div>
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-stone-200 p-2.5">
          <div className="size-12 rounded bg-gradient-to-br from-stone-200 to-stone-300" />
          <div className="flex-1">
            <div className="text-[13px] font-semibold">Trailhead 22L</div>
            <div className="text-[11px] text-stone-500">Slate · Qty 1</div>
          </div>
          <div className="text-[13px] font-semibold">$89.00</div>
        </div>
        <div className="mt-3 h-9 rounded-lg border border-stone-300 bg-white" />
      </div>
    </div>
  );
}
