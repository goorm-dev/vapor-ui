import { themeSource } from '~/lib/source';
import { getMDXComponents } from '~/mdx-components';

import { ThemePageClient } from './theme-page-client';

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
type PageProps = {
    params: Promise<{ tool?: string[] }>;
};

/* -------------------------------------------------------------------------------------------------
 * ThemePage (Server Component)
 * -----------------------------------------------------------------------------------------------*/
export default async function ThemePage({ params }: PageProps) {
    const { tool } = await params;

    // URL에서 활성 도구 ID 추출: /theme/theme-provider → 'theme-provider'
    const activeToolId = tool?.[0];

    // Sheet 콘텐츠 준비 (서버에서 MDX 로드)
    let sheetContent:
        | {
              title: string;
              description: string;
              markdownUrl: string;
              children: React.ReactNode;
          }
        | undefined;

    if (activeToolId) {
        const page = themeSource.getPage([activeToolId]);

        if (page) {
            const { body: MDX } = await page.data.load();
            sheetContent = {
                // MDX frontmatter에서 직접 가져옴 (Single Source of Truth)
                title: page.data.title,
                description: page.data.description ?? '',
                markdownUrl: `${page.url}.mdx`,
                children: (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <MDX components={getMDXComponents({})} />
                    </div>
                ),
            };
        }
    }

    return <ThemePageClient activeToolId={activeToolId} sheetContent={sheetContent} />;
}
