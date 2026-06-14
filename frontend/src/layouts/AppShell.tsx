import React from 'react';
import { FeatureSidebar } from '../components/FeatureSidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      <FeatureSidebar />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}
