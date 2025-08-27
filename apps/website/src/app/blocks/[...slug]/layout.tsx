import { BlockPageLayout } from '~/components/block-page-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <BlockPageLayout>{children}</BlockPageLayout>;
}