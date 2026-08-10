"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { useVeilCapability } from "@/lib/useVeilCapability";

import styles from "./VeilStage.module.css";

// Dynamically imported and client-only: three.js and the GLB stay out of the
// server bundle and off the critical path entirely. Nothing here blocks first
// paint — the poster below is what renders immediately.
const VeilScene = dynamic(() => import("./VeilScene"), { ssr: false });

export function VeilStage() {
  const enabled = useVeilCapability();
  // Distinct from `enabled`: this flips only once the 3D veil has actually
  // drawn a frame. Fading the poster on capability detection alone means any
  // WebGL failure — dead driver, blocked context, GLB 404 — leaves an empty
  // hero, which is exactly what an early screenshot pass caught.
  const [live, setLive] = useState(false);

  return (
    <div className={styles.stage}>
      {/*
        The Blender poster is always present. On capable desktops the WebGL
        canvas layers over it; everywhere else this *is* the veil, which is why
        it was rendered to stand on its own rather than as a loading state.
      */}
      <img
        src="/posters/veil-study.webp"
        alt=""
        aria-hidden="true"
        width={1000}
        height={1250}
        className={styles.poster}
        data-live={live ? "true" : "false"}
      />
      {enabled ? <VeilScene onReady={() => setLive(true)} /> : null}
    </div>
  );
}
