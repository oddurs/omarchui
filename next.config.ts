import { readFileSync } from "node:fs";
import path from "node:path";
import withStylexTurbopack from "@stylexswc/nextjs-plugin/turbopack";
import type { NextConfig } from "next";

const root = process.cwd();
const { commit } = JSON.parse(readFileSync(path.join(root, "research/omarchy/facts.json"), "utf8")) as { commit: string };

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Omarchy's theme images at the pinned commit (lib/backgrounds.ts), and nothing else.
    remotePatterns: [new URL(`https://raw.githubusercontent.com/basecamp/omarchy/${commit}/themes/**`)],
    qualities: [75],
    // The largest stock background is 5 MB.
    maximumResponseBody: 8_000_000,
  },
};

export default withStylexTurbopack({
  rsOptions: {
    dev: process.env.NODE_ENV === "development",
    aliases: { "@/*": [path.join(root, "*")] },
    unstable_moduleResolution: { type: "commonJS" },
  },
})(nextConfig);
