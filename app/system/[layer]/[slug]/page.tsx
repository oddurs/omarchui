import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ENTRIES, entry } from "@/docs/registry";
import { ComponentDoc } from "@/docs/ui/ComponentDoc";

type Params = { layer: string; slug: string };

export function generateStaticParams(): Params[] {
  return ENTRIES.map((e) => ({ layer: e.layer, slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { layer, slug } = await params;
  const e = entry(layer, slug);
  return e ? { title: `${e.name} · System`, description: e.summary, alternates: { canonical: `/system/${layer}/${slug}` } } : {};
}

export default function Page({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={null}>
      <Doc params={params} />
    </Suspense>
  );
}

async function Doc({ params }: { params: Promise<Params> }) {
  const { layer, slug } = await params;
  const e = entry(layer, slug);
  if (!e) notFound();
  return <ComponentDoc e={e} />;
}
