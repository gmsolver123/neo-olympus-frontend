import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useUIStore } from '../../store/uiStore';
import { clsx } from 'clsx';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isSidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - hidden on mobile by default */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-40 lg:relative lg:z-0',
          'transition-transform duration-300 ease-out',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-void-950/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
