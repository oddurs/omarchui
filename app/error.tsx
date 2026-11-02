"use client";

import { Button } from "@/design/components/Button";
import { Text } from "@/design/primitives/Text";
import { Notice } from "@/site/Notice";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Notice code={error.digest ? `Error · ${error.digest}` : "Error"} title="This page crashed">
      <Text tone="muted">Something threw while rendering. Try again; if it keeps happening, the digest above identifies it in the server log.</Text>
      <Button variant="primary" onPress={reset}>
        Try again
      </Button>
    </Notice>
  );
}
