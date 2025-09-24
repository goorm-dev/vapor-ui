'use client';

import * as React from 'react';
import { Suspense } from 'react';

interface PreviewPageProps {
    params: Promise<{
        component: string;
    }>;
    searchParams: Promise<{
        path?: string;
    }>;
}

function DynamicComponent({ componentPath }: { componentPath: string }) {
    const [Component, setComponent] = React.useState<React.ComponentType | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const loadComponent = async () => {
            try {
                const componentModule = await import(`../../../components/demo/examples/${componentPath}.tsx`);
                setComponent(() => componentModule.default);
            } catch (err) {
                console.error('Error loading component:', err);
                setError(`Could not load component: ${componentPath}`);
            }
        };

        loadComponent();
    }, [componentPath]);

    if (error) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
                <h1>Component not found</h1>
                <p>{error}</p>
            </div>
        );
    }

    if (!Component) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                Loading component...
            </div>
        );
    }

    return <Component />;
}

export default function PreviewPage({ params, searchParams }: PreviewPageProps) {
    const resolvedParams = React.use(params);
    const resolvedSearchParams = React.use(searchParams);
    const componentPath = resolvedSearchParams.path || resolvedParams.component;

    React.useEffect(() => {
        // Add styles to document head
        const style = document.createElement('style');
        style.textContent = `
            body {
                margin: 0;
                padding: 16px;
                min-height: 100vh;
                background: white;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .preview-container {
                width: 100%;
                max-width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: calc(100vh - 32px);
            }

            /* Ensure responsive classes work */
            .navbar-desktop {
                display: flex;
            }
            
            .navbar-mobile {
                display: none;
            }
            
            @media (max-width: 768px) {
                .navbar-desktop {
                    display: none !important;
                }
                .navbar-mobile {
                    display: flex !important;
                }
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className="preview-container">
            <Suspense fallback={<div>Loading...</div>}>
                <DynamicComponent componentPath={componentPath} />
            </Suspense>
        </div>
    );
}