import './global.css';

import type { ReactNode } from 'react';

import { ThemeProvider } from '@vapor-ui/core';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import Script from 'next/script';

import DefaultSearchDialog from '~/components/search/search';

const inter = Inter({
    subsets: ['latin'],
});

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <html lang="ko" className={inter.className} suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <Script type="application/ld+json" id="vapor-ui-schema">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebSite',
                        name: 'Vapor UI',
                        url: 'https://vapor-ui.goorm.io/',
                    })}
                </Script>
                <meta
                    name="google-site-verification"
                    content="IbSc093-S7vjF7ZyDjbY43LENvMA-pguxJhDuSMuCmo"
                />
            </head>
            <body className="flex flex-col min-h-screen bg-[var(--vapor-color-background-normal)]">
                <RootProvider
                    search={{
                        SearchDialog: DefaultSearchDialog,
                    }}
                    theme={{ enabled: false }}
                >
                    <ThemeProvider defaultTheme="system" enableSystem>
                        {children}
                    </ThemeProvider>
                </RootProvider>
            </body>
        </html>
    );
}
