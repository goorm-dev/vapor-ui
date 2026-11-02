'use client';

import { HStack, Text, VStack } from '@vapor-ui/core';

import type { ComponentApi } from '~/utils/component-api';

import { PropRow } from './prop-row';

interface PartTableProps {
    partName: string;
    componentData: ComponentApi;
}

export const PartTable = ({ partName, componentData }: PartTableProps) => {
    const { description, props, typeRefs } = componentData;

    return (
        <VStack $css={{ gap: '$200', alignItems: 'stretch', width: '100%' }}>
            <VStack $css={{ gap: '$050', alignItems: 'flex-start' }}>
                <Text typography="heading5" foreground="normal-100">
                    {partName}
                </Text>
                {description && (
                    <Text typography="body1" foreground="normal-200">
                        {description}
                    </Text>
                )}
            </VStack>

            {props.length === 0 ? (
                <Text typography="body2" foreground="hint-100">
                    No props exposed by this part.
                </Text>
            ) : (
                <div className="border border-v-normal rounded-v-300 overflow-hidden bg-v-canvas-100">
                    <HStack
                        className="border-b border-b-v-normal bg-v-canvas-200"
                        $css={{
                            paddingInline: '$300',
                            paddingBlock: '$200',
                            gap: '$300',
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            typography="subtitle2"
                            foreground="normal-100"
                            $css={{ width: '150px', flexShrink: 0 }}
                        >
                            Prop
                        </Text>
                        <Text typography="subtitle2" foreground="normal-100" $css={{ flex: 1 }}>
                            Type
                        </Text>
                        <span className="w-5 h-6 shrink-0" aria-hidden />
                    </HStack>

                    {props.map((prop, index) => (
                        <PropRow
                            key={prop.name}
                            prop={prop}
                            isLast={index === props.length - 1}
                            typeRefs={typeRefs}
                        />
                    ))}
                </div>
            )}
        </VStack>
    );
};
