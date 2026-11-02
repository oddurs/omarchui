import { DEFAULT_DARK, DEFAULT_LIGHT, isSlug, ROLES, THEMES, type ThemeSlug } from "./themes";

export const STORAGE_KEY = "omarchui-theme";
export const THEME_EVENT = "omarchui:theme";

export function systemSlug(): ThemeSlug {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? DEFAULT_DARK : DEFAULT_LIGHT;
}

export function readChosen(): ThemeSlug | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return isSlug(v) ? v : null;
  } catch {
    // Storage can be blocked (private mode); the theme then lasts for the visit only.
    return null;
  }
}

/** Writes the palette onto <html> as the literal role variables the tokens read. */
export function paint(slug: ThemeSlug | null): void {
  const s = document.documentElement.style;
  if (slug) {
    const t = THEMES[slug];
    for (const r of ROLES) s.setProperty(`--${r}`, t[r]);
    s.colorScheme = t.mode;
  } else {
    for (const r of ROLES) s.removeProperty(`--${r}`);
    s.removeProperty("color-scheme");
  }
}

export function choose(slug: ThemeSlug | null): void {
  paint(slug);
  try {
    if (slug) window.localStorage.setItem(STORAGE_KEY, slug);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // See readChosen.
  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT));
}

/** Runs before first paint so a chosen theme never flashes the default. */
export const bootScript = `(()=>{try{var t=${JSON.stringify(
  Object.fromEntries(Object.entries(THEMES).map(([k, v]) => [k, [v.mode, ...ROLES.map((r) => v[r])]])),
)},r=${JSON.stringify(ROLES)},v=localStorage.getItem(${JSON.stringify(STORAGE_KEY)}),p=t[v];if(!p)return;var s=document.documentElement.style;s.colorScheme=p[0];r.forEach(function(k,i){s.setProperty("--"+k,p[i+1])})}catch(e){}})()`;
