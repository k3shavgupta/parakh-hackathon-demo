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
        <a href="/" aria-label="Parakh demo home" className="demo-production-logo flex items-center gap-2.5 shrink-0">
          <img src="/assets/logo-horizontal.svg" alt="Parakh" width={124} height={30} className="h-7 w-auto shrink-0" />
          <span className="text-[#d8b6cf] font-light select-none">|</span>
          <span className="text-[0.65rem] font-bold tracking-widest text-[#8a7982] whitespace-nowrap uppercase">
            FACTUAL DUE DILIGENCE ENGINE
          </span>
        </a>
        <div className="demo-production-nav__links" aria-label="Demo navigation">
          <a href="/#journey">How it works</a>
          <a href="/#demo">Sample report</a>
          <a href="/#method">Methodology</a>
          <a href="/#boundary">FAQ</a>
          <a href="/synthetic-data">Evidence Lab</a>
        </div>
        {actions ? <div className="demo-production-nav__tools shrink-0">{actions}</div> : null}
      </div>
    </nav>
  );
}
