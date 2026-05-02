"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

function AccessoryObject({
  position,
  color,
  speed,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
}) {
  const mesh = useRef<Mesh>(null);

  useFrame(({ clock, pointer }) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = clock.elapsedTime * speed + pointer.y * 0.5;
    mesh.current.rotation.y = clock.elapsedTime * (speed * 0.7) + pointer.x * 0.5;
  });

  return (
    <Float speed={2.2} rotationIntensity={0.45} floatIntensity={0.7}>
      <mesh ref={mesh} position={position} castShadow>
        <torusKnotGeometry args={[0.45, 0.14, 120, 16]} />
        <meshStandardMaterial
          color={color}
          roughness={0.28}
          metalness={0.46}
        />
      </mesh>
    </Float>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.1} />
        <pointLight position={[3, 4, 4]} intensity={6} color="#ffffff" />
        <pointLight position={[-4, -2, 3]} intensity={3} color="#f0c36a" />
        <AccessoryObject position={[-1.7, 0.65, 0]} color="#111111" speed={0.34} />
        <AccessoryObject position={[1.6, -0.35, -0.6]} color="#2f9e74" speed={0.24} />
        <AccessoryObject position={[0.2, -1.35, -0.3]} color="#d65f5f" speed={0.18} />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.12),transparent_34%),linear-gradient(180deg,rgba(250,250,248,0.2),#fafaf8_82%)]" />
    </div>
  );
}
