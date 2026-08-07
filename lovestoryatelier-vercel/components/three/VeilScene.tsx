"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import type { Group, Mesh, MeshStandardMaterial } from "three";

const MODEL_URL = "/models/veil-study.glb";

// Self-hosted Draco decoder. drei defaults to fetching this from Google's CDN
// at runtime, which puts a third-party request on the critical path of the
// signature asset — a privacy liability, an extra DNS/TLS round trip, and a
// single point of failure the site cannot control. Copied from three's
// examples at install time; see README "Draco decoder".
const DRACO_PATH = "/draco/gltf/";

/**
 * The veil mesh. Motion is deliberately tiny: this sits behind editorial type,
 * so it should read as breath rather than animation.
 */
function Veil({ onReady }: { onReady: () => void }) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH);
  const pointer = useRef({ x: 0, y: 0 });
  const eased = useRef({ x: 0, y: 0 });
  const announced = useRef(false);

  useEffect(() => {
    // The GLB carries an alpha-blended material from Blender. Depth-write must
    // be off or the overlapping folds punch holes in each other.
    scene.traverse((child) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      const material = mesh.material as MeshStandardMaterial;
      material.transparent = true;
      material.depthWrite = false;
      material.opacity = 0.55;
    });
  }, [scene]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;

    // Signal only once the mesh has genuinely drawn a frame. The poster stays
    // visible until then, so a failed load or a dead WebGL context leaves the
    // Blender render in place rather than an empty hero.
    if (!announced.current) {
      announced.current = true;
      onReady();
    }

    // Critically damped follow — no spring overshoot. Fabric does not bounce.
    const k = 1 - Math.exp(-delta * 1.8);
    eased.current.x += (pointer.current.x - eased.current.x) * k;
    eased.current.y += (pointer.current.y - eased.current.y) * k;

    const t = state.clock.elapsedTime;
    group.current.rotation.y = eased.current.x * 0.16 + Math.sin(t * 0.22) * 0.03;
    group.current.rotation.x = eased.current.y * 0.05;
    group.current.position.y = -1.55 + Math.sin(t * 0.31) * 0.015;
  });

  return (
    <group ref={group} position={[0, -1.55, 0]} scale={1.05}>
      <primitive object={scene} />
    </group>
  );
}

/** Stops the render loop whenever the canvas is offscreen or the tab hidden. */
function RenderGate({ active }: { active: boolean }) {
  const { invalidate } = useThree();
  useEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);
  useFrame(() => {
    if (active) invalidate();
  });
  return null;
}

export default function VeilScene({ onReady }: { onReady: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = host.current;
    if (!element) return;

    let onscreen = false;
    const sync = () => setActive(onscreen && !document.hidden);

    const observer = new IntersectionObserver(
      ([entry]) => {
        onscreen = entry?.isIntersecting ?? false;
        sync();
      },
      { rootMargin: "120px" },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div ref={host} aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      <Canvas
        frameloop="demand"
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0.9, 0.15, 3.6], fov: 42 }}
      >
        <RenderGate active={active} />
        <ambientLight intensity={1.5} color="#f7f4ed" />
        <directionalLight position={[3, 4, 2]} intensity={2.1} color="#fcfbf8" />
        <directionalLight position={[-3, 2, -2]} intensity={0.9} color="#e8dcc4" />
        {/* Suspense keeps the GLB fetch off the first paint; the poster is the
            fallback, so there is nothing to render while it loads. */}
        <Suspense fallback={null}>
          <Veil onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL, DRACO_PATH);
