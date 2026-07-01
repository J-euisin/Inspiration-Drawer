'use client';

import { NavigationGuardProvider } from '@/lib/navigation-guard-context';
import Navigation from '@/components/Navigation';
import { ReactNode } from 'react';

export default function ClientShell({ children }: { children: ReactNode }) {
  return (
    <NavigationGuardProvider>
      <Navigation />
      <main>{children}</main>
    </NavigationGuardProvider>
  );
}
