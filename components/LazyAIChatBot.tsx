"use client";

import dynamic from "next/dynamic";

export const LazyAIChatBot = dynamic(
  () => import("@/components/AIChatBot").then((mod) => mod.AIChatBot),
  { ssr: false }
);
