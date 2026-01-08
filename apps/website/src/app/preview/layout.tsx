import '../global.css';

import type { ReactNode } from 'react';

export default function PreviewLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="ko" suppressHydrationWarning>
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
            <body className="bg-v-canvas" suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
