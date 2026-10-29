import type { ReactNode } from 'react';

interface LegalSectionProps {
  heading: string;
  children: ReactNode;
}

const LegalSection = ({ heading, children }: LegalSectionProps) => (
  <section>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">{heading}</h2>
    <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</div>
  </section>
);

export default LegalSection;
