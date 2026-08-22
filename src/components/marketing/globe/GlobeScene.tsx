"use client";

import { useId, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, QuadraticBezierLine } from "@react-three/drei";
import * as THREE from "three";
import { createEarthDotTexture } from "./earth-texture";
import {
  SiInstagram,
  SiInstagramHex,
  SiTiktok,
  SiTiktokHex,
  SiYoutube,
  SiYoutubeHex,
  SiFacebook,
  SiFacebookHex,
  SiTelegram,
  SiTelegramHex,
  SiX,
  SiXHex,
} from "@icons-pack/react-simple-icons";

const GLOBE_RADIUS = 1.6;

// Deterministic "random" points on the globe's surface for the glowing
// data-dot + connector-arc decoration -- seeded manually (not Math.random())
// so server and client render the exact same scene on first paint.
const DOTS: [number, number, number][] = [
  [0.9, 1.0, 0.7], [-1.1, 0.6, 0.9], [1.2, -0.4, -0.8], [-0.7, -1.1, 0.6],
  [0.3, 1.3, -0.7], [-1.3, 0.2, -0.6], [0.6, -1.2, 0.5], [1.0, 0.3, 1.0],
  [-0.4, 1.0, 1.0], [0.2, -0.6, -1.4],
].map(([x, y, z]) => {
  const v = new THREE.Vector3(x, y, z).normalize().multiplyScalar(GLOBE_RADIUS);
  return [v.x, v.y, v.z];
});

const ARCS: [number, number][] = [
  [0, 2], [1, 5], [3, 7], [4, 8], [6, 9],
];

// Positions are deliberately conservative on both X and Z: this canvas
// sits in a narrow, roughly-square panel (not a wide hero banner), and a
// badge's screen-space projection grows fast as Z approaches the camera
// (z=6.2) -- the original pass placed TikTok/Telegram at z=0.6/0.8, which
// pushed them past the edge of the frame entirely. Every position here
// was verified with a real screenshot (see the /login page) to land
// fully inside the visible panel.
const PLATFORM_BADGES = [
  { Icon: SiInstagram, color: SiInstagramHex, label: "Instagram", pos: [-2.9, 1.9, 0.2] },
  { Icon: SiYoutube, color: SiYoutubeHex, label: "YouTube", pos: [2.8, 1.95, -0.3] },
  { Icon: SiTelegram, color: SiTelegramHex, label: "Telegram", pos: [-2.9, 0.35, -0.2] },
  { Icon: SiX, color: SiXHex, label: "X", pos: [3.0, -0.15, -0.5] },
  { Icon: SiFacebook, color: SiFacebookHex, label: "Facebook", pos: [-2.6, -1.8, -0.2] },
  { Icon: SiTiktok, color: SiTiktokHex, label: "TikTok", pos: [2.6, -1.9, -0.2] },
] as const;

const DASHBOARD_CARDS = [
  {
    title: "Campaign Reach",
    value: "248.6k",
    delta: "+18.4%",
    icon: "campaign",
    points: "0,20 10,14 20,17 30,8 40,11 50,2",
    pos: [-1.9, -0.9, 0.3],
  },
  {
    title: "New Followers",
    value: "12.4k",
    delta: "+6.1%",
    icon: "group_add",
    points: "0,18 10,15 20,16 30,9 40,10 50,4",
    pos: [1.9, 0.95, 0.3],
  },
] as const;

function Dots() {
  return (
    <>
      {DOTS.map((p, i) => (
        <Pulse key={i} position={p} />
      ))}
    </>
  );
}

function Pulse({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    const s = 0.75 + Math.sin(clock.elapsedTime * 2 + phase) * 0.35;
    ref.current?.scale.setScalar(s);
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.025, 8, 8]} />
      <meshBasicMaterial color="#c9baff" />
    </mesh>
  );
}

function Arcs() {
  return (
    <>
      {ARCS.map(([a, b], i) => {
        const start = new THREE.Vector3(...DOTS[a]);
        const end = new THREE.Vector3(...DOTS[b]);
        const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(GLOBE_RADIUS * 1.35);
        return (
          <QuadraticBezierLine
            key={i}
            start={start}
            end={end}
            mid={mid}
            color="#8b6ff0"
            lineWidth={1}
            transparent
            opacity={0.35}
          />
        );
      })}
    </>
  );
}

function Globe() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.09;
  });

  const earthTexture = useMemo(() => {
    const { canvas } = createEarthDotTexture();
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <group ref={group}>
      {/* Classic latitude/longitude grid (not a triangulated icosahedron)
          -- this is what actually reads as "a globe" rather than an
          abstract polygon ball. */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 28, 18]} />
        <meshBasicMaterial color="#7c8fd0" wireframe transparent opacity={0.35} />
      </mesh>
      {/* Glowing dot-matrix continents, see earth-texture.ts */}
      <mesh rotation={[0, Math.PI * 0.15, 0]}>
        <sphereGeometry args={[GLOBE_RADIUS * 0.985, 64, 40]} />
        <meshBasicMaterial map={earthTexture} transparent opacity={1} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 0.96, 48, 32]} />
        <meshPhysicalMaterial
          color="#3a3f7a"
          transmission={0.9}
          roughness={0.25}
          thickness={0.8}
          ior={1.2}
          transparent
          opacity={0.5}
        />
      </mesh>
      <Dots />
      <Arcs />
    </group>
  );
}

function BackgroundCubes() {
  const positions: [number, number, number][] = [
    [-4.2, 2.4, -3],
    [4, -2.6, -3.5],
    [3.6, 2.8, -4],
  ];
  return (
    <>
      {positions.map((p, i) => (
        <group key={i} position={p} rotation={[0.4, 0.6, 0.2]}>
          <mesh>
            <boxGeometry args={[1.1, 1.1, 1.1]} />
            <meshPhysicalMaterial
              color="#5a4fc0"
              transparent
              opacity={0.16}
              roughness={0.25}
              metalness={0.2}
              transmission={0.4}
              flatShading
            />
          </mesh>
          <mesh>
            <boxGeometry args={[1.1, 1.1, 1.1]} />
            <meshBasicMaterial color="#c9baff" wireframe transparent opacity={0.15} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function AreaSparkline({ points, gradientId }: { points: string; gradientId: string }) {
  const coords = points.split(" ").map((p) => p.split(",").map(Number));
  const lastX = coords[coords.length - 1][0];
  const lastY = coords[coords.length - 1][1];
  const areaPath = `M0,20 L${points.replace(/ /g, " L")} L${lastX},20 Z`;

  return (
    <svg width="100%" height="34" viewBox="0 0 50 20" className="block" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <polyline
        points={points}
        fill="none"
        stroke="#c9baff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={lastX} cy={lastY} r="2" fill="#e9e2ff" />
    </svg>
  );
}

function DashboardCard({ title, value, delta, icon, points, pos }: (typeof DASHBOARD_CARDS)[number]) {
  const gradientId = useId();

  return (
    <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.6}>
      <Html position={pos as unknown as [number, number, number]} center transform={false} zIndexRange={[10, 0]}>
        <div className="w-44 rounded-xl border border-white/15 bg-[#151233]/80 backdrop-blur-md p-3.5 shadow-xl select-none pointer-events-none">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <p className="text-[9.5px] uppercase tracking-wider text-white/60 font-semibold">
                {title}
              </p>
            </div>
            <span className="material-symbols-outlined text-[14px] text-white/35">
              {icon}
            </span>
          </div>
          <div className="flex items-end justify-between gap-2 mb-1.5">
            <p className="text-lg font-bold text-white leading-none">{value}</p>
            <span className="text-[10px] font-semibold text-emerald-400 leading-none pb-0.5">
              {delta}
            </span>
          </div>
          <AreaSparkline points={points} gradientId={gradientId} />
        </div>
      </Html>
    </Float>
  );
}

function PlatformBadge({ Icon, color, label, pos }: (typeof PLATFORM_BADGES)[number]) {
  return (
    <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.8}>
      <Html position={pos as unknown as [number, number, number]} center transform={false} zIndexRange={[10, 0]}>
        <div
          className="w-11 h-11 rounded-2xl border border-white/15 bg-[#151233]/70 backdrop-blur-md flex items-center justify-center shadow-lg select-none pointer-events-none"
          style={{ boxShadow: `0 0 18px -2px ${color}88` }}
        >
          {/* Fixed light backdrop behind the glyph itself -- some brand
              colors (TikTok is pure black) would otherwise disappear
              against the dark glass chip. */}
          <div className="w-7 h-7 rounded-full bg-white/95 flex items-center justify-center">
            <Icon color={color} size={16} aria-label={label} />
          </div>
        </div>
      </Html>
    </Float>
  );
}

function Brand({ text, y }: { text: string; y: number }) {
  return (
    <Float speed={1} rotationIntensity={0} floatIntensity={0.3}>
      <Html position={[0, y, 0]} center transform={false} zIndexRange={[5, 0]}>
        <div className="px-4 py-1 rounded-full border border-white/15 bg-[#151233]/60 backdrop-blur-md select-none pointer-events-none">
          <span className="text-[11px] font-bold tracking-[0.3em] text-white/80 uppercase">
            {text}
          </span>
        </div>
      </Html>
    </Float>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 3, 4]} intensity={40} color="#c9baff" />
      <pointLight position={[-4, -2, 3]} intensity={20} color="#6e8fc2" />
    </>
  );
}

/**
 * WebGL globe scene for the login/register marketing panel -- see
 * OrbitGlobe3D.tsx for the dynamic(ssr:false) wrapper that loads this.
 * Deliberately heavier than the rest of the site (three.js + fiber + drei,
 * ~700kb) in exchange for a genuinely 3D glass/wireframe look a CSS-only
 * version can't reach -- confirmed acceptable with the user, desktop-only,
 * and lazy-loaded so it never blocks the login form itself from being
 * interactive.
 */
export function GlobeScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.2], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Lights />
      <BackgroundCubes />
      <Globe />
      <Brand text="GlobalSMM" y={2.05} />
      <Brand text="GlobalSMM" y={-2.05} />
      {DASHBOARD_CARDS.map((c) => (
        <DashboardCard key={c.title} {...c} />
      ))}
      {PLATFORM_BADGES.map((b) => (
        <PlatformBadge key={b.label} {...b} />
      ))}
    </Canvas>
  );
}
