import { AdminLayoutShell } from '../../components/admin/AdminLayoutShell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
