"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, QuadraticBezierLine } from "@react-three/drei";
import * as THREE from "three";
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

const PLATFORM_BADGES = [
  { Icon: SiInstagram, color: SiInstagramHex, label: "Instagram", pos: [-2.9, 1.5, 0.4] },
  { Icon: SiTiktok, color: SiTiktokHex, label: "TikTok", pos: [2.9, -1.4, 0.6] },
  { Icon: SiYoutube, color: SiYoutubeHex, label: "YouTube", pos: [2.7, 1.7, -0.3] },
  { Icon: SiFacebook, color: SiFacebookHex, label: "Facebook", pos: [-2.8, -1.3, -0.4] },
  { Icon: SiTelegram, color: SiTelegramHex, label: "Telegram", pos: [-3.1, 0.1, 0.8] },
  { Icon: SiX, color: SiXHex, label: "X", pos: [3.1, 0.2, -0.7] },
] as const;

const DASHBOARD_CARDS = [
  { title: "Campaign", value: "+248%", points: "0,20 10,14 20,17 30,8 40,11 50,2", pos: [-3.4, -0.3, 1.1] },
  { title: "New Followers", value: "12.4k", points: "0,18 10,15 20,16 30,9 40,10 50,4", pos: [3.3, 0.6, 1.2] },
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

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[GLOBE_RADIUS, 3]} />
        <meshBasicMaterial color="#7c8fd0" wireframe transparent opacity={0.4} />
      </mesh>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 0.97, 48, 32]} />
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
        <mesh key={i} position={p} rotation={[0.4, 0.6, 0.2]}>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshBasicMaterial color="#4a3f8a" wireframe transparent opacity={0.12} />
        </mesh>
      ))}
    </>
  );
}

function Sparkline({ points }: { points: string }) {
  return (
    <svg width="70" height="24" viewBox="0 0 50 20" className="opacity-90">
      <polyline
        points={points}
        fill="none"
        stroke="#a78bfa"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashboardCard({ title, value, points, pos }: (typeof DASHBOARD_CARDS)[number]) {
  return (
    <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.6}>
      <Html position={pos as unknown as [number, number, number]} center transform={false} zIndexRange={[10, 0]}>
        <div className="w-36 rounded-xl border border-white/15 bg-[#151233]/70 backdrop-blur-md p-3 shadow-xl select-none pointer-events-none">
          <p className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">
            {title}
          </p>
          <p className="text-sm font-bold text-white mb-1">{value}</p>
          <Sparkline points={points} />
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
          <Icon color={color} size={20} aria-label={label} />
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
