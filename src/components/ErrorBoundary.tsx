import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled app error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#111A15] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-full max-w-97.5 p-6 rounded-4xl bg-[#0A2E20] border border-emerald-500/30 shadow-2xl space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center text-3xl">
              🍲
            </div>
            <h1 className="text-xl font-black text-white">YEMUNNAI</h1>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              We encountered a minor display hiccup, but campus food radar is safe.
            </p>
            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-black/40 text-[11px] text-amber-300 font-mono text-left overflow-auto max-h-24 border border-white/10">
                {this.state.error.message}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                try {
                  window.localStorage?.clear();
                } catch {
                  // Ignore
                }
                window.location.reload();
              }}
              className="w-full py-3 rounded-2xl bg-linear-to-r from-[#F26A00] to-[#E05D00] text-white text-xs font-black tracking-wider shadow-lg cursor-pointer hover:brightness-110 active:scale-95 transition-all"
            >
              RELOAD APP →
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
