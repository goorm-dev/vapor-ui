import { Text } from '@vapor-ui/core';

import { CopyButton } from '~/components/copy-button/copy-button';

type DocsPageHeaderProps = {
    title: string;
    description?: string;
    markdownUrl?: string;
};

const DocsPageHeader = ({ title, description, markdownUrl }: DocsPageHeaderProps) => {
    return (
        <div className="flex flex-col items-start gap-[var(--vapor-size-space-250)] self-stretch">
            <div className="flex flex-col items-start gap-[var(--vapor-size-space-100)] self-stretch">
                <Text asChild typography="heading1" foreground="normal">
                    <h1>{title}</h1>
                </Text>
                {description && (
                    <Text typography="body1" foreground="normal">
                        {description}
                    </Text>
                )}
            </div>
            {markdownUrl && (
                <div className="w-full border-b pb-[var(--vapor-size-space-400)]">
                    <CopyButton markdownUrl={markdownUrl} />
                </div>
            )}
        </div>
    );
};

export default DocsPageHeader;
