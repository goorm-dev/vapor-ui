import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

type Props = {
    children: ReactNode;
    fallback?: ReactNode;
};

type State = {
    error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary]', error, info);
    }

    reset = () => this.setState({ error: null });

    render() {
        const { error } = this.state;
        if (!error) return this.props.children;
        if (this.props.fallback) return this.props.fallback;

        return (
            <div
                role="alert"
                style={{
                    padding: 16,
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: '#111',
                }}
            >
                <h2 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>오류 발생</h2>
                <pre
                    style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        margin: '0 0 12px',
                        padding: 8,
                        background: '#f5f5f5',
                        borderRadius: 4,
                        fontSize: 12,
                    }}
                >
                    {error.message}
                </pre>
                <button
                    type="button"
                    onClick={this.reset}
                    style={{
                        padding: '6px 12px',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        background: '#fff',
                        cursor: 'pointer',
                    }}
                >
                    다시 시도
                </button>
            </div>
        );
    }
}
