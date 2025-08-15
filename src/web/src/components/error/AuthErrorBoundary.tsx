import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log auth-specific errors
    if (import.meta.env.DEV) {
      console.error('AuthErrorBoundary caught an error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleGoToLogin = () => {
    // Reset error state and potentially redirect to login
    this.setState({ hasError: false, error: undefined });
    // You might want to trigger a navigation to login page here
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center p-6">
          <div className="max-w-sm w-full bg-white border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-center w-10 h-10 mx-auto bg-red-100 rounded-full mb-4">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Authentication Error
            </h3>

            <p className="text-sm text-gray-600 text-center mb-4">
              There was a problem with the authentication system. Please try again.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-xs">
                <strong className="text-red-800">Dev Error:</strong>
                <div className="text-red-700 mt-1 font-mono">
                  {this.state.error.message}
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-2">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoToLogin}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm hover:bg-gray-200 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;
