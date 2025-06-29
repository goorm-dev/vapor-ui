import type { ReactNode } from 'react';

import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';

import DefaultSearchDialog from '~/components/search/search';

const inter = Inter({
    subsets: ['latin'],
});

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <html lang="ko" className={inter.className} suppressHydrationWarning>
            <body className="flex flex-col min-h-screen">
                <RootProvider
                    search={{
                        SearchDialog: DefaultSearchDialog,
                    }}
                >
                    {children}
                </RootProvider>
            </body>
        </html>
    );
}
