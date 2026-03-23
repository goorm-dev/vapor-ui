'use client';

import type { ReactNode } from 'react';

import { useRouter } from 'next/navigation';

import { THEME_SECTIONS } from '~/constants/theme-tools';

import { PageHeader, ToolDetailSheetClient, ToolSection } from './_components';

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
interface ThemePageClientProps {
    activeToolId?: string;
    sheetContent?: {
        title: string;
        description: string;
        markdownUrl: string;
        children: ReactNode;
    };
}

/* -------------------------------------------------------------------------------------------------
 * ThemePageClient
 * 클라이언트 사이드 인터랙션을 처리하는 컴포넌트
 * -----------------------------------------------------------------------------------------------*/
export function ThemePageClient({ activeToolId, sheetContent }: ThemePageClientProps) {
    const router = useRouter();

    const handleSheetClose = () => {
        router.push('/theme', { scroll: false });
    };

    return (
        <main>
            <div className="flex flex-col px-4 py-12 md:px-6 mx-auto max-w-(--fd-layout-width)">
                <PageHeader />

                <div className="flex flex-col gap-v-900">
                    {THEME_SECTIONS.map((section) => (
                        <ToolSection
                            key={section.id}
                            title={section.title}
                            description={section.description}
                            tools={section.tools}
                            activeToolId={activeToolId}
                        />
                    ))}
                </div>
            </div>

            {/* Tool Detail Sheet - URL 파라미터에 따라 자동으로 열림/닫힘 */}
            {sheetContent && (
                <ToolDetailSheetClient
                    title={sheetContent.title}
                    description={sheetContent.description}
                    markdownUrl={sheetContent.markdownUrl}
                    onClose={handleSheetClose}
                >
                    {sheetContent.children}
                </ToolDetailSheetClient>
            )}
        </main>
    );
}
