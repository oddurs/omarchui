import data from "./props.json";

export type PropDoc = { name: string; type: string; required: boolean; doc: string };
export type ComponentProps = { file: string; type: string; props: PropDoc[]; inherits: string[] };

const PROPS = data as Record<string, ComponentProps>;

export function propsOf(name: string): ComponentProps | null {
  return PROPS[name] ?? null;
}
