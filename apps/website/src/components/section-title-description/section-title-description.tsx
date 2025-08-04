import React from 'react';

import { Text } from '@vapor-ui/core';

interface SectionTitleDescriptionProps {
    children: React.ReactNode;
    description: string;
}

const SectionTitleDescription: React.FC<SectionTitleDescriptionProps> = ({
    children,
    description,
}) => {
    return (
        <div className="flex flex-col justify-start self-stretch not-prose gap-[var(--vapor-size-space-100)]">
            <Text typography="heading3" asChild>
                {children}
            </Text>
            <Text typography="body2" foreground="normal-lighter">
                {description}
            </Text>
        </div>
    );
};

export default SectionTitleDescription;
