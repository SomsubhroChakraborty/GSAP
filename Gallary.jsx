import React, { useEffect, useRef } from "react";
import { animate, scroll } from "motion";

export default function Gallery() {
  const containerRef = useRef(null);
  const groupRef = useRef(null);
  const progressRef = useRef(null);

  const slides = [
    {
      src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
      label: "Modern Villa",
      location: "Beverly Hills, CA",
    },
    {
      src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80",
      label: "Sky Penthouse",
      location: "Manhattan, NY",
    },
    {
      src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80",
      label: "Coastal Retreat",
      location: "Malibu, CA",
    },
    {
      src: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80",
      label: "Garden Estate",
      location: "Greenwich, CT",
    },
    {
      src: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80",
      label: "Desert Oasis",
      location: "Scottsdale, AZ",
    },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const items = groupRef.current.querySelectorAll(".img-container");

    scroll(
      animate(groupRef.current, {
        transform: ["none", `translateX(-${(items.length - 1) * 100}vw)`],
      }),
      { target: containerRef.current },
    );

    scroll(animate(progressRef.current, { scaleX: [0, 1] }), {
      target: containerRef.current,
    });
  }, []);

  return (
    <div className="w-full">
      {/* HEADER */}
      <header className="h-[50vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-5xl md:text-6xl font-light tracking-tight text-neutral-900 leading-none">
          Our Projects
        </h2>
        <div className="w-12 h-px bg-neutral-300 mt-2" />
      </header>

      {/* SCROLL SECTION */}
      <section ref={containerRef} className="relative h-[500vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <ul ref={groupRef} className="flex m-0 p-0 list-none">
            {slides.map((slide, index) => (
              <li
                key={index}
                className="img-container flex-shrink-0 relative"
                style={{ width: "100vw", height: "100vh" }}
              >
                {/* Full-screen image */}
                <img
                  src={slide.src}
                  alt={slide.label}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "brightness(0.72)",
                  }}
                />

                {/* Gradient overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.1) 100%)",
                  }}
                />

                {/* Counter — top left */}
                <div
                  style={{
                    position: "absolute",
                    top: "2.5rem",
                    left: "3rem",
                    zIndex: 10,
                  }}
                >
                  <span
                    className="font-sans uppercase"
                    style={{
                      fontSize: "0.6rem",
                      letterSpacing: "0.3em",
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")} &nbsp;/&nbsp;{" "}
                    {String(slides.length).padStart(2, "0")}
                  </span>
                </div>

                {/* Text — bottom left */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "4rem",
                    left: "3rem",
                    zIndex: 10,
                  }}
                >
                  <p
                    className="font-sans uppercase"
                    style={{
                      fontSize: "0.6rem",
                      letterSpacing: "0.25em",
                      color: "rgba(255,255,255,0.45)",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {slide.location}
                  </p>
                  <h3
                    className="font-serif font-light text-white"
                    style={{
                      fontSize: "clamp(2.5rem, 6vw, 5rem)",
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                      marginBottom: "1.25rem",
                    }}
                  >
                    {slide.label}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: "2rem",
                        height: "1px",
                        backgroundColor: "rgba(255,255,255,0.35)",
                      }}
                    />
                    <span
                      className="font-sans uppercase"
                      style={{
                        fontSize: "0.6rem",
                        letterSpacing: "0.2em",
                        color: "rgba(255,255,255,0.35)",
                      }}
                    >
                      View Property
                    </span>
                  </div>
                </div>

                {/* Ghost number — bottom right */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "1rem",
                    right: "2rem",
                    zIndex: 10,
                  }}
                >
                  <span
                    className="font-serif font-light select-none"
                    style={{
                      fontSize: "clamp(5rem, 14vw, 11rem)",
                      lineHeight: 1,
                      color: "rgba(255,255,255,0.06)",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PROGRESS BAR */}
      <div
        ref={progressRef}
        className="fixed left-0 right-0 bottom-0 origin-left z-50"
        style={{
          height: "2px",
          backgroundColor: "#1a1a1a",
          transform: "scaleX(0)",
        }}
      />
    </div>
  );
}
