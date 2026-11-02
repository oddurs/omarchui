import type { Metadata } from "next";
import { DemoLoader } from "@/demo/DemoLoader";
import { SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Omarchui" },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

/** The site opens as the machine: it boots, asks for a password, and lands on the desktop. */
export default function Home() {
  return <DemoLoader />;
}
