import type { ReactNode } from "react";
import { Stack } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";

/** A titled block inside a reference page. */
export function DocSection({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <Stack gap="u4" as="section" aria-labelledby={id}>
      <Text as="h2" variant="title" id={id}>
        {title}
      </Text>
      {children}
    </Stack>
  );
}
