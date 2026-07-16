"use client";

import dynamic from "next/dynamic";
import type { CSSProperties } from "react";

export type ColorBendsProps = {
  className?: string;
  style?: CSSProperties;
  rotation?: number;
  speed?: number;
  colors?: string[];
  transparent?: boolean;
  autoRotate?: number;
  scale?: number;
  frequency?: number;
  warpStrength?: number;
  mouseInfluence?: number;
  parallax?: number;
  noise?: number;
  iterations?: number;
  intensity?: number;
  bandWidth?: number;
};

const ColorBends = dynamic<ColorBendsProps>(() => import("./ColorBends.jsx"), {
  ssr: false
});

export default ColorBends;
