import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Foundation } from "@/docs/foundations";
import { FOUNDATIONS } from "@/docs/registry";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return FOUNDATIONS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const f = FOUNDATIONS.find((x) => x.slug === slug);
  return f ? { title: `${f.name} · System`, description: f.summary, alternates: { canonical: `/system/foundations/${slug}` } } : {};
}

export default function Page({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={null}>
      <Doc params={params} />
    </Suspense>
  );
}

async function Doc({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const f = FOUNDATIONS.find((x) => x.slug === slug);
  if (!f) notFound();
  return <Foundation slug={f.slug} />;
}
