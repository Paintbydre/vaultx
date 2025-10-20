'use client';

import { useEffect, useState } from 'react';

export function WhopProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [WhopApp, setWhopApp] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    // Only import WhopApp on the client side if configured
    const hasWhopConfig = process.env.NEXT_PUBLIC_WHOP_APP_ID;
    
    if (hasWhopConfig) {
      import('@whop/react/components').then((module) => {
        setWhopApp(() => module.WhopApp);
      }).catch((error) => {
        console.warn('Failed to load Whop SDK:', error);
      });
    }
  }, []);

  // Don't render WhopApp until client-side hydration is complete and SDK is loaded
  if (!mounted || !WhopApp) {
    return <>{children}</>;
  }

  return <WhopApp>{children}</WhopApp>;
}

