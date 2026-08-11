'use client';

import { usePathname } from 'next/navigation';
import { AdminLayoutShell } from '../../components/admin/AdminLayoutShell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';
  if (isLogin) {
    return <>{children}</>;
  }
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
