import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MotionPathPlugin, DrawSVGPlugin } from "gsap/all";
import BlurText from "./BlurText";
import Gallary from "./Gallary";

// ── MosaicImage Component ──
function MosaicImage() {
  const COLS = 6,
    ROWS = 7;
  const [visibleTiles, setVisibleTiles] = useState(new Set());
  const sectionRef = useRef(null);
  const triggered = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          const total = COLS * ROWS;
          const indices = [...Array(total).keys()].sort(
            () => Math.random() - 0.5,
          );
          indices.forEach((idx, i) => {
            setTimeout(
              () => {
                setVisibleTiles((prev) => new Set([...prev, idx]));
              },
              60 + i * 38,
            );
          });
        }
      },
      { threshold: 0.3 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="w-full h-full overflow-hidden rounded-sm"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        gap: "3px",
      }}
    >
      {Array.from({ length: COLS * ROWS }, (_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        return (
          <div
            key={i}
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=960&q=80')`,
              backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
              backgroundPosition: `${(col / (COLS - 1)) * 100}% ${
                (row / (ROWS - 1)) * 100
              }%`,
              backgroundRepeat: "no-repeat",
              opacity: visibleTiles.has(i) ? 1 : 0,
              transform: visibleTiles.has(i) ? "scale(1)" : "scale(1.08)",
              transition: "opacity 0.55s ease, transform 0.55s ease",
            }}
          />
        );
      })}
    </div>
  );
}

// ── Home Component ──
function Home() {
  const svgRef = useRef(null);
  const floatingRef = useRef(null);

  const handleAnimationComplete = () => {
    console.log("Animation completed!");
  };

  useEffect(() => {
    gsap.registerPlugin(MotionPathPlugin, DrawSVGPlugin);

    function splitPaths(paths) {
      let toSplit = gsap.utils.toArray(paths),
        newPaths = [];
      if (toSplit.length > 1) {
        toSplit.forEach((path) => newPaths.push(...splitPaths(path)));
      } else {
        let path = toSplit[0],
          rawPath = MotionPathPlugin.getRawPath(path),
          parent = path.parentNode,
          attributes = [].slice.call(path.attributes);
        newPaths = rawPath.map((segment) => {
          let newPath = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path",
          );
          let i = attributes.length;
          while (i--)
            newPath.setAttributeNS(
              null,
              attributes[i].nodeName,
              attributes[i].nodeValue,
            );
          newPath.setAttributeNS(
            null,
            "d",
            "M" +
              segment[0] +
              "," +
              segment[1] +
              "C" +
              segment.slice(2).join(",") +
              (segment.closed ? "z" : ""),
          );
          parent.insertBefore(newPath, path);
          return newPath;
        });
        parent.removeChild(path);
      }
      return newPaths;
    }

    function initAnimations() {
      if (!svgRef.current) return;
      const housePath = svgRef.current.querySelector("#house");
      if (!housePath) return;

      let paths = splitPaths(housePath);
      let duration = 5,
        distance = 0;
      let tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
      paths.forEach((s) => (distance += s.getTotalLength()));
      paths.forEach((s) => {
        tl.from(s, {
          drawSVG: 0,
          ease: "power1.inOut",
          duration: duration * (s.getTotalLength() / distance),
        });
      });
    }

    const raf = requestAnimationFrame(() => {
      initAnimations();
    });

    if (floatingRef.current) {
      gsap.to(floatingRef.current, {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 font-serif text-neutral-900">
      {/* Google Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&display=swap"
        rel="stylesheet"
      />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-12 py-5 bg-neutral-50/90 backdrop-blur-md border-b border-neutral-200">
        <span className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-neutral-900">
          HOMELAND
        </span>
      </nav>

      <section className="relative h-screen flex justify-center items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80"
          alt="Luxury property"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "grayscale(15%) brightness(0.55)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70" />
        <div className="relative z-10 text-center space-y-6 px-6">
          <BlurText
            text="Home Land"
            delay={200}
            animateBy="words"
            direction="top"
            onAnimationComplete={handleAnimationComplete}
            className="font-light text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white leading-[1.05] justify-center items-center font-serif"
          />
          <p className="text-lg md:text-xl text-white/65 max-w-2xl mx-auto font-sans font-light tracking-wide">
            Discover modern living spaces designed with elegance, comfort, and
            timeless architecture.
          </p>
        </div>
      </section>

      {/* ── SECTION 2 — Gallery ── */}
      <section className="w-full h-auto px-6 md:px-12">
        <Gallary />
      </section>

      {/* ── DIVIDER ── */}
      <div className="h-px bg-neutral-200 mx-12 my-16" />
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* TOP HEADING */}
          <span className="md:text-5xl flex justify-center text-right font-light tracking-tight text-neutral-900 leading-none mb-20">
            Why Choose Us
          </span>
          <div className="w-12 h-px bg-neutral-300 mt-2" />
          <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-24">
            {/* LEFT — Mosaic Image */}
            <div className="relative flex-shrink-0 w-full lg:w-[460px] h-[520px]">
              <MosaicImage />

              {/* Floating badge */}
              <div className="absolute -bottom-5 -right-5 bg-neutral-900 text-white px-7 py-5 shadow-xl z-10">
                <span className="block text-4xl font-light leading-none tracking-tight mb-1 font-serif">
                  15+
                </span>
                <span className="font-sans text-[0.62rem] tracking-[0.18em] uppercase text-neutral-400 leading-relaxed">
                  Years of
                  <br />
                  Excellence
                </span>
              </div>

              {/* Decorative border accent */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border border-neutral-200 z-0 pointer-events-none" />
            </div>

            {/* RIGHT — Text */}
            <div className="flex-1 flex flex-col">
              <h2 className="text-5xl lg:text-6xl font-light text-neutral-900 leading-[1.1] tracking-tight mb-7 font-serif">
                More than a home —{" "}
                <span className="italic text-neutral-500">a legacy</span>
                <br />
                crafted for you.
              </h2>

              <p className="font-sans text-xl font-light leading-loose text-neutral-500 max-w-md mb-12">
                We don't just sell properties. We connect people with spaces
                that resonate, inspire, and endure — curated by a team that
                understands both architecture and the art of living.
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="h-px bg-neutral-200 mx-12 my-16" />

      {/* ── SECTION 3 — Hero with SVG ── */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left — text */}
          <div className="w-full lg:w-1/2 space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 bg-neutral-900 text-white rounded-full text-xs font-sans font-medium tracking-widest uppercase">
                ✨ Premium Real Estate
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-neutral-900 leading-tight tracking-tight">
                The House
                <br />
                <span className="text-6xl text-neutral-600 font-light">
                  You Need
                </span>
              </h1>
            </div>

            <p className="text-lg md:text-xl text-neutral-500 leading-relaxed max-w-xl font-sans font-light">
              Discover your dream home with modern architecture, luxurious
              amenities, and sustainable living spaces designed for your
              lifestyle.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="group relative px-8 py-4 bg-neutral-900 text-white font-sans text-xs font-medium tracking-widest uppercase rounded-none shadow-md overflow-hidden transition-all duration-300 hover:bg-neutral-700 hover:shadow-lg hover:-translate-y-1">
                Explore Properties
              </button>
              <button className="group px-8 py-4 bg-transparent font-sans text-xs font-medium tracking-widest uppercase rounded-none border border-neutral-300 text-neutral-700 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-50 hover:-translate-y-1">
                Contact Us
              </button>
            </div>

            <div className="flex gap-8 pt-8 border-t border-neutral-200">
              {[
                ["500+", "Properties"],
                ["1000+", "Happy Clients"],
                ["50+", "Locations"],
              ].map(([num, label]) => (
                <div key={label} className="group">
                  <div className="text-3xl font-light text-neutral-800 transition-all duration-300 group-hover:scale-110 tracking-tight">
                    {num}
                  </div>
                  <div className="font-sans text-xs text-neutral-400 tracking-widest uppercase mt-1">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — SVG with floating + draw animation */}
          <div
            ref={floatingRef}
            className="w-full lg:w-1/2 flex items-center justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-neutral-100/60 blur-3xl rounded-full animate-pulse" />
              <div className="relative bg-white shadow-2xl rounded-3xl border border-neutral-100 p-8 md:p-12 transition-all duration-500 hover:scale-[1.02]">
                <svg
                  ref={svgRef}
                  width="500"
                  height="380"
                  viewBox="30 0 221 167"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto drop-shadow-md"
                >
                  <path
                    id="house"
                    d="M61.0478 144.196V165.498C61.0478 165.498 85.042 166.284 94.0655 165.859C103.091 165.435 125.685 165.259 133.89 165.498C140.208 165.681 146.894 165.683 151.473 165.598C153.401 165.561 154.94 163.996 154.94 162.071V125.831C154.94 124.209 156.257 122.895 157.884 122.895H174.657C176.258 122.895 177.554 124.189 177.554 125.787V162.042C177.554 163.949 178.363 165.101 181.014 165.496C182.785 165.671 219.681 165.659 219.681 165.659M70.6818 102.437H199.213V156.28M66.8866 84.3983V48.0715M193.372 48.367V102.439M121.775 120.183H90.9849C84.9154 120.183 86.7854 140.902 87.0651 143.463C87.3428 146.026 116.088 143.95 120.563 144.531C123.901 144.965 121.775 120.181 121.775 120.181M122.041 63.8285H91.2503C83.5374 63.8285 87.157 84.5369 87.3305 87.1084C88.9086 89.8143 119.73 89.309 120.828 88.1761C123.168 85.7615 122.041 67.2456 122.041 67.2456M173.99 63.8285H143.199C137.13 63.8285 139 84.5471 139.279 87.1084C139.559 89.6717 168.302 87.5953 172.777 88.1761C176.115 88.6101 173.99 67.2456 173.99 67.2456M112.343 18.8418H73.3991L59.5861 48.0715C59.5861 48.0715 93.1101 47.1057 122.706 48.0715C140.982 48.6686 200.674 48.0715 200.674 48.0715L186.861 18.8418H153.25M160.366 143.728C160.914 143.151 161.755 143.053 162.349 143.618C162.945 144.182 162.986 145.107 162.437 145.684C161.889 146.261 160.961 146.269 160.364 145.706C159.768 145.142 159.817 144.305 160.364 143.728H160.366Z"
                    stroke="#2C2C2C"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                  />
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                </svg>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-neutral-200/40 blur-xl animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-neutral-300/20 rounded-full blur-xl animate-pulse delay-700" />
            </div>
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="h-px bg-neutral-200 mx-12 my-16" />

      {/* ── TAGLINE / CTA ── */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-16 px-12 py-24 bg-neutral-900 mx-6 md:mx-12 mb-6 mt-16">
        <div className="flex-1">
          <h2 className="text-4xl lg:text-5xl font-light text-white leading-snug tracking-tight max-w-md">
            The house you need, exactly where you want it.
          </h2>
        </div>
        <div className="flex-1 flex flex-col gap-6 max-w-md">
          <p className="font-sans text-base leading-loose text-neutral-500 font-light">
            We connect discerning buyers with exceptional homes — spanning 50+
            cities, with a portfolio of 500+ premium properties and over a
            thousand satisfied clients.
          </p>
          <button className="self-start font-sans text-[0.7rem] tracking-[0.15em] uppercase px-9 py-4 bg-white text-neutral-900 hover:opacity-80 transition-opacity duration-200 cursor-pointer border-0">
            Start Your Search
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="flex justify-between items-center px-12 py-8 border-t border-neutral-200 bg-neutral-50">
        <span className="font-sans text-[0.65rem] tracking-[0.15em] uppercase text-neutral-400">
          HOMELAND
        </span>
        <span className="font-sans text-xs text-neutral-300">
          © 2025 Homeland Real Estate
        </span>
      </footer>
    </div>
  );
}

export default Home;
