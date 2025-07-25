'use client';

import { useState, useEffect } from 'react';

interface SystemSettings {
  emailEnabled: boolean;
  googleOAuthEnabled: boolean;
  externalServicesEnabled: boolean;
}

// Client-side hook to get system settings
export function useSystemSettings(): SystemSettings & { loading: boolean } {
  const [settings, setSettings] = useState<SystemSettings>({
    emailEnabled: true,
    googleOAuthEnabled: true,
    externalServicesEnabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/system-settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Failed to fetch system settings:', error);
        // Keep defaults on error
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { ...settings, loading };
}