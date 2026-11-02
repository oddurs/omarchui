import * as stylex from "@stylexjs/stylex";
import type { Metadata } from "next";
import { Row, Rows } from "@/design/components/Rows";
import { TextLink } from "@/design/components/TextLink";
import { Stack } from "@/design/primitives/Stack";
import { Text } from "@/design/primitives/Text";
import { size } from "@/design/tokens/size.stylex";
import { space } from "@/design/tokens/space.stylex";
import { Header } from "@/site/Header";

export const metadata: Metadata = {
  title: "Contact",
  description: "Where to send corrections, questions and ideas about Omarchui, and where Omarchy itself lives.",
  alternates: { canonical: "/contact" },
};

const REPO = "https://github.com/oddurs/omarchui";

const WAYS = [
  {
    what: "Something about Omarchy is wrong here",
    how: "Open an issue with the file and line in Omarchy's source. Every claim on this site is meant to be checkable.",
    href: `${REPO}/issues/new`,
    link: "Report a correction",
  },
  {
    what: "A question, or an idea for the tune",
    how: "Issues are the place for both. Say which part and which principle it touches.",
    href: `${REPO}/issues`,
    link: "Open the issues",
  },
  {
    what: "The source",
    how: "The site, the design system and the desktop are one repository. Pull requests are welcome.",
    href: REPO,
    link: "github.com/oddurs/omarchui",
  },
  {
    what: "Omarchy itself",
    how: "Omarchui is an unofficial study. Omarchy is made by DHH and contributors; its bugs and requests belong with them.",
    href: "https://omarchy.org",
    link: "omarchy.org",
  },
] as const;

const s = stylex.create({
  main: {
    maxWidth: size.page,
    marginInline: "auto",
    paddingBlock: `${space.u12} ${space.u16}`,
    paddingLeft: `max(${space.u4}, env(safe-area-inset-left, 0px))`,
    paddingRight: `max(${space.u4}, env(safe-area-inset-right, 0px))`,
    outline: "none",
  },
});

export default function ContactPage() {
  return (
    <>
      <Header sections={false} />
      <main id="main" tabIndex={-1} {...stylex.props(s.main)}>
        <Stack gap="u8">
          <Stack gap="u3">
            <Text as="h1" variant="heading">
              Contact
            </Text>
            <Text variant="lede" tone="muted" measure>
              Corrections, questions and ideas all go through the repository, where they stay public and can be checked.
            </Text>
          </Stack>
          <Rows>
            {WAYS.map((w) => (
              <Row key={w.what} layout="keyed">
                <Text as="h2" variant="title">
                  {w.what}
                </Text>
                <Stack gap="u2">
                  <Text tone="muted" measure>
                    {w.how}
                  </Text>
                  <Text as="span">
                    <TextLink href={w.href} external>
                      {w.link}
                    </TextLink>
                  </Text>
                </Stack>
              </Row>
            ))}
          </Rows>
        </Stack>
      </main>
    </>
  );
}
