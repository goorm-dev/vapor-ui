import './global.css';

import type { ReactNode } from 'react';

import { ThemeProvider } from '@vapor-ui/core/theme-provider';
import { defineI18nUI } from 'fumadocs-ui/i18n';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import Script from 'next/script';

import DefaultSearchDialog from '~/components/search/search';
import { ThemeSync } from '~/components/theme-sync';
import { i18n } from '~/lib/i18n';

const inter = Inter({
    subsets: ['latin'],
});

const { provider } = defineI18nUI(i18n, {
    translations: {
        en: {
            displayName: 'English',
        },
        kr: {
            displayName: 'Korean',
        },
    },
});

export default async function Layout({
    params,
    children,
}: {
    params: Promise<{ lang: string }>;
    children: ReactNode;
}) {
    const { lang } = await params;
    return (
        <html lang={lang} className={inter.className} suppressHydrationWarning>
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
            <body className="flex flex-col min-h-screen bg-v-canvas-100">
                <RootProvider
                    search={{
                        SearchDialog: DefaultSearchDialog,
                    }}
                    theme={{ enabled: false }}
                    i18n={provider(lang)}
                >
                    <ThemeProvider defaultTheme="system" storageKey="vapor-ui-docs">
                        <ThemeSync />
                        {children}
                    </ThemeProvider>
                </RootProvider>
            </body>
        </html>
    );
}
