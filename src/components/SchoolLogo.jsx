import { useEffect, useState } from 'react';
import { School } from 'lucide-react';
import { cn } from '../lib/utils.js';
import { getAppSettings, getStoredSettings } from '../features/settings/settingsService.js';

export default function SchoolLogo({ className, fallbackClassName, showImageOnly = false }) {
  const [settings, setSettings] = useState(() => getStoredSettings());
  const [defaultLogoFailed, setDefaultLogoFailed] = useState(false);
  const logoUrl = settings?.logoUrl || (!defaultLogoFailed ? '/logo.png' : '');

  useEffect(() => {
    let isMounted = true;

    getAppSettings()
      .then((nextSettings) => {
        if (isMounted) {
          setSettings(nextSettings);
        }
      })
      .catch(() => {});

    function handleUpdate(event) {
      setSettings(event.detail || getStoredSettings());
    }

    window.addEventListener('school-settings-updated', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('school-settings-updated', handleUpdate);
    };
  }, []);

  if (logoUrl) {
    return (
      <span className={cn('grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200', className)}>
        <img alt="Logo sekolah" className="h-full w-full object-contain p-1.5" src={logoUrl} onError={() => setDefaultLogoFailed(true)} />
      </span>
    );
  }

  if (showImageOnly) {
    return null;
  }

  return (
    <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500 font-black text-slate-950', className, fallbackClassName)}>
      <School className="h-5 w-5" />
    </span>
  );
}
