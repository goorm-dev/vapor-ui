import { CopyButton } from '~/components/copy-button';

import DocsDescription from '../docs-description';
import DocsTitle from '../docs-title';

type DocsPageHeaderProps = {
    title: string;
    description?: string;
    markdownUrl?: string;
};

export const DocsPageHeader = ({ title, description, markdownUrl }: DocsPageHeaderProps) => {
    return (
        <div className="flex flex-col items-start gap-[var(--vapor-size-space-250)] self-stretch">
            <div className="flex flex-col items-start gap-[var(--vapor-size-space-100)] self-stretch">
                <DocsTitle>{title}</DocsTitle>
                <DocsDescription>{description}</DocsDescription>
            </div>
            {markdownUrl && (
                <div className="w-full">
                    <CopyButton markdownUrl={markdownUrl} />
                </div>
            )}
        </div>
    );
};
