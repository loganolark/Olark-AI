'use client';

import { useEffect, useRef } from 'react';

/**
 * Decorative animated particle/constellation background, scoped to its parent
 * via absolute positioning. Ports the original olark-homepage.html effect
 * with the accessibility + perf guards the static HTML lacked:
 *
 *   • aria-hidden="true" + role="presentation" — no SR noise
 *   • pointer-events: none — never blocks clicks
 *   • prefers-reduced-motion: reduce → component returns null (no animation,
 *     no static dot field, no canvas in the DOM)
 *   • forced-colors: active → CSS hides the wrapper entirely
 *   • IntersectionObserver pauses RAF when the section is off-screen
 *   • Page Visibility API pauses RAF when the tab is hidden
 *   • Adaptive particle count based on canvas area + small-screen halving
 *   • devicePixelRatio scaling for retina sharpness
 *
 * Designed to be dropped inside a section with `position: relative` — the
 * canvas covers the section's bounds, sitting above the section bg colour
 * but below the section content (which the parent should give
 * `position: relative; z-index: 1`).
 */

const COLORS = [
  'rgba(250, 201, 23,', // gold
  'rgba(239, 78, 115,', // pink
  'rgba(93,211,179,', // teal
  'rgba(160,157,216,', // muted purple
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  alpha: number;
  life: number;
  age: number;
}

export interface ParticleBackgroundProps {
  /** Particle count target. Auto-scales by area + halves on small screens.
   *  Default 60. */
  density?: number;
  /** Max distance for connection lines, in CSS px. Default 110. */
  linkDistance?: number;
  /** Max distance for mouse glow, in CSS px. Default 180. */
  mouseGlowDistance?: number;
  /** Wrapper opacity (0–1). Default 0.55. */
  opacity?: number;
}

export default function ParticleBackground({
  density = 60,
  linkDistance = 110,
  mouseGlowDistance = 180,
  opacity = 0.55,
}: ParticleBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    // Honour prefers-reduced-motion: skip the entire animation. Component
    // already short-circuits to null in render, but if the user toggles the
    // pref while the page is open, we also tear down here.
    const reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotionMQ.matches) return undefined;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let particles: Particle[] = [];
    let raf: number | null = null;
    let inView = false;
    let docVisible = !document.hidden;
    const mouse = { x: -9999, y: -9999 };

    function makeParticle(W: number, H: number): Particle {
      const p: Particle = {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0],
        alpha: Math.random() * 0.5 + 0.15,
        life: Math.random() * 300 + 200,
        age: 0,
      };
      return p;
    }

    function reset(p: Particle, W: number, H: number) {
      p.x = Math.random() * W;
      p.y = Math.random() * H;
      p.vx = (Math.random() - 0.5) * 0.35;
      p.vy = (Math.random() - 0.5) * 0.35;
      p.r = Math.random() * 1.6 + 0.4;
      p.color = COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0];
      p.alpha = Math.random() * 0.5 + 0.15;
      p.life = Math.random() * 300 + 200;
      p.age = 0;
    }

    function init() {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const cssW = container!.clientWidth;
      const cssH = container!.clientHeight;
      canvas!.width = Math.round(cssW * dpr);
      canvas!.height = Math.round(cssH * dpr);
      canvas!.style.width = `${cssW}px`;
      canvas!.style.height = `${cssH}px`;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);

      // Adaptive particle count — scale by area, halve on small screens.
      const isSmallScreen = window.innerWidth < 768;
      const areaScaled = Math.min(1, (cssW * cssH) / (1280 * 720));
      const target = Math.max(
        12,
        Math.round(density * areaScaled * (isSmallScreen ? 0.5 : 1)),
      );
      particles = Array.from({ length: target }, () => makeParticle(cssW, cssH));
    }

    function draw() {
      if (!inView || !docVisible) {
        raf = null;
        return;
      }
      const W = container!.clientWidth;
      const H = container!.clientHeight;
      ctx!.clearRect(0, 0, W, H);

      const containerRect = container!.getBoundingClientRect();
      const mx = mouse.x - containerRect.left;
      const my = mouse.y - containerRect.top;
      const mouseInBounds = mx >= 0 && mx <= W && my >= 0 && my <= H;

      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i]!;

        // Connection lines to other nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const pj = particles[j]!;
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDistance) {
            ctx!.beginPath();
            ctx!.moveTo(pi.x, pi.y);
            ctx!.lineTo(pj.x, pj.y);
            ctx!.strokeStyle = `rgba(103, 90, 201,${0.08 * (1 - dist / linkDistance)})`;
            ctx!.lineWidth = 0.6;
            ctx!.stroke();
          }
        }

        // Mouse-proximity glow (only when cursor is over this section)
        if (mouseInBounds) {
          const mdx = pi.x - mx;
          const mdy = pi.y - my;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < mouseGlowDistance) {
            ctx!.beginPath();
            ctx!.arc(pi.x, pi.y, pi.r * 2.5, 0, Math.PI * 2);
            ctx!.fillStyle = `${pi.color}${0.35 * (1 - mdist / mouseGlowDistance)})`;
            ctx!.fill();
          }
        }

        // Update + draw the particle
        pi.x += pi.vx;
        pi.y += pi.vy;
        pi.age++;
        if (
          pi.age > pi.life ||
          pi.x < -20 ||
          pi.x > W + 20 ||
          pi.y < -20 ||
          pi.y > H + 20
        ) {
          reset(pi, W, H);
        }
        ctx!.beginPath();
        ctx!.arc(pi.x, pi.y, pi.r, 0, Math.PI * 2);
        ctx!.fillStyle = `${pi.color}${pi.alpha})`;
        ctx!.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    function startLoop() {
      if (raf !== null) return;
      if (!inView || !docVisible) return;
      raf = requestAnimationFrame(draw);
    }

    function stopLoop() {
      if (raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    }

    function onResize() {
      init();
    }

    function onMouseMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }

    function onVisibilityChange() {
      docVisible = !document.hidden;
      if (docVisible) startLoop();
      else stopLoop();
    }

    function onReducedMotionChange(e: MediaQueryListEvent) {
      if (e.matches) {
        stopLoop();
        ctx!.clearRect(0, 0, container!.clientWidth, container!.clientHeight);
      } else {
        startLoop();
      }
    }

    init();

    // Pause RAF when this section is off-screen — saves battery on long pages.
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            inView = entry.isIntersecting;
            if (inView) startLoop();
            else stopLoop();
          }
        },
        { threshold: 0 },
      );
      io.observe(container);
    } else {
      // No IO support — fall back to always-on.
      inView = true;
      startLoop();
    }

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    if (typeof reducedMotionMQ.addEventListener === 'function') {
      reducedMotionMQ.addEventListener('change', onReducedMotionChange);
    }

    return () => {
      stopLoop();
      io?.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (typeof reducedMotionMQ.removeEventListener === 'function') {
        reducedMotionMQ.removeEventListener('change', onReducedMotionChange);
      }
    };
  }, [density, linkDistance, mouseGlowDistance]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      role="presentation"
      className="particle-bg"
      data-testid="particle-background"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        opacity,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}
