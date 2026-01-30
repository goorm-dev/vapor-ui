'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { SiteNavBar } from '~/components/site-nav-bar/site-nav-bar';
import { THEME_SECTIONS } from '~/constants/theme-tools';

import { PageHeader, ToolSection, ToolDetailSheetClient } from './_components';

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
        <div>
            <SiteNavBar />
            <main className="pt-[62px]">
                <div className="flex flex-col py-[100px] px-[146px] gap-[100px] max-lg:pt-v-900 max-lg:px-v-400 max-lg:gap-v-900 max-sm:py-v-800 max-sm:gap-v-400">
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
            </main>

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
        </div>
    );
}
