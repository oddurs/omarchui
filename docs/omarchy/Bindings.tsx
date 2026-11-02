"use client";

import { useMemo, useState } from "react";
import { Chord } from "@/design/components/Kbd";
import { TextField } from "@/design/components/TextField";
import { Stack } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import { Cite } from "./Cite";
import { FactTable } from "./Facts";

export type BindingRow = { chord: string; description: string; group: string; source: string; condition: string | null };

/** All of Omarchy's bindings, filterable by key or description. */
export function Bindings({ rows, groups }: { rows: BindingRow[]; groups: { group: string; file: string; covers: string }[] }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? rows.filter((r) => `${r.chord} ${r.description} ${r.group}`.toLowerCase().includes(s)) : rows;
  }, [q, rows]);

  return (
    <Stack gap="u6">
      <TextField
        label="Filter bindings"
        placeholder="e.g. space, workspace, screenshot"
        value={q}
        onChange={setQ}
        description={`${shown.length} of ${rows.length} shown`}
      />
      {groups.map((g) => {
        const inGroup = shown.filter((r) => r.group === g.group);
        if (!inGroup.length) return null;
        return (
          <Stack key={g.group} gap="u3">
            <Stack gap="u1">
              <Text as="h3" variant="small" weight="semibold">
                {g.group} · {inGroup.length}
              </Text>
              <Text variant="caption" tone="faint">
                {g.file}: {g.covers}
              </Text>
            </Stack>
            <FactTable
              label={`${g.group} bindings`}
              head={["Keys", "Does", "Source"]}
              rows={inGroup.map((r) => [
                <Chord key="k" chord={r.chord} />,
                <span key="d">
                  {r.description}
                  {r.condition ? (
                    <Text as="span" variant="caption" tone="faint">
                      {" "}
                      ({r.condition})
                    </Text>
                  ) : null}
                </span>,
                <Cite key="c" source={r.source} />,
              ])}
            />
          </Stack>
        );
      })}
    </Stack>
  );
}
