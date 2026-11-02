import { ButtonLink } from "@/design/components/ButtonLink";
import { Inline } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import { Notice } from "@/site/Notice";

export default function NotFound() {
  return (
    <Notice code="404 · empty workspace" title="Nothing is open here">
      <Text tone="muted">This address has no page. The desktop, the study and the system reference are where to go.</Text>
      <Inline gap="u2" wrap>
        <ButtonLink href="/" variant="primary">
          Boot the desktop
        </ButtonLink>
        <ButtonLink href="/study">Read the study</ButtonLink>
        <ButtonLink href="/system">Open the system</ButtonLink>
      </Inline>
    </Notice>
  );
}
