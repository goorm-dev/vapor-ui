import type { ReactNode } from 'react';
import { Fragment } from 'react';

import { Box, Flex, HStack, Text } from '@vapor-ui/core';

interface TypeChipsProps {
    types: ReactNode[];
}

export const TypeChips = ({ types }: TypeChipsProps) => {
    return (
        <Flex $css={{ flex: 1, flexWrap: 'wrap', gap: '$100', alignItems: 'center' }}>
            {types.map((typeValue, index) => (
                <Fragment key={index}>
                    <HStack $css={{ alignItems: 'center', gap: '$100' }}>
                        <Text render={<code />} typography="code1" className="shiki">
                            {typeValue}
                        </Text>
                    </HStack>

                    <Box
                        aria-hidden
                        $css={{
                            display: index === types.length - 1 ? 'none' : 'block',
                            userSelect: 'none',
                            color: '$fg-hint',
                        }}
                    >
                        |
                    </Box>
                </Fragment>
            ))}
        </Flex>
    );
};
