import React, { useEffect, useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { useModalA11y } from '../lib/useModalA11y';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __yemDeferredInstall?: BeforeInstallPromptEvent;
  }
}

const DISMISS_KEY = 'yem-install-dismissed';

const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true);

/**
 * Install YEMUNNAI as an app — centered modal:
 *  - Chrome/Android: captures `beforeinstallprompt` and shows the native install flow.
 *  - iOS Safari: shows the "Add to Home Screen" instructions instead.
 *  - Hidden when already installed or dismissed this session.
 */
export const InstallPrompt: React.FC = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    if (isStandalone()) return true;
    try { return sessionStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
  });

  useEffect(() => {
    const onPromptAvailable = () => {
      if (window.__yemDeferredInstall) setDeferred(window.__yemDeferredInstall);
    };

    // Catch events that fired before this component mounted.
    onPromptAvailable();
    window.addEventListener('yem-install-available', onPromptAvailable);

    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    if (isIOS && !isStandalone()) setShowIOS(true);

    return () => window.removeEventListener('yem-install-available', onPromptAvailable);
  }, []);

  const open = !dismissed && (!!deferred || showIOS);
  const sheetRef = useModalA11y<HTMLDivElement>(open, () => {
    setDismissed(true);
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* Storage can be disabled. */ }
  });

  if (!open) return null;

  const close = () => {
    setDismissed(true);
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* Storage can be disabled. */ }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    if (choice.outcome === 'accepted') close();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
      {/* Dimmed backdrop — tap to dismiss */}
      <div
        className="absolute inset-0"
        onClick={close}
        aria-hidden="true"
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Install YEMUNNAI"
        className="relative w-full max-w-sm rounded-3xl bg-[#1F140A] border border-emerald-500/30 shadow-2xl p-6 text-center text-white"
      >
        {/* Close */}
        <button
          type="button"
          onClick={close}
          aria-label="Dismiss install prompt"
          className="absolute top-3 right-3 min-w-11 min-h-11 flex items-center justify-center rounded-full bg-white/10"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* App icon — logo fills the tile completely */}
        <div className="mx-auto w-16 h-16 rounded-[20px] overflow-hidden shadow-lg">
          <img src="/images/NewLogo.svg" alt="YEMUNNAI" className="w-full h-full object-cover" />
        </div>

        <h2 className="mt-3.5 text-xl font-bold">Install YEMUNNAI</h2>

        {deferred ? (
          <>
            <p className="text-xs text-emerald-100/80 leading-relaxed mt-3">
              Keep the campus menu on your home screen. Live menus and orders need a connection.
            </p>
            <button
              type="button"
              onClick={install}
              className="mt-4 w-full min-h-11 rounded-2xl bg-[#F26A00] text-white font-bold flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Install app</span>
            </button>
            <button
              type="button"
              onClick={close}
              className="mt-2 min-h-11 text-xs text-white underline"
            >
              Not now
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-emerald-100/80 leading-relaxed mt-3 flex items-start justify-center gap-2">
              <Share2 className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              Tap the Share icon in Safari, then choose “Add to Home Screen”.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-4 w-full min-h-11 rounded-2xl bg-[#F26A00] text-white font-bold flex items-center justify-center gap-2"
            >
              Back to menu
            </button>
          </>
        )}
      </div>
    </div>
  );
};
