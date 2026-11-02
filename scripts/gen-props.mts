// Reads each design-system component's exported `…Props` type with the TypeScript
// compiler and writes docs/props.json, so prop tables in /system cannot drift from code.
// Usage: node scripts/gen-props.mts [--check]
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const OUT = path.join(root, "docs/props.json");

// Component name → [file, exported props type]. Order is the order shown in docs.
const TARGETS: Record<string, [string, string]> = {
  Box: ["design/primitives/Box.tsx", "BoxProps"],
  Stack: ["design/primitives/Stack.tsx", "StackProps"],
  Inline: ["design/primitives/Stack.tsx", "InlineProps"],
  Grid: ["design/primitives/Grid.tsx", "GridProps"],
  Text: ["design/primitives/Text.tsx", "TextProps"],
  Intro: ["design/patterns/Intro.tsx", "IntroProps"],
  Button: ["design/components/Button.tsx", "ButtonProps"],
  ButtonLink: ["design/components/ButtonLink.tsx", "ButtonLinkProps"],
  TextLink: ["design/components/TextLink.tsx", "TextLinkProps"],
  Checkbox: ["design/components/Checkbox.tsx", "CheckboxProps"],
  Switch: ["design/components/Switch.tsx", "SwitchProps"],
  Segmented: ["design/components/Segmented.tsx", "SegmentedProps"],
  TextField: ["design/components/TextField.tsx", "TextFieldProps"],
  Menu: ["design/components/Menu.tsx", "MenuProps"],
  Tooltip: ["design/components/Tooltip.tsx", "TooltipProps"],
  Kbd: ["design/components/Kbd.tsx", "KbdProps"],
  Chord: ["design/components/Kbd.tsx", "ChordProps"],
  Tag: ["design/components/Tag.tsx", "TagProps"],
  Swatch: ["design/components/Swatch.tsx", "SwatchProps"],
  CodeBlock: ["design/components/CodeBlock.tsx", "CodeBlockProps"],
  Rows: ["design/components/Rows.tsx", "RowsProps"],
  Row: ["design/components/Rows.tsx", "RowProps"],
  Bar: ["design/shell/Bar.tsx", "BarProps"],
  WindowFrame: ["design/shell/WindowFrame.tsx", "WindowFrameProps"],
  MenuPanel: ["design/shell/MenuPanel.tsx", "MenuPanelProps"],
  Toast: ["design/shell/Toast.tsx", "ToastProps"],
  Osd: ["design/shell/Osd.tsx", "OsdProps"],
  LockPanel: ["design/shell/LockPanel.tsx", "LockPanelProps"],
  Icon: ["design/shell/Icon.tsx", "IconProps"],
  Mark: ["design/shell/Icon.tsx", "MarkProps"],
};

export type PropDoc = { name: string; type: string; required: boolean; doc: string };
export type ComponentProps = { file: string; type: string; props: PropDoc[]; inherits: string[] };

const files = [...new Set(Object.values(TARGETS).map(([f]) => path.join(root, f)))];
const config = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const program = ts.createProgram(files, { ...parsed.options, noEmit: true });
const checker = program.getTypeChecker();

const result: Record<string, ComponentProps> = {};
for (const [name, [file, typeName]] of Object.entries(TARGETS)) {
  const source = program.getSourceFile(path.join(root, file));
  if (!source) throw new Error(`gen-props: cannot read ${file}`);
  const decl = source.statements.find((n): n is ts.TypeAliasDeclaration => ts.isTypeAliasDeclaration(n) && n.name.text === typeName);
  if (!decl) throw new Error(`gen-props: ${file} exports no type ${typeName}`);
  const type = checker.getTypeAtLocation(decl.name);
  const props: PropDoc[] = [];
  const inherits = new Set<string>();
  for (const sym of checker.getPropertiesOfType(type)) {
    const d = sym.declarations?.[0];
    const from = d?.getSourceFile().fileName ?? "";
    if (from.includes("node_modules")) {
      // Props that come from a headless library are summarised, not listed one by one.
      const pkg = /node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?((?:@[^/]+\/)?[^/]+)/.exec(from)?.[1];
      if (pkg) inherits.add(pkg);
      continue;
    }
    const t = checker.getTypeOfSymbolAtLocation(sym, decl);
    const flags = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType;
    // Spell out unions of literals ('primary' | 'ghost') instead of naming their alias.
    const literalUnion = t.isUnion() && t.types.every((m) => m.isLiteral() || (m.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.BooleanLiteral)) !== 0);
    const text = literalUnion
      ? (t as ts.UnionType).types
          .filter((m) => !(m.flags & ts.TypeFlags.Undefined))
          .map((m) => checker.typeToString(m, decl, flags))
          .join(" | ")
          .replace("false | true", "boolean")
      : checker.typeToString(t, decl, flags);
    props.push({
      name: sym.name,
      // Drop module qualifiers: they are absolute paths and say nothing to a reader.
      type: text.replace(/import\("[^"]+"\)\./g, "").replace(/ \| undefined$/, ""),
      required: !(sym.flags & ts.SymbolFlags.Optional),
      doc: ts.displayPartsToString(sym.getDocumentationComment(checker)),
    });
  }
  props.sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name));
  result[name] = { file, type: typeName, props, inherits: [...inherits].sort() };
}

const json = JSON.stringify(result, null, 2) + "\n";
if (process.argv.includes("--check")) {
  const current = readFileSync(OUT, "utf8");
  if (current !== json) {
    console.error("docs/props.json is stale. Run: node scripts/gen-props.mts");
    process.exit(1);
  }
} else {
  writeFileSync(OUT, json);
  console.log(`wrote ${Object.keys(result).length} components to docs/props.json`);
}
