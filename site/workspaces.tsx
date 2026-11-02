"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { choose, readChosen, systemSlug } from "@/lib/theme-runtime";
import { nextSlug } from "@/lib/themes";
import { SECTIONS } from "./sections";

type Ctx = { active: number; focus: (ws: number) => void; jump: (ws: number) => void };
const WorkspaceContext = createContext<Ctx>({ active: 1, focus: () => {}, jump: () => {} });

export const useWorkspaces = () => useContext(WorkspaceContext);

/**
 * The page behaves like the desktop it describes: sections are workspaces, number keys
 * jump between them, and the one in view (or under the mouse) holds the focus ring.
 */
export function Workspaces({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(1);
  const router = useRouter();
  // While a jump scrolls, sections slide through the observer's band; ignore them.
  const jumping = useRef(false);

  const jump = useCallback((ws: number) => {
    const sec = SECTIONS.find((x) => x.ws === ws);
    const el = sec && document.getElementById(sec.id);
    if (!el) return;
    setActive(ws);
    jumping.current = true;
    const release = () => {
      jumping.current = false;
      window.removeEventListener("scrollend", release);
    };
    window.addEventListener("scrollend", release);
    window.setTimeout(release, 1200);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    el.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        if (jumping.current) return;
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.ws));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-ws]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, [contenteditable], [role=menu], [role=slider], [role=listbox]")) return;
      if (/^[1-8]$/.test(e.key)) jump(Number(e.key));
      else if (e.key === "t" || e.key === "T") choose(nextSlug(readChosen() ?? systemSlug(), e.key === "t" ? 1 : -1));
      else if (e.key === "d") router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump, router]);

  const value = useMemo(() => ({ active, focus: setActive, jump }), [active, jump]);
  return <WorkspaceContext value={value}>{children}</WorkspaceContext>;
}
