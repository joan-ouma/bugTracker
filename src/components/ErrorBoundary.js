import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            componentStack: ''
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('💥 Error caught by boundary:', error);
        console.error('📝 Component stack:', errorInfo.componentStack);

        this.setState({
            error: error,
            errorInfo: errorInfo,
            componentStack: errorInfo.componentStack
        });

        if (process.env.NODE_ENV === 'production') {
            this.reportError(error, errorInfo);
        }
    }

    reportError = (error, errorInfo) => {
        console.log('📊 Sending error to monitoring service:', {
            error: error.toString(),
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            url: window.location.href,
            userAgent: navigator.userAgent
        });
    };

    handleTryAgain = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleResetApp = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
                        <div className="text-center">
                            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🐛</span>
                            </div>
                            <h2 className="mt-4 text-xl font-bold text-gray-900">
                                Something went wrong
                            </h2>
                            <p className="mt-2 text-gray-600">
                                We apologize for the inconvenience. Please try again.
                            </p>

                            {process.env.NODE_ENV === 'development' && (
                                <details className="mt-4 text-left">
                                    <summary className="cursor-pointer text-sm font-medium text-gray-700">
                                        Error Details (Development)
                                    </summary>
                                    <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono">
                                        <div><strong>Error:</strong> {this.state.error?.toString()}</div>
                                        <div className="mt-2"><strong>Stack:</strong> {this.state.error?.stack}</div>
                                        <div className="mt-2"><strong>Component Stack:</strong> {this.state.componentStack}</div>
                                    </div>
                                </details>
                            )}

                            <div className="mt-6 flex space-x-3">
                                <button
                                    onClick={this.handleTryAgain}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={this.handleResetApp}
                                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Reload App
                                </button>
                            </div>

                            <div className="mt-4 text-xs text-gray-500">
                                <p>If the problem persists, contact support with the error details.</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;