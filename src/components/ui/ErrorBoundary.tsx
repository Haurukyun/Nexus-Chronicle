import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallbackLabel?: string;
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

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-[#3f0d19]/90 border-2 border-[#c8a96e] rounded-2xl text-[#fef08a] max-w-xl mx-auto my-8 text-center shadow-2xl">
                    <h3 className="font-serif font-bold text-xl uppercase mb-2 text-[#e6c687]">Codex Inscription Notice</h3>
                    <p className="text-sm font-sans opacity-80 mb-4">
                        {this.props.fallbackLabel || "An error occurred while rendering this entry."}
                    </p>
                    <div className="bg-black/40 p-3 rounded-lg text-left text-xs font-mono text-rose-300 mb-4 overflow-x-auto max-h-32">
                        {this.state.error?.toString()}
                    </div>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="px-6 py-2 bg-[#70121e] border border-[#c8a96e] text-[#fef08a] font-serif font-bold text-xs uppercase rounded-lg hover:bg-[#881337] transition-all"
                    >
                        Retry Render
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
