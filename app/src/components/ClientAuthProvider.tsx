'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface ClientAuthProviderProps {
  children: React.ReactNode;
}

export function ClientAuthProvider({ children }: ClientAuthProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return a basic loading state during SSR/hydration
    return <div className="min-h-screen flex items-center justify-center">
      <div>Loading...</div>
    </div>;
  }

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}