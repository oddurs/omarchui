/** Set SITE_URL in the deploy environment; Open Graph and the sitemap need an absolute origin. */
export const SITE_URL = new URL(process.env.SITE_URL ?? "http://localhost:3000");
export const SITE_NAME = "Omarchui";
export const SITE_DESCRIPTION =
  "A re-tuning of Omarchy's interface: one unit, one focus ring, two typefaces and eighteen colour roles, with a working demo desktop and before/after.";
