'use client';

import { WhopApp } from '@whop/react/components';
import { useEffect, useState } from 'react';

export function WhopProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render WhopApp until client-side hydration is complete
  if (!mounted) {
    return <>{children}</>;
  }

  // Check if Whop is configured
  const hasWhopConfig = process.env.NEXT_PUBLIC_WHOP_APP_ID;

  if (!hasWhopConfig) {
    return <>{children}</>;
  }

  return <WhopApp>{children}</WhopApp>;
}

