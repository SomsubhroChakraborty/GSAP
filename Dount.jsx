import React, { useRef } from "react";
import dount from "../assets/dount.png";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function Dount() {
  const containerRef = useRef(null);
  const donutRef = useRef(null);
  const amberBoxRef = useRef(null);
  const thirdCardRef = useRef(null); // ← ref for the 3rd card image slot

  useGSAP(
    () => {
      const donut = donutRef.current;
      const amberBox = amberBoxRef.current;
      const thirdCard = thirdCardRef.current;
      if (!donut || !amberBox || !thirdCard) return;

      const donutRect = donut.getBoundingClientRect();
      const amberRect = amberBox.getBoundingClientRect();
      const cardRect = thirdCard.getBoundingClientRect();

      // Phase 1: donut → amberBox (section 1 → section 2)
      const deltaX1 =
        amberRect.left +
        amberRect.width / 2 -
        (donutRect.left + donutRect.width / 2);
      const deltaY1 =
        amberRect.top +
        amberRect.height / 2 -
        (donutRect.top + donutRect.height / 2);

      // Phase 2: donut → 3rd card (section 2 → section 3)
      const deltaX2 =
        cardRect.left +
        cardRect.width / 2 -
        (donutRect.left + donutRect.width / 2);
      const deltaY2 =
        cardRect.top +
        cardRect.height / 2 -
        (donutRect.top + donutRect.height / 2);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
          markers: false,
        },
      });

      tl.to(donut, {
        x: deltaX1,
        y: deltaY1,
        rotation: 360,
        width: amberRect.width * 0.95,
        height: amberRect.height * 0.95,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: "#section2",
          start: "top 90%",
          end: "top 10%",
          scrub: 1.5,
        },
      });

      // Phase 2: flies from amberBox area into the 3rd card
      gsap.to(donut, {
        x: deltaX2,
        y: deltaY2,
        rotation: 720,
        width: cardRect.width,
        height: cardRect.height * 0.95,
        borderRadius: "1rem",
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: "#section3",
          start: "top 80%",
          end: "top 10%",
          scrub: 1.5,
        },
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="bg-pink-300 w-full">
      {/* Section 1 */}
      <section className="relative h-screen">
        <div className="flex justify-center items-center h-full gap-10">
          <div className="text-white flex text-[10rem] uppercase tracking-widest select-none">
            <h1>Dou</h1>
            <h1 className="z-50">nts</h1>
          </div>
          <div
            ref={donutRef}
            style={{ backgroundImage: `url(${dount})` }}
            className="w-80 h-80 bg-center bg-cover bg-no-repeat absolute z-10"
          />
        </div>
      </section>

      {/* Section 2 */}
      <section id="section2" className="h-screen relative">
        <div className="h-full flex items-center justify-center px-10">
          <div className="w-1/2 flex justify-center items-center">
            {/* Invisible anchor — donut flies here first */}
            <div ref={amberBoxRef} className="w-72 h-72 rounded-2xl" />
          </div>
          <div className="w-1/2 space-y-4">
            <h2 className="text-4xl font-bold">
              Where Every bite worth <br />
              <span className="text-amber-300"> calories</span>
            </h2>
            <p className="text-gray-700">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit quod
              dignissimos deserunt aliquid provident ab, vel possimus eum,
              consequatur rerum totam exercitationem.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section
        id="section3"
        className="min-h-screen flex items-center justify-center px-10 py-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl w-full">
          {/* Card 1 */}
          <div className="rounded-2xl shadow-lg overflow-hidden bg-pink-100">
            <div
              style={{ backgroundImage: `url(${dount})` }}
              className="h-60 bg-canvas bg-center"
            />
            <div className="p-6 space-y-3">
              <h3 className="text-2xl font-bold">Vanilla Donut</h3>
              <p className="text-gray-600">
                Soft, fluffy and perfectly glazed for your everyday sweet
                cravings.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl shadow-lg overflow-hidden bg-pink-100">
            <div
              style={{ backgroundImage: `url(${dount})` }}
              className="h-60 bg-canvas bg-center"
            />
            <div className="p-6 space-y-3">
              <h3 className="text-2xl font-bold">Chocolate Dream</h3>
              <p className="text-gray-600">
                Rich chocolate flavor crafted to melt instantly in every bite.
              </p>
            </div>
          </div>

          {/* Card 3 — donut lands here as the image */}
          <div className="rounded-2xl shadow-lg overflow-hidden bg-pink-100 flex flex-col">
            {/* This invisible div is the landing target */}
            <div
              ref={thirdCardRef}
              className="h-60 w-full relative bg-canvas"
            />
            <div className="p-6 space-y-3">
              <h3 className="text-2xl font-bold">Chocolate Vanilla Donut</h3>
              <p className="text-gray-600">
                Rich chocolate flavor crafted to melt instantly in every bite.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dount;
