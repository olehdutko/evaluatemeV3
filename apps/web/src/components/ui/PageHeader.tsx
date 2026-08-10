interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps): JSX.Element {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && <p className="text-slate-600">{description}</p>}
    </div>
  );
}
