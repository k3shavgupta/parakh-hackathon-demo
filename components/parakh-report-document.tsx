'use client';
/* oxlint-disable no-html-link-for-pages -- Use the same hard-navigation path as DemoProductHeader for Vinext. */
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { AiAttributionReasoningCard } from './ai-attribution-reasoning-card';
import { AiSummaryCard } from './ai-summary-card';
import { DemoProductHeader } from './demo-product-header';
import type { SyntheticReport } from '@/lib/synthetic-engine';
import { SCENARIOS } from '@/lib/synthetic-engine';
import type {
  ReportAiReasoningState,
  ReportAiSummaryState,
  ReportAiResponse,
} from '@/lib/report-ai-state';
import {
  EVIDENCE_SOURCE,
  FICTION_NOTICE,
  FILING_LABELS,
  filingStatus,
  fixtureMatchGrade,
  LABEL_GUIDE,
  nextCheck,
  REPORT_DISCLAIMER,
  reportSections,
} from '@/lib/report-layout';
import type { SyntheticLabel } from '@/lib/synthetic-fixtures';

function Badge({ label }: { label: SyntheticLabel }) {
  return (
    <span className={`report-badge report-badge-${label.toLowerCase()}`}>
      {label}
    </span>
  );
}
function Section({
  title,
  label,
  children,
}: {
  title: string;
  label?: SyntheticLabel;
  children: ReactNode;
}) {
  return (
    <section className="report-section">
      <div className="report-section-heading">
        <h2>{title}</h2>
        {label && <Badge label={label} />}
      </div>
      {children}
    </section>
  );
}
function Fact({ name, value }: { name: string; value: string }) {
  return (
    <div>
      <dt>{name}</dt>
      <dd>{value}</dd>
    </div>
  );
}
function Sheet({
  report,
  page,
  total,
  children,
}: {
  report: SyntheticReport;
  page: number;
  total: number;
  children: ReactNode;
}) {
  return (
    <article className="report-sheet">
      <header className="report-page-header">
        <div>
          <strong>Parakh</strong>
          <span>Synthetic due-diligence report</span>
        </div>
        <div>
          <span>REF {report.reportId}</span>
          <span>
            {report.generatedAt} · Page {page} of {total}
          </span>
        </div>
      </header>
      <div className="report-sheet-content">{children}</div>
      <footer className="report-page-footer">
        <p>{LABEL_GUIDE}</p>
        <p>
          <strong>{REPORT_DISCLAIMER}</strong>
        </p>
        <p>{FICTION_NOTICE}</p>
      </footer>
    </article>
  );
}

export function ParakhReportDocument({ report }: { report: SyntheticReport }) {
  const [reasoning, setReasoning] = useState<
    Record<string, ReportAiReasoningState>
  >(() =>
    Object.fromEntries(
      report.publicRecords.map((record) => [record.id, { status: 'loading' }]),
    ),
  );
  const [summary, setSummary] = useState<ReportAiSummaryState>({
    status: 'loading',
  });
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const sections = reportSections(report);
  const pages = 2 + report.publicRecords.length;

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40_000);
    let disposed = false;
    void (async () => {
      try {
        const response = await fetch('/api/ai-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: report.searchedIdentifier }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('AI report unavailable');
        const value = (await response.json()) as ReportAiResponse;
        if (
          !value ||
          !value.reasoning ||
          !['success', 'fallback'].includes(value.summary?.status)
        )
          throw new Error('Invalid AI report');
        if (!disposed) {
          setReasoning(value.reasoning);
          setSummary(value.summary);
        }
      } catch {
        if (!disposed) {
          setReasoning(
            Object.fromEntries(
              report.publicRecords.map((record) => [
                record.id,
                { status: 'fallback', fixtureSignal: record.signal },
              ]),
            ),
          );
          setSummary({ status: 'fallback' });
        }
      } finally {
        clearTimeout(timeout);
      }
    })();
    return () => {
      disposed = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [report.publicRecords, report.searchedIdentifier]);

  async function exportPdf(print: boolean) {
    setPdfBusy(true);
    setPdfError(null);
    // Open synchronously to retain the user's browser gesture for Print.
    const printWindow = print ? window.open('', '_blank') : null;
    try {
      const { createSyntheticReportPdf } = await import('@/lib/report-pdf');
      const bytes = await createSyntheticReportPdf(report, reasoning, summary);
      const url = URL.createObjectURL(
        new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }),
      );
      if (printWindow) printWindow.location.href = url;
      else {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report.reportId.toLowerCase()}-synthetic-report.pdf`;
        link.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      printWindow?.close();
      setPdfError('PDF preparation is unavailable. Please try again.');
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <main className="report-canvas">
      <DemoProductHeader
        hideWhenPrinting
        actions={
          <div className="report-actions">
            <button
              type="button"
              onClick={() => void exportPdf(true)}
              disabled={pdfBusy}
            >
              <Printer size={16} />
              Print PDF
            </button>
            <button
              type="button"
              onClick={() => void exportPdf(false)}
              disabled={pdfBusy}
              className="report-download"
            >
              <Download size={16} />
              {pdfBusy ? 'Preparing…' : 'Download PDF'}
            </button>
          </div>
        }
      />
      <div className="report-workspace">
        <nav
          className="report-toolbar print:hidden"
          aria-label="Report controls"
        >
          <a href="/">
            <ArrowLeft size={16} />
            Synthetic search
          </a>
          <label>
            Demo scenario
            <select
              value={report.searchedIdentifier}
              onChange={(event) => {
                window.location.href = `/report/${encodeURIComponent(event.target.value)}`;
              }}
            >
              {SCENARIOS.map((scenario) => (
                <option key={scenario.identifier} value={scenario.identifier}>
                  {scenario.shortName}
                </option>
              ))}
            </select>
          </label>
        </nav>
        {pdfError && (
          <p role="alert" className="report-error">
            {pdfError}
          </p>
        )}
        <Sheet report={report} page={1} total={pages}>
          <AiSummaryCard state={summary} />
          <section className="report-subject">
            <div>
              <p className="report-eyebrow">Subject · Entirely fictional</p>
              <h1>
                {report.business.tradeName} <em>record</em>
              </h1>
              <p>{report.business.legalName}</p>
              <p className="report-caption">
                {report.business.personName} · Fictional subject contact
              </p>
            </div>
            <dl className="report-subject-meta">
              <Fact name="Prepared for" value="Demo viewer" />
              <Fact name="Report number" value={report.reportId} />
              <Fact
                name="Searched date · fixture snapshot"
                value={report.generatedAt}
              />
            </dl>
          </section>
          <dl className="report-key-facts">
            <Fact
              name="GSTIN · fictional marker"
              value={report.searchedIdentifier}
            />
            <Fact
              name="PAN-pattern · fictional"
              value={report.business.syntheticPanPattern}
            />
            <Fact
              name="State · demo"
              value={report.business.registrationState}
            />
            <Fact name="Constitution" value={report.business.constitution} />
          </dl>
          <p className="report-address">
            <strong>Registered address · fictional</strong>{' '}
            {report.business.syntheticAddress}
          </p>
          <Section title="IDENTITY" label={sections.identity.label}>
            <p>{sections.identity.detail}</p>
          </Section>
          <Section title="REGISTRATION" label={sections.registrationLabel}>
            <dl className="report-inline-facts">
              <Fact name="Status" value={report.business.registrationStatus} />
              <Fact
                name="Registered date · fictional"
                value={report.business.registeredDate}
              />
            </dl>
          </Section>
          <Section title="GST RETURN FILING" label={sections.filingLabel}>
            <p className="report-caption">
              {sections.counts.periods} fixture periods · Each cell is one
              return; no live filing lookup.
            </p>
            <div
              className="report-filing-grid"
              style={
                {
                  '--period-count': report.filingPattern.rows.length,
                } as React.CSSProperties
              }
            >
              <span className="report-grid-label">Return</span>
              {report.filingPattern.rows.map((row) => (
                <span key={row.period} className="report-month">
                  {row.month}
                </span>
              ))}
              {(['gstr1', 'gstr3b'] as const).map((key) => (
                <div className="report-grid-row" key={key}>
                  <span className="report-grid-label">
                    {key === 'gstr1' ? 'GSTR-1' : 'GSTR-3B'}
                  </span>
                  {report.filingPattern.rows.map((row) => (
                    <span
                      key={row.period}
                      className={`report-filing-cell filing-${filingStatus(row[key])}`}
                      title={`${row.month} ${key === 'gstr1' ? 'GSTR-1' : 'GSTR-3B'}: ${FILING_LABELS[filingStatus(row[key])]}`}
                    >
                      {FILING_LABELS[filingStatus(row[key])]}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <table className="report-counts">
              <caption>Summary counts · individual returns</caption>
              <thead>
                <tr>
                  <th>Return</th>
                  <th>On time</th>
                  <th>Late</th>
                  <th>Not filed</th>
                  <th>Unavailable</th>
                </tr>
              </thead>
              <tbody>
                {(['gstr1', 'gstr3b'] as const).map((key) => (
                  <tr key={key}>
                    <th>{key === 'gstr1' ? 'GSTR-1' : 'GSTR-3B'}</th>
                    <td>{sections.counts[key].onTime}</td>
                    <td>{sections.counts[key].late}</td>
                    <td>{sections.counts[key].missing}</td>
                    <td>{sections.counts[key].unavailable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="report-caption">
              Not filed appears only for an explicit fixture marker. Unavailable
              means the fixture supplies no usable filing evidence.
            </p>
          </Section>
        </Sheet>
        <Sheet report={report} page={2} total={pages}>
          <div className="report-chapter-title">
            <p className="report-eyebrow">Scope and follow-up</p>
            <h2>
              Read with <em>context</em>
            </h2>
            <p>{report.business.legalName}</p>
          </div>
          <Section title="COURT RECORDS" label={sections.courtLabel}>
            <p>{sections.courtDetail}</p>
            <p className="report-caption">
              Source: {EVIDENCE_SOURCE} · Synthetic/demo records only.
            </p>
            {sections.registryRecords.length > 0 && (
              <p className="report-caption">
                {sections.registryRecords.length} separate registry candidate(s)
                appear in the evidence details. These are not court records.
              </p>
            )}
          </Section>
          <Section title="ENTITY CONTEXT" label="NOTE">
            <p>{report.business.context}</p>
          </Section>
          <Section title="What this check could not find">
            <ul className="report-limitations">
              {report.cannotFind.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="report-caption">
              No live systems were queried. An absent fixture record does not
              establish an absence of real-world records.
            </p>
          </Section>
          <section className="report-next-check">
            <p className="report-eyebrow">Next check</p>
            <h2>
              The next <em>document</em>
            </h2>
            <p>{nextCheck(report)}</p>
            <p className="report-caption">
              Suggested evidence-gathering step for this fictional example.
            </p>
          </section>
          <p className="report-boundary">{report.syntheticDisclosure}</p>
        </Sheet>
        {Array.from({ length: report.publicRecords.length }, (_, index) => (
          <Sheet key={index} report={report} page={index + 3} total={pages}>
            <div className="report-chapter-title">
              <p className="report-eyebrow">Synthetic evidence details</p>
              <h2>
                Record by <em>record</em>
              </h2>
              <p>
                {EVIDENCE_SOURCE} · Fictional candidates, with attribution shown
                separately.
              </p>
            </div>
            {report.publicRecords.slice(index, index + 1).map((record) => (
              <section key={record.id} className="report-record">
                <div className="report-section-heading">
                  <h3>{record.caseReference}</h3>
                  <Badge label={record.signal} />
                </div>
                <p>{record.summary}</p>
                <dl className="report-record-facts">
                  <Fact name="Role" value={record.role} />
                  <Fact
                    name="Case / record type"
                    value={
                      record.category === 'registry'
                        ? 'Registry entry (not a court case)'
                        : record.category === 'supplier-dispute'
                          ? 'Supplier dispute'
                          : record.category
                    }
                  />
                  <Fact
                    name="Fixture match grade"
                    value={fixtureMatchGrade(record)}
                  />
                  <Fact
                    name="Matched entity / candidate"
                    value={record.matchedEntity}
                  />
                  <Fact name="Search basis" value={record.matchBasis} />
                  <Fact name="Proceeding type" value={record.proceedingType} />
                  <Fact name="Filed year" value={record.filedYear} />
                  <Fact name="Court / registry" value={record.courtName} />
                </dl>
                <p className="report-identity-evidence">
                  <strong>Identity evidence</strong> {record.identityEvidence}
                </p>
                <p className="report-caption">
                  Source: {EVIDENCE_SOURCE} · {record.provenance}
                </p>
                <AiAttributionReasoningCard
                  recordId={record.id}
                  fixtureSignal={record.signal}
                  state={reasoning[record.id] ?? { status: 'loading' }}
                />
              </section>
            ))}
          </Sheet>
        ))}
      </div>
    </main>
  );
}
