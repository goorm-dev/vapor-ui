import type { ReactNode } from 'react';

import type { Metadata } from 'next';

import { PageWrapper } from './_components/page-wrapper';

import './style.css';

export const metadata: Metadata = {
    title: 'Playground - Vapor UI',
};

export default function Layout({ children }: { children: ReactNode }) {
    return <PageWrapper>{children}</PageWrapper>;
}
