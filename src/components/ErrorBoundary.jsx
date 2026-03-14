import { Component } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
          <div className="glass rounded-2xl p-8 max-w-md w-full text-center space-y-4">
            <div className="flex justify-center">
              <AlertTriangle className="h-12 w-12 text-destructive/70" />
            </div>
            <h2 className="text-xl font-bold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
