import { permanentRedirect } from "next/navigation";

/** Renamed to /walkthroughs/[slug] (VIB-120). See the index redirect beside this. */
export default async function WizardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/walkthroughs/${slug}`);
}
