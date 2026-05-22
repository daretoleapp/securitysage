"use client";
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { DEMO_KEYS } from "@/lib/demos";

interface SurfaceState {
  surfaceKey: string;
  setSurfaceKey: (k: string) => void;
}

const Ctx = createContext<SurfaceState | null>(null);

export function SurfaceProvider({ children }: { children: ReactNode }) {
  const [surfaceKey, setSurfaceKey] = useState<string>(DEMO_KEYS[0]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("securitysage:repo") : null;
    if (stored && DEMO_KEYS.includes(stored)) setSurfaceKey(stored);
  }, []);

  const update = useCallback((k: string) => {
    setSurfaceKey(k);
    if (typeof window !== "undefined") localStorage.setItem("securitysage:repo", k);
  }, []);

  return <Ctx.Provider value={{ surfaceKey, setSurfaceKey: update }}>{children}</Ctx.Provider>;
}

export function useSurface() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSurface must be used within SurfaceProvider");
  return v;
}
