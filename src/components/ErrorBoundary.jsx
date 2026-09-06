import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem('furina_moviebox_server');
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400/60 shadow-[0_0_20px_rgba(56,189,248,0.5)] mb-4">
            <img src="./favicon.png" alt="Furina" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h2>
          <p className="text-xs text-cyan-200/60 max-w-sm mb-6">
            A temporary streaming or network sync glitch occurred. Tap below to reload the app with fresh data.
          </p>
          <button
            onClick={this.handleReload}
            className="px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs transition shadow-[0_0_15px_rgba(56,189,248,0.4)]"
          >
            🔄 Reload Furina MovieBox
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
