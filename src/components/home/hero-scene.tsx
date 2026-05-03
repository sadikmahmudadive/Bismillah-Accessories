"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

function FloatingOrb({
  position,
  color,
  speed,
  distort,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
  distort: number;
}) {
  const mesh = useRef<Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = state.clock.elapsedTime * speed * 0.4;
    mesh.current.rotation.y =
      state.clock.elapsedTime * speed * 0.3 + state.pointer.x * 0.3;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={mesh} position={position} castShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.1}
          metalness={0.6}
          distort={distort}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

function TorusKnot({
  position,
  color,
  speed,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
}) {
  const mesh = useRef<Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = state.clock.elapsedTime * speed;
    mesh.current.rotation.y =
      state.clock.elapsedTime * speed * 0.7 + state.pointer.x * 0.4;
  });

  return (
    <Float speed={2.4} rotationIntensity={0.5} floatIntensity={0.6}>
      <mesh ref={mesh} position={position} castShadow>
        <torusKnotGeometry args={[0.55, 0.18, 128, 18]} />
        <meshStandardMaterial color={color} roughness={0.18} metalness={0.55} />
      </mesh>
    </Float>
  );
}

export function HeroScene() {
  return (
    // Positioned to the right half so it never overlaps the text column
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Soft gradient base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_40%,rgba(47,158,116,0.08),transparent_60%),radial-gradient(ellipse_50%_50%_at_90%_80%,rgba(184,134,11,0.06),transparent_50%)]" />

      {/* 3D canvas — right half only via clip */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-1/2">
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 40 }}
          dpr={[1, 1.6]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1.4} />
          <pointLight position={[4, 5, 4]} intensity={8} color="#ffffff" />
          <pointLight position={[-3, -2, 3]} intensity={4} color="#f0c36a" />
          <pointLight position={[2, -4, 2]} intensity={3} color="#2f9e74" />

          {/* Main torus knot — right center */}
          <TorusKnot position={[0.8, 0.2, 0]} color="#2f9e74" speed={0.28} />
          {/* Smaller accent orb — bottom right */}
          <FloatingOrb
            position={[-1.2, -1.4, -0.5]}
            color="#d65f5f"
            speed={0.2}
            distort={0.4}
          />
          {/* Top accent orb */}
          <FloatingOrb
            position={[1.5, 1.6, -0.8]}
            color="#b8860b"
            speed={0.15}
            distort={0.3}
          />
        </Canvas>
      </div>

      {/* Fade overlay to blend with left text area */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#fafaf8_0%,#fafaf8_30%,transparent_60%)]" />
    </div>
  );
}
