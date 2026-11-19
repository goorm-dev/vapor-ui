import type { ReactNode } from 'react';
import { Fragment } from 'react';

import { Flex, HStack, Text } from '@vapor-ui/core';

interface TypeChipsProps {
    types: ReactNode[];
}

export const TypeChips = ({ types }: TypeChipsProps) => {
    return (
        <Flex
            $css={{
                flex: 1,
                flexWrap: 'wrap',
                rowGap: '$050',
                columnGap: '$100',
                alignItems: 'center',
            }}
        >
            {types.map((typeValue, index) => (
                <Fragment key={index}>
                    <HStack $css={{ alignItems: 'center', gap: '$100' }}>
                        <Text render={<code />} typography="code1" className="shiki">
                            {typeValue}
                        </Text>
                    </HStack>

                    <Text
                        aria-hidden
                        // render={<code />}
                        typography="code1"
                        $css={{
                            display: index === types.length - 1 ? 'none' : 'block',
                            userSelect: 'none',
                            color: '#D73A49',
                        }}
                    >
                        |
                    </Text>
                </Fragment>
            ))}
        </Flex>
    );
};
