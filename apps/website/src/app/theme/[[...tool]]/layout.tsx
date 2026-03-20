import { HomeLayout } from 'fumadocs-ui/layouts/home';

import { baseOptions, homeLinks } from '~/app/layout.config';
import { ThemeToggle } from '~/components/theme-toggle';
import { OG_IMAGE_URL } from '~/constants/image-urls';
import { createMetadata } from '~/utils/metadata';

export const metadata = createMetadata({
    title: 'Theme - Vapor UI',
    description:
        'Vapor UI의 테마 시스템을 활용하여 다크모드를 지원하거나, 브랜드에 맞는 커스텀 테마를 생성하세요. ThemeProvider, Theme Playground, Figma Plugin 등 다양한 도구를 제공합니다.',
    openGraph: {
        images: OG_IMAGE_URL,
    },
    twitter: {
        card: 'summary_large_image',
        images: OG_IMAGE_URL,
    },
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <HomeLayout
            {...baseOptions}
            links={homeLinks}
            themeSwitch={{ component: <ThemeToggle size="md" /> }}
        >
            {children}
        </HomeLayout>
    );
}
