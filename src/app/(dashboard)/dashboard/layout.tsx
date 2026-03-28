import type { Metadata } from 'next';
import { DashboardGuard } from '@/components/dashboard/DashboardGuard';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import layoutStyles from '@/components/dashboard/DashboardLayout.module.css';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard>
      <div className={layoutStyles.shell}>
        <DashboardSidebar />
        <div className={layoutStyles.main}>
          {children}
        </div>
      </div>
    </DashboardGuard>
  );
}
