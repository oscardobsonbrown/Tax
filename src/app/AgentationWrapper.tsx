"use client";

import { Agentation } from "agentation";

export function AgentationWrapper() {
  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return <Agentation />;
}
