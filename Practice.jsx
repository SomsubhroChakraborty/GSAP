import { useEffect, useRef, useState } from "react";

// GSAP loaded via CDN script tags in the HTML head
// We'll use a self-contained approach with inline script loading

const GSAP_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
const SCROLL_TRIGGER_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── Particle field ──────────────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,220,100,${p.alpha})`;
        ctx.fill();
      });
      // draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,200,80,${0.12 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function GSAPShowcase() {
  const [gsapReady, setGsapReady] = useState(false);

  // refs
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaBtnRef = useRef(null);
  const floatingBoxesRef = useRef([]);
  const morphRef = useRef(null);
  const counterRefs = useRef([]);
  const cardRefs = useRef([]);
  const horizontalRef = useRef(null);
  const hStripeRef = useRef(null);
  const magnetBtnRef = useRef(null);
  const magnetTextRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);

  // Load GSAP
  useEffect(() => {
    (async () => {
      await loadScript(GSAP_CDN);
      await loadScript(SCROLL_TRIGGER_CDN);
      window.gsap.registerPlugin(window.ScrollTrigger);
      setGsapReady(true);
    })();
  }, []);

  // All GSAP animations
  useEffect(() => {
    if (!gsapReady) return;
    const { gsap, ScrollTrigger } = window;

    // ── Custom Cursor ──
    const moveCursor = (e) => {
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.6,
        ease: "power3.out",
      });
      gsap.to(cursorDotRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
      });
    };
    window.addEventListener("mousemove", moveCursor);

    // ── Hero entrance ──
    const tl = gsap.timeline({ delay: 0.2 });
    tl.from(titleRef.current.querySelectorAll(".char"), {
      y: 120,
      opacity: 0,
      duration: 0.9,
      stagger: 0.04,
      ease: "expo.out",
    })
      .from(
        subtitleRef.current,
        { y: 30, opacity: 0, duration: 0.7, ease: "power3.out" },
        "-=0.4",
      )
      .from(
        ctaBtnRef.current,
        { y: 20, opacity: 0, scale: 0.9, duration: 0.5, ease: "back.out(2)" },
        "-=0.3",
      );

    // ── Floating boxes ──
    floatingBoxesRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, {
        y: `${Math.sin(i) * 30}px`,
        x: `${Math.cos(i) * 15}px`,
        rotation: (i % 2 === 0 ? 1 : -1) * 8,
        duration: 3 + i * 0.7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.3,
      });
    });

    // ── Counter animation ──
    counterRefs.current.forEach((el) => {
      if (!el) return;
      const end = parseInt(el.dataset.end, 10);
      gsap.from(
        { val: 0 },
        {
          val: end,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
          onUpdate: function () {
            el.textContent = Math.round(this.targets()[0].val).toLocaleString();
          },
        },
      );
    });

    // ── Cards stagger ──
    gsap.from(cardRefs.current, {
      y: 80,
      opacity: 0,
      stagger: 0.15,
      duration: 0.8,
      ease: "expo.out",
      scrollTrigger: { trigger: cardRefs.current[0], start: "top 80%" },
    });

    // ── Horizontal scroll section ──
    const panels = hStripeRef.current.querySelectorAll(".h-panel");
    gsap.to(panels, {
      xPercent: -100 * (panels.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: horizontalRef.current,
        pin: true,
        scrub: 1,
        end: () => `+=${hStripeRef.current.offsetWidth}`,
      },
    });

    // ── Morph / scale pulse ──
    gsap.to(morphRef.current, {
      scale: 1.08,
      borderRadius: "60%",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // ── Magnetic button ──
    const btn = magnetBtnRef.current;
    const onMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      gsap.to(btn, {
        x: dx * 0.3,
        y: dy * 0.3,
        duration: 0.4,
        ease: "power3.out",
      });
      gsap.to(magnetTextRef.current, {
        x: dx * 0.15,
        y: dy * 0.15,
        duration: 0.4,
      });
    };
    const onLeave = () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.5)" });
      gsap.to(magnetTextRef.current, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1,0.5)",
      });
    };
    btn.addEventListener("mousemove", onMove);
    btn.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      btn.removeEventListener("mousemove", onMove);
      btn.removeEventListener("mouseleave", onLeave);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [gsapReady]);

  // split title chars helper
  const splitChars = (text) =>
    text.split("").map((ch, i) => (
      <span
        key={i}
        className="char"
        style={{ display: "inline-block", overflow: "hidden" }}
      >
        {ch === " " ? "\u00A0" : ch}
      </span>
    ));

  const cards = [
    {
      icon: "⚡",
      title: "Timeline API",
      desc: "Chain complex sequences with precise control over every tween.",
    },
    {
      icon: "🌀",
      title: "ScrollTrigger",
      desc: "Bind animations to scroll position for immersive storytelling.",
    },
    {
      icon: "🧲",
      title: "Magnetic UI",
      desc: "Physics-based interactions that feel alive and responsive.",
    },
    {
      icon: "🎭",
      title: "Morph & Transform",
      desc: "Fluid shape-shifting between states with zero friction.",
    },
    {
      icon: "🔢",
      title: "Counter Tween",
      desc: "Animate numeric values smoothly for impactful dashboards.",
    },
    {
      icon: "🎞️",
      title: "Horizontal Scroll",
      desc: "Pinned panels that glide sideways as the user scrolls.",
    },
  ];

  const hPanels = [
    { label: "01", heading: "Entrance", color: "#1a0a2e", accent: "#ff6b35" },
    { label: "02", heading: "Morph", color: "#0a1a2e", accent: "#00d4ff" },
    { label: "03", heading: "Scrub", color: "#0a2e1a", accent: "#39ff14" },
    { label: "04", heading: "Spring", color: "#2e1a0a", accent: "#ffd700" },
  ];

  const counters = [
    { end: 60, label: "FPS" },
    { end: 99, label: "Lighthouse" },
    { end: 12000, label: "Stars on GitHub" },
    { end: 7, label: "KB Gzipped" },
  ];

  return (
    <>
      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #08070f; color: #f0ead6; font-family: 'DM Sans', sans-serif; cursor: none; overflow-x: hidden; }

        .cursor-ring {
          position: fixed; top: -20px; left: -20px;
          width: 40px; height: 40px;
          border: 1.5px solid rgba(255,210,80,0.6);
          border-radius: 50%; pointer-events: none; z-index: 9999;
          mix-blend-mode: difference;
        }
        .cursor-dot {
          position: fixed; top: -4px; left: -4px;
          width: 8px; height: 8px;
          background: #ffd250; border-radius: 50%;
          pointer-events: none; z-index: 9999;
        }

        section { position: relative; }

        /* Hero */
        .hero {
          min-height: 100vh; display: flex; flex-direction: column;
          justify-content: center; align-items: flex-start;
          padding: 0 8vw; overflow: hidden; background: #08070f;
        }
        .hero-eyebrow {
          font-size: 0.75rem; letter-spacing: 0.3em; text-transform: uppercase;
          color: #ffd250; margin-bottom: 1.5rem; opacity: 0.85;
        }
        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(5rem, 14vw, 13rem);
          line-height: 0.9; color: #f0ead6; overflow: hidden;
        }
        .hero-title .line { overflow: hidden; }
        .hero-subtitle {
          font-size: clamp(1rem, 2vw, 1.3rem); font-weight: 300;
          color: rgba(240,234,214,0.55); max-width: 480px;
          margin-top: 2rem; line-height: 1.7;
        }
        .cta-btn {
          margin-top: 3rem; padding: 1rem 2.5rem;
          background: #ffd250; color: #08070f;
          font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem;
          letter-spacing: 0.12em; border: none; border-radius: 3px;
          cursor: none; display: inline-block;
          transition: background 0.2s;
        }
        .cta-btn:hover { background: #ffe480; }

        /* Floating deco boxes */
        .float-box {
          position: absolute; border: 1px solid;
          pointer-events: none; opacity: 0.18;
        }

        /* Counters */
        .counters-section {
          padding: 10vh 8vw; background: #0d0b1a;
          display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 3rem;
        }
        .counter-item { text-align: center; }
        .counter-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.5rem, 7vw, 6rem);
          color: #ffd250; display: block;
        }
        .counter-label {
          font-size: 0.8rem; letter-spacing: 0.25em; text-transform: uppercase;
          color: rgba(240,234,214,0.4); margin-top: 0.3rem;
        }

        /* Cards */
        .cards-section {
          padding: 12vh 8vw;
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem; background: #08070f;
        }
        .card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 2.5rem;
          transition: border-color 0.3s, transform 0.3s;
        }
        .card:hover { border-color: rgba(255,210,80,0.4); transform: translateY(-4px); }
        .card-icon { font-size: 2.2rem; margin-bottom: 1.2rem; }
        .card-title {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem;
          letter-spacing: 0.06em; color: #f0ead6; margin-bottom: 0.7rem;
        }
        .card-desc { font-size: 0.9rem; color: rgba(240,234,214,0.5); line-height: 1.7; }

        /* Morph blob */
        .morph-section {
          padding: 12vh 8vw; display: flex;
          align-items: center; justify-content: center; gap: 6vw;
          background: #0a0918; flex-wrap: wrap;
        }
        .morph-blob {
          width: 280px; height: 280px;
          background: conic-gradient(from 220deg, #ffd250, #ff6b35, #c42bff, #00d4ff, #ffd250);
          border-radius: 40%; flex-shrink: 0;
        }
        .morph-copy { max-width: 400px; }
        .morph-copy h2 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.5rem, 5vw, 4.5rem); line-height: 1;
          color: #f0ead6; margin-bottom: 1.2rem;
        }
        .morph-copy p { color: rgba(240,234,214,0.5); line-height: 1.8; font-size: 1rem; }

        /* Horizontal scroll */
        .horizontal-outer { overflow: hidden; background: #08070f; }
        .h-stripe { display: flex; width: max-content; }
        .h-panel {
          width: 100vw; height: 100vh;
          display: flex; flex-direction: column;
          justify-content: center; padding: 0 10vw;
          flex-shrink: 0;
        }
        .h-panel-num {
          font-size: 8rem; font-family: 'Bebas Neue', sans-serif;
          opacity: 0.08; line-height: 1; margin-bottom: -1.5rem;
        }
        .h-panel-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(4rem, 10vw, 9rem);
          line-height: 0.9;
        }
        .h-panel-sub {
          font-size: 1rem; color: rgba(240,234,214,0.4);
          margin-top: 1.5rem; max-width: 380px; line-height: 1.7;
        }

        /* Magnetic */
        .magnetic-section {
          padding: 15vh 8vw; display: flex;
          flex-direction: column; align-items: center;
          justify-content: center; gap: 1.5rem;
          background: #0d0b1a; text-align: center;
        }
        .magnetic-label {
          font-size: 0.75rem; letter-spacing: 0.3em;
          text-transform: uppercase; color: rgba(240,234,214,0.35);
        }
        .mag-btn {
          padding: 1.4rem 3.5rem;
          border: 1.5px solid rgba(255,210,80,0.6);
          border-radius: 100px; background: transparent;
          cursor: none; font-family: 'Bebas Neue', sans-serif;
          font-size: 1.3rem; letter-spacing: 0.15em;
          color: #f0ead6; position: relative;
          transition: background 0.3s, color 0.3s;
        }
        .mag-btn:hover { background: #ffd250; color: #08070f; border-color: #ffd250; }

        /* Footer */
        .footer {
          padding: 4vh 8vw; border-top: 1px solid rgba(255,255,255,0.06);
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.8rem; color: rgba(240,234,214,0.25);
          background: #08070f; flex-wrap: wrap; gap: 1rem;
        }
        .footer-brand { font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; color: #ffd250; }
      `}</style>

      {/* ── Custom cursor ── */}
      <div ref={cursorRef} className="cursor-ring" />
      <div ref={cursorDotRef} className="cursor-dot" />

      {/* ══════════ HERO ══════════ */}
      <section className="hero" ref={heroRef}>
        <ParticleField />

        {/* deco boxes */}
        {[
          {
            w: 120,
            h: 120,
            top: "12%",
            right: "8%",
            color: "#ffd250",
            rot: 20,
          },
          {
            w: 60,
            h: 60,
            top: "60%",
            right: "18%",
            color: "#ff6b35",
            rot: -15,
          },
          {
            w: 200,
            h: 200,
            top: "25%",
            right: "28%",
            color: "#c42bff",
            rot: 35,
          },
          {
            w: 80,
            h: 80,
            bottom: "20%",
            left: "5%",
            color: "#00d4ff",
            rot: 10,
          },
        ].map((b, i) => (
          <div
            key={i}
            ref={(el) => (floatingBoxesRef.current[i] = el)}
            className="float-box"
            style={{
              width: b.w,
              height: b.h,
              top: b.top,
              right: b.right,
              bottom: b.bottom,
              left: b.left,
              borderColor: b.color,
              transform: `rotate(${b.rot}deg)`,
            }}
          />
        ))}

        <div style={{ position: "relative", zIndex: 1 }}>
          <p className="hero-eyebrow">GSAP × React — Animation Showcase</p>
          <h1 className="hero-title" ref={titleRef}>
            <div className="line">{splitChars("MOTION")}</div>
            <div className="line" style={{ color: "#ffd250" }}>
              {splitChars("CRAFT")}
            </div>
          </h1>
          <p className="hero-subtitle" ref={subtitleRef}>
            Buttery-smooth animations powered by GreenSock's industry-standard
            engine. Scroll to explore every technique.
          </p>
          <button ref={ctaBtnRef} className="cta-btn">
            Explore Animations ↓
          </button>
        </div>
      </section>

      {/* ══════════ COUNTERS ══════════ */}
      <section className="counters-section">
        {counters.map(({ end, label }, i) => (
          <div key={i} className="counter-item">
            <span
              className="counter-num"
              ref={(el) => (counterRefs.current[i] = el)}
              data-end={end}
            >
              0
            </span>
            <span className="counter-label">{label}</span>
          </div>
        ))}
      </section>

      {/* ══════════ FEATURE CARDS ══════════ */}
      <section className="cards-section">
        {cards.map((c, i) => (
          <div
            key={i}
            ref={(el) => (cardRefs.current[i] = el)}
            className="card"
          >
            <div className="card-icon">{c.icon}</div>
            <div className="card-title">{c.title}</div>
            <div className="card-desc">{c.desc}</div>
          </div>
        ))}
      </section>

      {/* ══════════ MORPH BLOB ══════════ */}
      <section className="morph-section">
        <div ref={morphRef} className="morph-blob" />
        <div className="morph-copy">
          <h2>Shape-shift anything.</h2>
          <p>
            GSAP's tween engine handles border-radius, gradients, transforms,
            and SVG path interpolation with sub-millisecond precision — keeping
            every frame buttery at 60 fps.
          </p>
        </div>
      </section>

      {/* ══════════ HORIZONTAL SCROLL ══════════ */}
      <div className="horizontal-outer" ref={horizontalRef}>
        <div ref={hStripeRef} className="h-stripe">
          {hPanels.map((p, i) => (
            <div key={i} className="h-panel" style={{ background: p.color }}>
              <div className="h-panel-num" style={{ color: p.accent }}>
                {p.label}
              </div>
              <div className="h-panel-heading" style={{ color: p.accent }}>
                {p.heading}
              </div>
              <div className="h-panel-sub">
                ScrollTrigger pins this container and scrubs the horizontal
                stripe as you scroll — pure CSS transforms, zero scroll jank.
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ MAGNETIC BUTTON ══════════ */}
      <section className="magnetic-section">
        <p className="magnetic-label">Hover near the button</p>
        <button ref={magnetBtnRef} className="mag-btn">
          <span ref={magnetTextRef}>Magnetic Interaction</span>
        </button>
        <p
          style={{
            color: "rgba(240,234,214,0.3)",
            fontSize: "0.85rem",
            maxWidth: 360,
          }}
        >
          Move your cursor close to feel the pull. Spring physics make UI
          elements feel truly alive.
        </p>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="footer">
        <span className="footer-brand">MOTION CRAFT</span>
        <span>Built with GSAP 3 + React · ScrollTrigger · Custom Cursor</span>
      </footer>
    </>
  );
}
