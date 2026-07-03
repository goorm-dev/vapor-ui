import { HStack, Text } from '@vapor-ui/core';
import { CaretRightIcon } from '@vapor-ui/icons';

type ViolationBreadcrumbProps = {
    name: string;
    property: string;
};

export function ViolationBreadcrumb({ name, property }: ViolationBreadcrumbProps) {
    return (
        <HStack
            $css={{
                width: '100%',
                gap: '$050',
                alignItems: 'center',
                color: '$fg-hint-100',
            }}
        >
            <Text typography="subtitle1" foreground="normal-200" className="shrink truncate">
                {name}
            </Text>
            <CaretRightIcon className="shrink-0" />
            <Text typography="subtitle1" foreground="normal-200" className="shrink-0">
                {property}
            </Text>
        </HStack>
    );
}
