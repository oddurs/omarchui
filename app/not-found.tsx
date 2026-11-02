import { ButtonLink } from "@/design/components/ButtonLink";
import { Inline } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import { Notice } from "@/site/Notice";

export default function NotFound() {
  return (
    <Notice code="404 · empty workspace" title="Nothing is open here">
      <Text tone="muted">This address has no page. The exposition, the system reference and the demo are the three that exist.</Text>
      <Inline gap="u2" wrap>
        <ButtonLink href="/" variant="primary">
          Read the exposition
        </ButtonLink>
        <ButtonLink href="/system">Open the system</ButtonLink>
        <ButtonLink href="/demo">Launch the demo</ButtonLink>
      </Inline>
    </Notice>
  );
}
