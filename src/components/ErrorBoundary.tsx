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
        <div className="consumer-ui campus-welcome text-center">
          <div className="campus-surface w-full max-w-md p-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center text-3xl">
              🍲
            </div>
            <h1 className="text-xl font-bold">Unable to display this page</h1>
            <p className="campus-muted">
              Reload to try again. Saved order tracking stays on this device.
            </p>
            {import.meta.env.DEV && this.state.error?.message && (
              <div className="p-3 rounded-xl bg-black/40 text-[11px] text-amber-300 font-mono text-left overflow-auto max-h-24 border border-white/10">
                {this.state.error.message}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                window.location.reload();
              }}
              className="campus-primary"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
