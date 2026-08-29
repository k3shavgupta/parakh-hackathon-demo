/* oxlint-disable no-html-link-for-pages -- Vercel's Vinext adapter requires hard navigation for reliable public routes. */
import { DemoProductHeader } from '@/components/demo-product-header';
import { ParakhReportDocument } from '@/components/parakh-report-document';
import { buildSyntheticReport } from '@/lib/synthetic-engine';

export default async function SyntheticReportPage({
  params,
}: {
  params: Promise<{ identifier: string }>;
}) {
  const { identifier } = await params;
  let report: ReturnType<typeof buildSyntheticReport>;

  try {
    report = buildSyntheticReport(decodeURIComponent(identifier));
  } catch {
    return (
      <main className="min-h-screen bg-[#fbf8f5] text-[#201b1e]">
        <DemoProductHeader />
        <section className="mx-auto mt-12 max-w-2xl rounded-[32px] bg-white p-8 text-center shadow-[0_20px_70px_rgba(42,24,31,0.08)] sm:mt-16">
          <p className="inline-flex rounded-full bg-[#fbf2f7] px-3 py-1 text-xs font-semibold text-[#7a336f]">
            Synthetic demo only
          </p>
          <h1 className="mt-5 text-4xl font-semibold">
            No report fixture found
          </h1>
          <p className="mt-4 leading-7 text-[#675b63]">
            This hackathon demo only accepts the five listed Demo References.
            Real GSTINs, PANs, Aadhaar numbers, OTPs, and
            production Parakh data are not used.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-[#201b1e] px-5 text-sm font-semibold text-white"
          >
            Back to demo search
          </a>
        </section>
      </main>
    );
  }

  return <ParakhReportDocument report={report} />;
}
