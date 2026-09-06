import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleFullReset = () => {
    try {
      // Clear all furina localStorage items to eliminate corrupt state
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('furina_') || key.includes('moviebox'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();
      
      // Unregister any stale service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          for (const reg of regs) {
            reg.unregister();
          }
        });
      }
    } catch (e) {
      console.error('Reset error:', e);
    }
    // Hard reload from server with timestamp to bust HTTP cache
    window.location.href = window.location.origin + window.location.pathname + '?nocache=' + Date.now();
  };

  render() {
    if (this.state.hasError) {
      // If used as a component-level boundary (e.g. around HeroBanner or Modal)
      if (this.props.inline) {
        return (
          <div className="p-6 bg-[#081024] border border-cyan-500/20 rounded-2xl text-center my-4">
            <p className="text-xs text-cyan-200/70 mb-2">Content temporarily unavailable in this section.</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30"
            >
              Try Reloading Section
            </button>
          </div>
        );
      }

      const errorMsg = this.state.error?.message || this.state.error?.toString() || 'Unknown Error';
      const errorStack = this.state.error?.stack || '';

      return (
        <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none">
          {/* Glowing Avatar */}
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400/60 shadow-[0_0_25px_rgba(56,189,248,0.5)] mb-4 animate-pulse">
            <img src="./favicon.png" alt="Furina" className="w-full h-full object-cover" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-xs sm:text-sm text-cyan-200/70 max-w-md mb-6 leading-relaxed">
            A temporary browser rendering or cached state sync glitch occurred. Tap below to reload or reset cached data.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-gray-950 font-bold text-xs transition shadow-[0_0_20px_rgba(56,189,248,0.4)] transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              🔄 Reload Furina MovieBox
            </button>

            <button
              onClick={this.handleFullReset}
              className="px-5 py-2.5 rounded-full bg-[#0c1836] hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold text-xs transition cursor-pointer"
              title="Clears corrupt local cache, unregisters stale service workers, and forces fresh reload"
            >
              🧹 Reset Cache & Clean Reload
            </button>
          </div>

          {/* Expandable Technical Details */}
          <div className="max-w-md w-full">
            <button
              onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
              className="text-[11px] text-cyan-400/60 hover:text-cyan-300 underline mb-2 cursor-pointer"
            >
              {this.state.showDetails ? 'Hide Details ▲' : 'Show Error Details ▼'}
            </button>

            {this.state.showDetails && (
              <div className="bg-[#050b1d] border border-cyan-500/20 rounded-xl p-3 text-left overflow-x-auto text-[10px] font-mono text-cyan-200/80 max-h-48 overflow-y-auto">
                <div className="font-bold text-red-400 mb-1">{errorMsg}</div>
                {errorStack && <pre className="whitespace-pre-wrap text-[9px] text-slate-400">{errorStack}</pre>}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
