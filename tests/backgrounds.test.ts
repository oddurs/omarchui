import { describe, expect, it } from "vitest";
import { openPicker, pickerItems } from "@/demo/picker-state";
import { initialState, reducer, type State } from "@/demo/state";
import { backgroundIndex, backgroundName, backgroundsOf } from "@/lib/backgrounds";
import { OMARCHY_BACKGROUNDS } from "@/lib/themes.generated";

const desk = (): State => ({ ...initialState("tokyo-night"), phase: "desktop" });
const shown = (s: State) => backgroundIndex(s.theme, s.bg[s.theme]);

describe("theme backgrounds, as omarchy-theme-set chooses them", () => {
  it("lists each theme's backgrounds in Omarchy's order", () => {
    // research/omarchy/spec/theming.json, theme.tokyo-night
    expect(backgroundsOf("tokyo-night").map((b) => b.file)).toEqual([
      "0-liftoff.webp",
      "1-winding-road.webp",
      "2-quattro.webp",
      "3-swirl-buck.webp",
      "4-sunset-lake.webp",
      "5-omakub.webp",
      "6-oma-cityscape.jpg",
      "7-oma.webp",
      "omarchy.webp",
    ]);
    expect(Object.values(OMARCHY_BACKGROUNDS).every((t) => t.backgrounds.length > 0)).toBe(true);
  });

  it("starts a theme on its first background", () => {
    expect(shown(desk())).toBe(0);
  });

  it("returns to the background last used in a theme (omarchy-theme-set:186-196)", () => {
    let s = reducer(desk(), { type: "background", index: 3 });
    s = reducer(s, { type: "theme", slug: "gruvbox" });
    expect(shown(s)).toBe(0);
    s = reducer(s, { type: "theme", slug: "tokyo-night" });
    expect(shown(s)).toBe(3);
  });

  it("moves to the next background when the current theme is chosen again, wrapping (omarchy-theme-set:163-184)", () => {
    let s = reducer(desk(), { type: "background", index: 8 });
    s = reducer(s, { type: "theme", slug: "tokyo-night" });
    expect(shown(s)).toBe(0);
    s = reducer(s, { type: "theme", slug: "tokyo-night" });
    expect(shown(s)).toBe(1);
  });

  it("bg-next advances and wraps (omarchy-theme-bg-next:19-48)", () => {
    let s = desk();
    for (let i = 0; i < backgroundsOf("tokyo-night").length; i++) s = reducer(s, { type: "bg-next" });
    expect(shown(s)).toBe(0);
  });

  it("names a background the way omarchy-theme-bg-current prints it", () => {
    expect(backgroundName("0-liftoff.webp")).toBe("Liftoff");
    expect(backgroundName("6-oma-cityscape.jpg")).toBe("Oma Cityscape");
    expect(backgroundName("omarchy.webp")).toBe("Omarchy");
  });
});

describe("the image picker", () => {
  it("opens on what is in use", () => {
    const s = reducer(desk(), { type: "background", index: 2 });
    expect(openPicker("background", s).sel).toBe(2);
    const p = openPicker("theme", s);
    expect(pickerItems(p, s)[p.sel]?.theme).toBe("tokyo-night");
  });

  it("filters themes by name and lists every background of the current theme", () => {
    const s = desk();
    expect(pickerItems({ mode: "theme", sel: 0, q: "gru" }, s).map((i) => i.label)).toEqual(["Gruvbox"]);
    expect(pickerItems({ mode: "background", sel: 0, q: "" }, s)).toHaveLength(9);
  });

  it("closes once a choice is applied", () => {
    let s = reducer(desk(), { type: "picker", picker: openPicker("background", desk()) });
    s = reducer(s, { type: "background", index: 1 });
    expect(s.picker).toBeNull();
  });
});
