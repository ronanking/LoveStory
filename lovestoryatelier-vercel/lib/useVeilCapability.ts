"use client";

import { useEffect, useState } from "react";

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

/**
 * Decides whether this client should run the WebGL veil at all.
 *
 * The 3D layer is an enhancement, never a requirement — every "no" here falls
 * back to the pre-rendered Blender poster, which is what most visitors on
 * phones will see and is deliberately good enough to stand alone.
 */
export function useVeilCapability(): boolean {
  // Start false so server and first client render agree, and so the poster is
  // what paints first regardless. Upgrading to 3D is a second-pass decision.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(pointer: fine)");

    const evaluate = () => {
      if (motionQuery.matches) return setEnabled(false);

      // Fine pointer stands in for "desktop with the headroom to spare".
      // Touch devices get the poster: the veil is decorative, and spending a
      // phone's battery and main thread on it is a poor trade.
      if (!pointerQuery.matches) return setEnabled(false);

      // Rough proxy for low-power machines.
      const cores = navigator.hardwareConcurrency ?? 4;
      if (cores < 4) return setEnabled(false);

      // Data Saver — respect it where the browser exposes it.
      const connection = (
        navigator as Navigator & { connection?: { saveData?: boolean } }
      ).connection;
      if (connection?.saveData) return setEnabled(false);

      // WebGL may be unavailable even on capable hardware — blocklisted
      // drivers, hardware acceleration switched off, headless browsers.
      // Probing costs one throwaway context and avoids mounting a canvas
      // that could never draw.
      if (!hasWebGL()) return setEnabled(false);

      return setEnabled(true);
    };

    evaluate();
    motionQuery.addEventListener("change", evaluate);
    pointerQuery.addEventListener("change", evaluate);
    return () => {
      motionQuery.removeEventListener("change", evaluate);
      pointerQuery.removeEventListener("change", evaluate);
    };
  }, []);

  return enabled;
}
