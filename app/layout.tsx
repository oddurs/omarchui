import * as stylex from "@stylexjs/stylex";
import type { Metadata, Viewport } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { color } from "@/design/tokens/color.stylex";
import { layer } from "@/design/tokens/layer.stylex";
import { space } from "@/design/tokens/space.stylex";
import { typo } from "@/design/primitives/typography";
import { font, weight } from "@/design/tokens/type.stylex";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { bootScript } from "@/lib/theme-runtime";
import "./globals.css";

const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap", weight: ["400", "500", "600", "700", "800"] });
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: { type: "website", siteName: SITE_NAME, title: SITE_NAME, description: SITE_DESCRIPTION },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#dce0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#16161e" },
  ],
};

const s = stylex.create({
  body: { fontFamily: font.sans },
  skip: {
    position: "absolute",
    left: space.u4,
    top: `calc(-1 * ${space.u12})`,
    zIndex: layer.flash,
    paddingBlock: space.u2,
    paddingInline: space.u3,
    fontWeight: weight.semibold,
    color: color["--on-accent"],
    backgroundColor: color["--accent"],
    textDecoration: "none",
    ":focus": { top: space.u2 },
  },
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The boot script writes the chosen palette onto <html> before React hydrates.
    <html lang="en" className={`${mono.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body {...stylex.props(s.body)}>
        <a href="#main" {...stylex.props(typo.small, s.skip)}>
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
