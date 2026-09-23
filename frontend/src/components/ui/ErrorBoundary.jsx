import { Component } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Button from "./Button";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In a production build this is where you'd forward to an error-tracking service.
    console.error("CareerOS crashed:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-950 px-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-300">
            <AlertTriangle size={26} />
          </span>
          <div>
            <h1 className="font-display text-xl font-semibold text-white">Something went wrong</h1>
            <p className="mt-1.5 max-w-sm text-sm text-ink-300">
              This part of CareerOS hit an unexpected error. Your data is safe — try reloading this section.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={this.handleReset}>
              <RotateCcw size={15} /> Try again
            </Button>
            <Button variant="secondary" onClick={() => (window.location.href = "/")}>
              Back to home
            </Button>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-4 max-w-lg overflow-auto rounded-lg bg-ink-900 p-4 text-left text-xs text-red-300">
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
