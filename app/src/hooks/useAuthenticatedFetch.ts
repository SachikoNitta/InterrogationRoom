'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export function useAuthenticatedFetch() {
  const { getIdToken } = useAuth();

  const authenticatedFetch = useCallback(
    async (url: string, options: FetchOptions = {}) => {
      const token = await getIdToken();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      return fetch(url, {
        ...options,
        headers,
      });
    },
    [getIdToken]
  );

  return authenticatedFetch;
}