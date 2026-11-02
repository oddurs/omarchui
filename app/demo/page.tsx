import type { Metadata } from "next";
import { DemoLoader } from "@/demo/DemoLoader";

export const metadata: Metadata = {
  title: "Demo",
  description:
    "A working Omarchy-style desktop in the browser: tiling windows, a shell, menus, notifications and a before/after divider between stock and tuned.",
  alternates: { canonical: "/demo" },
};

export default function DemoPage() {
  return <DemoLoader />;
}
