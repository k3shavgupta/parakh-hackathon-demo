import type { ReactNode } from 'react';
import Link from 'next/link';

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
        <Link href="/" aria-label="Parakh demo home" className="demo-production-logo">
          <img src="/assets/logo-horizontal.svg" alt="" width={130} height={32} />
        </Link>
        <div className="demo-production-nav__links" aria-label="Demo navigation">
          <Link href="/#journey">How it works</Link>
          <Link href="/#demo">Sample report</Link>
          <Link href="/#method">Methodology</Link>
          <Link href="/#boundary">FAQ</Link>
          <Link href="/synthetic-data">Evidence Lab</Link>
        </div>
        {actions ? <div className="demo-production-nav__tools">{actions}</div> : null}
      </div>
    </nav>
  );
}
