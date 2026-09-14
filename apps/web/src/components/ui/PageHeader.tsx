interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  borderless?: boolean;
}

interface PageHeaderClassNameProps {
  className?: string;
}

export function PageHeader({ title, description, action, className, borderless }: PageHeaderProps & PageHeaderClassNameProps): JSX.Element {
  return (
    <div className={`${borderless ? 'mb-8 lg:mb-10' : 'border-b border-border pb-6 mb-8 lg:mb-10'} ${className ?? ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="mt-3 text-base sm:text-lg text-text-secondary max-w-prose font-body">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    </div>
  );
}
