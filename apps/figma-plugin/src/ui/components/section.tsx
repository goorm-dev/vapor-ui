import { type ReactNode } from 'react';

import { Text, VStack } from '@vapor-ui/core';

const SectionTitle = ({ title }: { title: string }) => {
    return <Text typography="heading6">{title}</Text>;
};

const SectionDescription = ({ description }: { description: string }) => {
    const lines = description.split('\\n');
    return (
        <span className="flex flex-col">
            {lines.map((line, index) => (
                <Text key={index} typography="body3" foreground="hint-200">
                    {line}
                </Text>
            ))}
        </span>
    );
};

interface SectionProps {
    children: ReactNode;
    isTop?: boolean;
}

export const Section = ({ children, isTop = false }: SectionProps) => {
    return (
        <VStack
            gap="$100"
            className={`flex-1 ${isTop ? 'pt-3 border-t border-v-normal' : ''}`}
            render={<section />}
        >
            {children}
        </VStack>
    );
};

Section.Description = SectionDescription;
Section.Title = SectionTitle;
