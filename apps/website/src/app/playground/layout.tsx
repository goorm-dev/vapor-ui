import type { ReactNode } from 'react';

import type { Metadata } from 'next';

import { PageWrapper } from './_components2/page-wrapper';

export const metadata: Metadata = {
    title: 'Playground - Vapor UI',
};

export default function Layout({ children }: { children: ReactNode }) {
    return <PageWrapper>{children}</PageWrapper>;
}
