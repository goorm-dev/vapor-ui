import type { ReactNode } from 'react';

import { ThemeProvider, ThemeScript } from '@vapor-ui/core';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';

import DefaultSearchDialog from '~/components/search/search';

import './global.css';

const inter = Inter({
    subsets: ['latin'],
});

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <html lang="ko" className={inter.className} suppressHydrationWarning>
            <head>
                <ThemeScript
                    config={{
                        appearance: 'light',
                    }}
                />
                <link rel="icon" href="/favicon.ico" sizes="any" />
            </head>
            <body className="flex flex-col min-h-screen bg-[var(--vapor-color-background-normal)]">
                <RootProvider
                    search={{
                        SearchDialog: DefaultSearchDialog,
                    }}
                    theme={{ enabled: false }}
                >
                    <ThemeProvider
                        config={{
                            appearance: 'light',
                        }}
                    >
                        {children}
                    </ThemeProvider>
                </RootProvider>
            </body>
        </html>
    );
}
