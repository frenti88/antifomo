import { ReactNode } from 'react';

interface EditorialSectionProps {
  title: string;
  subtitle?: string;
  symbol?: string;
  children: ReactNode;
  id?: string;
}

export function EditorialSection({ title, subtitle, symbol, children, id }: EditorialSectionProps) {
  const headingId = id ? `${id}-title` : undefined;
  
  return (
    <section id={id} aria-labelledby={headingId} className="py-6 border-b border-border">
      <div className="mb-4">
        <h2 id={headingId} className="text-xl font-bold text-text flex items-center gap-2">
          {symbol && <span className="text-accent" aria-hidden="true">{symbol}</span>}
          {title}
        </h2>
        {subtitle && <p className="text-sm text-secondary mt-1">{subtitle}</p>}
      </div>
      <div>
        {children}
      </div>
    </section>
  );
}
