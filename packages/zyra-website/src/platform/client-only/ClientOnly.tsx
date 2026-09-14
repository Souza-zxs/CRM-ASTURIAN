'use client';

import { Suspense, useEffect, useState, type ReactNode } from 'react';

export type ClientOnlyProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

// Replaces next/dynamic(..., { ssr: false }): renders nothing during the
// prerender pass (useEffect never fires there), then mounts children on the
// client after hydration. Pair with lazy() on the wrapped component for the
// same code-splitting next/dynamic gave for free.
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return <>{fallback}</>;
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
