import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 border border-red-500 bg-red-50 rounded text-center">
                    <h3 className="text-red-700 font-bold">Camera Error</h3>
                    <p className="text-sm text-red-600">Something went wrong with the face camera.</p>
                    {this.state.error && <p className="text-xs text-red-400 mt-1">{this.state.error.toString()}</p>}
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-xs bg-red-600 text-white px-2 py-1 rounded"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
