/* oxlint-disable no-html-link-for-pages -- Vercel's Vinext adapter requires hard navigation for reliable public routes. */
import type { ReactNode } from 'react';

export function DemoProductHeader({
  actions,
  hideWhenPrinting = false,
}: {
  actions?: ReactNode;
  hideWhenPrinting?: boolean;
}) {
  return (
    <nav className={`demo-production-nav${hideWhenPrinting ? ' print:hidden' : ''}`}>
      <div className="demo-production-nav__inner">
        <a href="/" aria-label="Parakh demo home" className="demo-production-logo">
          <img src="/assets/logo-horizontal.svg" alt="" width={130} height={32} />
        </a>
        <div className="demo-production-nav__links" aria-label="Demo navigation">
          <a href="/#journey">How it works</a>
          <a href="/#demo">Sample report</a>
          <a href="/#method">Methodology</a>
          <a href="/#boundary">FAQ</a>
          <a href="/synthetic-data">Evidence Lab</a>
        </div>
        {actions ? <div className="demo-production-nav__tools">{actions}</div> : null}
      </div>
    </nav>
  );
}
