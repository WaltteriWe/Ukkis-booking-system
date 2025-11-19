"use client";

import { useTheme } from "@/context/ThemeContext";
import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export function StarryBackground() {
  const { darkMode } = useTheme();
  
  if (!darkMode) return null;
  
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
      </Canvas>
    </div>
  );
}