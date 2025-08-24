"use client";
import { useEffect, useState } from "react";

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  suppressHydrationWarning?: boolean;
}

export default function ClientOnly({ 
  children, 
  fallback = null, 
  suppressHydrationWarning = false 
}: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  if (suppressHydrationWarning) {
    return <div suppressHydrationWarning={true}>{children}</div>;
  }

  return <>{children}</>;
}
