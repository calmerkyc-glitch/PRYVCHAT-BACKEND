import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // keep logging to console for developer
    console.error("ErrorBoundary caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-900">
          <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-lg">
            <h3 className="text-lg font-semibold">Something went wrong</h3>
            <p className="mt-3 text-sm text-slate-600">We encountered an unexpected error. The issue has been logged to the console.</p>
            <div className="mt-4">
              <button
                className="rounded-md bg-indigo-950 px-4 py-2 text-white"
                onClick={() => window.location.reload()}
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
