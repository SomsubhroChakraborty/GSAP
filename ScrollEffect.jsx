import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────
   Section content
───────────────────────────────────────── */
const SECTIONS = [
  {
    eyebrow: "Crafted Since 1897",
    title: "The Art of",
    titleEm: "Patience",
    body: "Aged in hand-selected oak barrels for a minimum of twelve years. Every drop carries the weight of time.",
    align: "left",
  },
  {
    eyebrow: "Origin · Scottish Highlands",
    title: "Born from",
    titleEm: "Peat & Rain",
    body: "Highland spring water, ancient peat smoke, and the cold Atlantic wind. A terroir unlike any other on earth.",
    align: "right",
  },
  {
    eyebrow: "Master Distiller",
    title: "Three Generations,",
    titleEm: "One Vision",
    body: "The Henderson family has kept the same recipe since the distillery was founded. Not a single note changed.",
    align: "left",
  },
  {
    eyebrow: "The Finish",
    title: "Notes of",
    titleEm: "Dark Amber",
    body: "Dried fruit, dark chocolate, a whisper of sea salt. A finish that lingers like a memory you never want to forget.",
    align: "right",
  },
  {
    eyebrow: "Limited Release",
    title: "Only",
    titleEm: "1,200 Casks",
    body: "Each bottle numbered. Each barrel unique. When it's gone, it's gone — until the next twelve years pass.",
    align: "left",
    cta: true,
  },
];

/* ─────────────────────────────────────────
   Camera stages
───────────────────────────────────────── */
const STAGES = [
  {
    // name: "SIDE VIEW",
    pct: [0.0, 0.22],
    cam: () => new THREE.Vector3(0, 0.5, 11),
  },
  {
    // name: "CHASE CAM",
    pct: [0.22, 0.4],
    cam: (p, d) =>
      new THREE.Vector3(p.x - d.x * 5, p.y - d.y * 3 + 1.2, p.z - d.z * 5),
  },
  {
    // name: "CINEMATIC LOW",
    pct: [0.4, 0.56],
    cam: (p, d) =>
      new THREE.Vector3(p.x - d.x * 4 - 5, p.y - 2.2, p.z - d.z * 3),
  },
  {
    // name: "TOP DOWN",
    pct: [0.56, 0.7],
    cam: (p) => new THREE.Vector3(p.x, p.y + 12, p.z + 1),
  },
  {
    // name: "FRONT FACING",
    pct: [0.7, 0.84],
    cam: (p, d) => new THREE.Vector3(p.x - d.x * 8, p.y + 0.5, p.z - d.z * 8),
  },
  {
    // name: "ORBIT",
    pct: [0.84, 1.0],
    cam: (p, _d, orb) =>
      new THREE.Vector3(
        p.x + Math.cos(orb) * 9,
        p.y + 2.5,
        p.z + Math.sin(orb) * 9,
      ),
  },
];

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function eio(x) {
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
}

function getSI(p) {
  for (let i = 0; i < STAGES.length; i++) {
    if (p >= STAGES[i].pct[0] && p < STAGES[i].pct[1]) return i;
  }
  return STAGES.length - 1;
}

/* ─────────────────────────────────────────
   Section card component
───────────────────────────────────────── */
function SectionCard({ sec, visible, idx }) {
  const isVisible = visible[idx];

  return (
    <div
      className={`
        max-w-sm transition-all duration-1000 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
      `}
    >
      {/* Eyebrow */}
      <p className="text-[11px] tracking-[0.35em] uppercase font-mono text-amber-400 mb-3 opacity-90">
        {sec.eyebrow}
      </p>

      {/* Title */}
      <h2 className="font-serif text-4xl font-bold leading-tight text-stone-100 mb-1">
        {sec.title}
      </h2>
      <h2 className="font-serif text-4xl font-bold leading-tight text-amber-400 italic mb-4">
        {sec.titleEm}
      </h2>

      {/* Divider */}
      <div className="w-10 h-px bg-amber-500 opacity-50 mb-4" />

      {/* Body */}
      <p className="text-base italic leading-relaxed text-stone-400">
        {sec.body}
      </p>

      {/* CTA */}
      {sec.cta && (
        <button className="mt-7 px-8 py-3 bg-amber-500 text-stone-900 text-xs tracking-[0.3em] uppercase font-mono font-bold hover:bg-amber-400 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
          Reserve Your Bottle
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
export default function BottleScrollDemo() {
  const canvasRef = useRef(null);
  const secRefs = useRef([]);

  const [prog, setProgress] = useState(0);
  const [camName, setCamName] = useState();
  const [stageIdx, setStageIdx] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [visible, setVisible] = useState(() =>
    Array(SECTIONS.length).fill(false),
  );

  /* ── Section reveal via IntersectionObserver ── */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const i = Number(e.target.dataset.idx);
          setVisible((v) => {
            const n = [...v];
            n[i] = e.isIntersecting;
            return n;
          });
        }),
      { threshold: 0.3 },
    );
    secRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* ── Three.js ── */
  useEffect(() => {
    const canvas = canvasRef.current;

    /* Renderer */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    /* Scene */
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080808, 0.013);
    scene.background = new THREE.Color(0x080808);

    /* Camera */
    const camera = new THREE.PerspectiveCamera(
      50,
      innerWidth / innerHeight,
      0.1,
      400,
    );
    camera.position.set(0, 0.5, 11);

    /* Lights */
    scene.add(new THREE.AmbientLight(0x221a10, 1.1));

    const key = new THREE.DirectionalLight(0xfff4d0, 2.2);
    key.position.set(6, 12, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, {
      left: -22,
      right: 22,
      top: 16,
      bottom: -16,
      near: 0.5,
      far: 100,
    });
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x3355aa, 0.45);
    fill.position.set(-8, 2, -6);
    scene.add(fill);

    const back = new THREE.DirectionalLight(0xc9a84c, 0.9);
    back.position.set(0, -4, -10);
    scene.add(back);

    const goldGlow = new THREE.PointLight(0xc9a84c, 2.0, 16);
    scene.add(goldGlow);

    /* ── Bottle ── */
    const bottle = new THREE.Group();

    const glassMat = new THREE.MeshPhongMaterial({
      color: 0x1a0d00,
      emissive: 0x0a0500,
      shininess: 300,
      transparent: true,
      opacity: 0.86,
      side: THREE.DoubleSide,
      specular: new THREE.Color(0xffffff),
    });
    const capMat = new THREE.MeshPhongMaterial({
      color: 0x181818,
      emissive: 0x040404,
      shininess: 160,
      specular: new THREE.Color(0x888888),
    });
    const waxMat = new THREE.MeshPhongMaterial({
      color: 0x8b1a1a,
      emissive: 0x200000,
      shininess: 35,
    });
    const labelMat = new THREE.MeshPhongMaterial({
      color: 0xd4b87a,
      emissive: 0x1a0e00,
      shininess: 18,
    });
    const liquidMat = new THREE.MeshPhongMaterial({
      color: 0x7a3800,
      emissive: 0x180800,
      shininess: 80,
      transparent: true,
      opacity: 0.8,
    });
    const sheenMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
      shininess: 400,
      specular: new THREE.Color(0xffffff),
    });

    function bp(geo, mat, y = 0, rx = 0) {
      const m = new THREE.Mesh(geo, mat);
      m.position.y = y;
      m.rotation.x = rx;
      m.castShadow = true;
      bottle.add(m);
    }

    bp(
      new THREE.SphereGeometry(0.42, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      glassMat,
      -0.93,
      Math.PI,
    );
    bp(new THREE.CylinderGeometry(0.42, 0.42, 1.86, 48), glassMat, 0);
    bp(new THREE.CylinderGeometry(0.18, 0.42, 0.52, 32), glassMat, 1.22);
    bp(new THREE.CylinderGeometry(0.18, 0.18, 0.9, 32), glassMat, 1.83);
    bp(new THREE.CylinderGeometry(0.2, 0.18, 0.12, 32), glassMat, 2.34);
    bp(new THREE.CylinderGeometry(0.22, 0.25, 0.28, 32), waxMat, 2.24);
    bp(new THREE.CylinderGeometry(0.16, 0.16, 0.38, 20), capMat, 2.58);
    bp(
      new THREE.SphereGeometry(0.16, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      capMat,
      2.77,
    );
    bp(new THREE.CylinderGeometry(0.38, 0.38, 1.4, 32), liquidMat, -0.14);
    bp(
      new THREE.CylinderGeometry(0.425, 0.425, 1.1, 48, 1, true),
      labelMat,
      0.08,
    );
    bp(new THREE.CylinderGeometry(0.43, 0.43, 1.86, 6, 1, true), sheenMat, 0);

    scene.add(bottle);

    /* Ground */
    const ggeo = new THREE.PlaneGeometry(300, 300, 24, 24);
    const ga = ggeo.attributes.position;
    for (let i = 0; i < ga.count; i++)
      ga.setY(i, Math.sin(ga.getX(i) * 0.1) * Math.cos(ga.getZ(i) * 0.1) * 0.9);
    ggeo.computeVertexNormals();
    const gnd = new THREE.Mesh(
      ggeo,
      new THREE.MeshPhongMaterial({ color: 0x0d0800, flatShading: true }),
    );
    gnd.rotation.x = -Math.PI / 2;
    gnd.position.y = -6.5;
    gnd.receiveShadow = true;
    scene.add(gnd);

    /* Stars */
    const sv = new Float32Array(800 * 3);
    for (let i = 0; i < sv.length; i++) sv[i] = (Math.random() - 0.5) * 280;
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.BufferAttribute(sv, 3));
    scene.add(
      new THREE.Points(
        sg,
        new THREE.PointsMaterial({
          color: 0xffe8b0,
          size: 0.18,
          transparent: true,
          opacity: 0.4,
        }),
      ),
    );

    /* Dust */
    const dv = new Float32Array(250 * 3);
    for (let i = 0; i < dv.length; i++) dv[i] = (Math.random() - 0.5) * 18;
    const dg = new THREE.BufferGeometry();
    dg.setAttribute("position", new THREE.BufferAttribute(dv, 3));
    const dust = new THREE.Points(
      dg,
      new THREE.PointsMaterial({
        color: 0xc9a84c,
        size: 0.045,
        transparent: true,
        opacity: 0.3,
      }),
    );
    scene.add(dust);

    /* Trail */
    const TLEN = 120;
    const tPos = new Float32Array(TLEN * 3);
    const tGeo = new THREE.BufferGeometry();
    tGeo.setAttribute("position", new THREE.BufferAttribute(tPos, 3));
    const tCol = new Float32Array(TLEN * 3);
    for (let i = 0; i < TLEN; i++) {
      const f = 1 - i / TLEN;
      tCol[i * 3] = 0.79 * f;
      tCol[i * 3 + 1] = 0.66 * f;
      tCol[i * 3 + 2] = 0.3 * f;
    }
    tGeo.setAttribute("color", new THREE.BufferAttribute(tCol, 3));
    scene.add(
      new THREE.Points(
        tGeo,
        new THREE.PointsMaterial({
          size: 0.1,
          vertexColors: true,
          transparent: true,
          opacity: 0.55,
        }),
      ),
    );

    /* Path */
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-18, 0.5, 0),
        new THREE.Vector3(-11, 4, -5),
        new THREE.Vector3(-4, 6, 4),
        new THREE.Vector3(4, 4, -4),
        new THREE.Vector3(12, 0, 3),
        new THREE.Vector3(16, -2, 0),
        new THREE.Vector3(10, -2.5, -3),
        new THREE.Vector3(0, 0, 5),
        new THREE.Vector3(-10, 3, -2),
        new THREE.Vector3(-18, 0.5, 0),
      ],
      true,
      "catmullrom",
      0.5,
    );

    /* Scroll state */
    let scrollProg = 0,
      targetProg = 0,
      orbitAngle = 0;
    let prevSI = 0,
      camLerp = 1;
    let camFrom = camera.position.clone();
    const camTarget = new THREE.Vector3();

    const onScroll = () => {
      const max = document.body.scrollHeight - innerHeight;
      targetProg = Math.min(window.scrollY / max, 0.9995);
      if (targetProg > 0.025) setShowHint(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const clock = new THREE.Clock();
    let rafId,
      frame = 0;

    function animate() {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      frame++;

      scrollProg += (targetProg - scrollProg) * 0.08;
      orbitAngle += dt * 0.44;

      if (frame % 3 === 0) setProgress(scrollProg);

      const t = Math.min(scrollProg, 0.9995);
      const pos = curve.getPointAt(t);
      const posN = curve.getPointAt(Math.min(t + 0.003, 0.9995));
      const dir = new THREE.Vector3().subVectors(posN, pos).normalize();

      bottle.position.copy(pos);
      bottle.lookAt(posN);
      bottle.rotateOnAxis(new THREE.Vector3(0, 1, 0), dt * 0.9);

      goldGlow.position.set(pos.x, pos.y + 1, pos.z + 3);
      goldGlow.intensity = 1.6 + Math.sin(Date.now() * 0.002) * 0.4;

      dust.rotation.y += dt * 0.04;

      /* Trail shift */
      for (let i = TLEN - 1; i > 0; i--) {
        tPos[i * 3] = tPos[(i - 1) * 3];
        tPos[i * 3 + 1] = tPos[(i - 1) * 3 + 1];
        tPos[i * 3 + 2] = tPos[(i - 1) * 3 + 2];
      }
      tPos[0] = pos.x;
      tPos[1] = pos.y;
      tPos[2] = pos.z;
      tGeo.attributes.position.needsUpdate = true;

      /* Stage transitions */
      const si = getSI(scrollProg);
      if (si !== prevSI) {
        camFrom.copy(camera.position);
        camLerp = 0;
        setCamName(STAGES[si].name);
        setStageIdx(si);
        prevSI = si;
      }

      const tCam = STAGES[si].cam(pos, dir, orbitAngle);
      if (camLerp < 1) {
        camLerp = Math.min(camLerp + dt * 1.3, 1);
        camera.position.lerpVectors(camFrom, tCam, eio(camLerp));
      } else {
        camera.position.lerp(tCam, 0.06);
      }

      camTarget.lerp(pos, 0.1);
      camera.lookAt(camTarget);
      renderer.render(scene, camera);
    }

    animate();

    const onResize = () => {
      renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  return (
    /* Tall scroll container */
    <div
      className="relative bg-neutral-950"
      style={{ height: `${(SECTIONS.length + 0.5) * 100}vh` }}
    >
      {/* ── Progress bar ── */}
      <div
        className="fixed top-0 left-0 h-[1.5px] bg-gradient-to-r from-amber-500 to-yellow-300 z-50 shadow-[0_0_10px_rgba(201,168,76,0.6)] transition-[width] duration-100"
        style={{ width: `${prog * 100}%` }}
      />

      {/* ── Camera name label ── */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none font-mono text-[11px] tracking-[0.32em] uppercase text-amber-500/50">
        {camName}
      </div>

      {/* ── Stage dots ── */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2.5">
        {STAGES.map((_, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-400 ${
              stageIdx === i
                ? "h-4 bg-amber-400 scale-x-125"
                : "h-1 bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* ── Scroll hint ── */}
      {showHint && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none text-center font-mono text-[11px] tracking-[0.28em] uppercase text-stone-500 transition-opacity duration-1000">
          Scroll to explore
          <span className="block mt-1.5 text-amber-500/60 text-base animate-bounce">
            ↓
          </span>
        </div>
      )}

      {/* ── Sticky Three.js canvas ── */}
      <div className="sticky top-0 w-screen h-screen overflow-hidden z-0">
        <canvas ref={canvasRef} className="block w-full h-full" />
        {/* Vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 35%, rgba(8,8,8,0.78) 100%)",
          }}
        />
      </div>

      {/* ── Content sections ── */}
      <div className="absolute top-0 left-0 w-full pointer-events-none z-20">
        {SECTIONS.map((sec, i) => (
          <div
            key={i}
            data-idx={i}
            ref={(el) => (secRefs.current[i] = el)}
            className={`h-screen flex items-center px-[8vw] ${
              sec.align === "right" ? "justify-end" : "justify-start"
            }`}
          >
            <SectionCard sec={sec} visible={visible} idx={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
