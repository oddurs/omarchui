"use client";

import dynamic from "next/dynamic";
import { BootSplash } from "./BootSplash";

// Until the desktop's code arrives, the same splash stands in, so loading looks like booting.
function Boot() {
  return <BootSplash interactive={false} onDone={() => undefined} hold="bootloader" />;
}

// The desktop reads the viewport, the clock and storage from its first render, so it only
// ever renders in the browser.
const Desktop = dynamic(() => import("./Desktop").then((m) => m.Desktop), { ssr: false, loading: Boot });

export function DemoLoader() {
  return <Desktop />;
}
