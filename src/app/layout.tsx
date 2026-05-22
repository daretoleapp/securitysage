import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { SurfaceProvider } from "@/components/surface-context";
import { SurfaceSelector } from "@/components/surface-selector";

export const metadata: Metadata = {
  title: "SecuritySage — Code security AI powered by MiMo",
  description: "SAST, secret detection, and dependency CVE scanning powered by Xiaomi MiMo Pro and MiMo VL multimodal threat-model critique.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SurfaceProvider>
          <div className="flex">
            <Sidebar />
            <div className="flex-1 min-w-0">
              <header className="border-b border-[var(--border)] bg-[var(--bg)] px-6 py-3 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
                <div className="text-xs text-zinc-500 mono">code-security · ai-assisted</div>
                <SurfaceSelector />
              </header>
              <main className="px-6 py-6 max-w-7xl">{children}</main>
            </div>
          </div>
        </SurfaceProvider>
      </body>
    </html>
  );
}
