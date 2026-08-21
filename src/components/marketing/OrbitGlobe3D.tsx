"use client";

import dynamic from "next/dynamic";
import { OrbitGlobe } from "./OrbitGlobe";

// Three.js/fiber/drei only run in the browser, and this keeps the ~700kb
// bundle out of the login/register page's initial JS entirely -- it's
// fetched lazily, off the critical path, so the form stays interactive
// immediately. The CSS-only OrbitGlobe (see OrbitGlobe.tsx) is reused as
// the loading placeholder so there's no layout jump while it loads.
const GlobeScene = dynamic(
  () => import("./globe/GlobeScene").then((mod) => mod.GlobeScene),
  { ssr: false, loading: () => <OrbitGlobe /> },
);

export function OrbitGlobe3D() {
  return (
    <div className="w-full h-full min-h-[380px]">
      <GlobeScene />
    </div>
  );
}
