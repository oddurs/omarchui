import path from "node:path";
import withStylexTurbopack from "@stylexswc/nextjs-plugin/turbopack";
import type { NextConfig } from "next";

const root = process.cwd();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  cacheComponents: true,
  partialPrefetching: true,
};

export default withStylexTurbopack({
  rsOptions: {
    dev: process.env.NODE_ENV === "development",
    aliases: { "@/*": [path.join(root, "*")] },
    unstable_moduleResolution: { type: "commonJS" },
  },
})(nextConfig);
