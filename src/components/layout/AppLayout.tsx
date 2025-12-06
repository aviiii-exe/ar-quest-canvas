import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { TabNav } from './TabNav';
import { useAuth } from '@/hooks/useAuth';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {user && <TabNav />}
      <main className="container py-6 pb-20 sm:pb-6">{children}</main>
      {user && <BottomNav />}
    </div>
  );
}
