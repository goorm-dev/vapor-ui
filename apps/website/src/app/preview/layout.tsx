import '../global.css';

import type { ReactNode } from 'react';

export default function PreviewLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="ko" className="h-full" suppressHydrationWarning>
            <head>
                <script
                    suppressHydrationWarning
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                const params = new URLSearchParams(window.location.search);
                                const theme = params.get('theme') || 'light';
                                const root = document.documentElement;
                                if (theme === 'dark') {
                                    root.classList.add('dark');
                                    root.setAttribute('data-vapor-theme', 'dark');
                                } else {
                                    root.classList.remove('dark');
                                    root.setAttribute('data-vapor-theme', 'light');
                                }
                            })();
                        `,
                    }}
                />
            </head>
            <body className="h-full bg-v-canvas flex items-center justify-center p-4" suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
