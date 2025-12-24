import type { ReactNode } from 'react';

export default function PreviewLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <body className="bg-transparent">{children}</body>
        </html>
    );
}
