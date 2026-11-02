import type { MetadataRoute } from "next";
import { ENTRIES, FOUNDATIONS } from "@/docs/registry";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/study",
    "/omarchy",
    "/contact",
    "/system",
    ...FOUNDATIONS.map((f) => `/system/foundations/${f.slug}`),
    ...ENTRIES.map((e) => `/system/${e.layer}/${e.slug}`),
  ];
  return paths.map((path) => ({ url: new URL(path, SITE_URL).toString() }));
}
