import path from "node:path";

const root = process.cwd();

const config = {
  plugins: {
    "@stylexswc/postcss-plugin": {
      // Auto-discover sources rather than list folders: a folder missing from an allowlist
      // compiles fine and silently ships without its CSS.
      exclude: ["**/*.test.*", "tests/**", "e2e/**", "scripts/**", "prototype/**", "research/**"],
      rsOptions: {
        dev: process.env.NODE_ENV === "development",
        aliases: { "@/*": [path.join(root, "*")] },
        unstable_moduleResolution: { type: "commonJS" },
      },
    },
    autoprefixer: {},
  },
};

export default config;
