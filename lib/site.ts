/** Set SITE_URL in the deploy environment; Open Graph and the sitemap need an absolute origin. */
export const SITE_URL = new URL(process.env.SITE_URL ?? "http://localhost:3000");
export const SITE_NAME = "Omarchui";
export const SITE_DESCRIPTION =
  "A re-tuning of Omarchy's interface foundations: one spacing unit, one face, colour that holds contrast on every theme. Boot it in the browser, then read the study.";
