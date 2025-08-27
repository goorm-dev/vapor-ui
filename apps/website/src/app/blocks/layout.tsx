import { createMetadata } from '~/lib/metadata';

export const metadata = createMetadata({
    title: 'UI Blocks - Vapor UI',
    description:
        'Build pages faster with ready-to-use UI blocks. UI 블록은 불필요한 과정을 줄이고 협업을 원활하게 하여, 누구나 빠르고 쉽게 완성도 높은 경험을 제공할 수 있도록 돕습니다.',
    openGraph: {
        images: 'https://statics.goorm.io/gds/docs/og-image/logo/og-vapor-1.png',
    },
    twitter: {
        card: 'summary_large_image',
        images: 'https://statics.goorm.io/gds/docs/og-image/logo/og-vapor-1.png',
    },
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
