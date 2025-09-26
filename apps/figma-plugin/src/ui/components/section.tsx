import { type ReactNode } from 'react';

import { Text, VStack } from '@vapor-ui/core';

interface SectionProps {
    title: string;
    children: ReactNode;
}

export const Section = ({ title, children }: SectionProps) => {
    return (
        <VStack gap="$100" className="flex-1">
            <Text typography="heading6">{title}</Text>
            {children}
        </VStack>
    );
};
