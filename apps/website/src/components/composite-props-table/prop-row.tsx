'use client';

import { useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';

import { Badge, Collapsible, Flex, HStack, Text, VStack } from '@vapor-ui/core';
import { ChevronDownOutlineIcon, ChevronUpOutlineIcon } from '@vapor-ui/icons';

import type { PropDefinition } from '~/utils/component-api';

const markdownComponents: Components = {
    code: ({ children }) => (
        <code className="px-1 py-0.5 rounded bg-v-gray-100 text-sm font-mono">{children}</code>
    ),
    p: ({ children }) => (
        <p className="text-sm text-v-normal-200 leading-relaxed m-0 mb-2 last:mb-0">{children}</p>
    ),
};

interface PropRowProps {
    prop: PropDefinition;
    isLast: boolean;
    typeRefs?: Record<string, string>;
}

export const PropRow = ({ prop, isLast, typeRefs }: PropRowProps) => {
    const [open, setOpen] = useState(false);
    const hasDetails = Boolean(prop.description) || Boolean(prop.defaultValue);
    const types = Array.isArray(prop.type) ? prop.type : [prop.type];
    const referencedTypes = typeRefs ? collectReferencedTypes(types, typeRefs) : [];

    return (
        <Collapsible.Root
            open={open}
            onOpenChange={setOpen}
            disabled={!hasDetails}
            className={`w-full ${isLast ? '' : 'border-b border-b-v-normal'}`}
        >
            <Collapsible.Trigger
                className={`w-full text-left bg-transparent border-0 p-0 ${
                    hasDetails ? 'cursor-pointer' : 'cursor-default'
                }`}
            >
                <HStack
                    $css={{
                        paddingInline: '$300',
                        paddingBlock: '$200',
                        gap: '$300',
                        alignItems: 'center',
                    }}
                >
                    <HStack $css={{ width: '150px', alignItems: 'center', flexShrink: 0 }}>
                        <Text typography="body2" foreground="normal-100">
                            {prop.name}
                            {!prop.required && '?'}
                        </Text>
                    </HStack>

                    <Flex className="flex-wrap flex-1" $css={{ gap: '$100', alignItems: 'center' }}>
                        {types.map((typeValue, index) => (
                            <TypeChip
                                key={`${typeValue}-${index}`}
                                value={typeValue}
                                isLast={index === types.length - 1}
                            />
                        ))}
                    </Flex>

                    <span
                        className={`flex items-center justify-center w-5 h-6 shrink-0 text-v-normal-200 ${
                            hasDetails ? 'opacity-100' : 'opacity-0'
                        }`}
                        aria-hidden
                    >
                        {open ? (
                            <ChevronUpOutlineIcon size={20} />
                        ) : (
                            <ChevronDownOutlineIcon size={20} />
                        )}
                    </span>
                </HStack>
            </Collapsible.Trigger>

            <Collapsible.Panel>
                <VStack
                    $css={{
                        paddingInline: '$300',
                        paddingTop: '$150',
                        paddingBottom: '$250',
                        gap: '$300',
                        alignItems: 'stretch',
                    }}
                >
                    {prop.description && (
                        <PropDetailRow label="description">
                            <ReactMarkdown components={markdownComponents}>
                                {prop.description}
                            </ReactMarkdown>
                        </PropDetailRow>
                    )}

                    {prop.defaultValue && (
                        <PropDetailRow label="default">
                            <Badge colorPalette="hint" size="md">
                                {prop.defaultValue}
                            </Badge>
                        </PropDetailRow>
                    )}

                    {referencedTypes.length > 0 && (
                        <PropDetailRow label="type">
                            <div className="border border-v-normal rounded-v-300 bg-v-canvas-100 p-v-200 w-full">
                                <VStack $css={{ alignItems: 'stretch', gap: '$150' }}>
                                    {referencedTypes.map(({ name, definition }) => (
                                        <VStack
                                            key={name}
                                            $css={{ alignItems: 'flex-start', gap: '$025' }}
                                        >
                                            <Text typography="code2" foreground="normal-100">
                                                {name}
                                            </Text>
                                            <pre className="text-sm text-v-normal-200 font-mono whitespace-pre-wrap m-0">
                                                {definition}
                                            </pre>
                                        </VStack>
                                    ))}
                                </VStack>
                            </div>
                        </PropDetailRow>
                    )}
                </VStack>
            </Collapsible.Panel>
        </Collapsible.Root>
    );
};

interface PropDetailRowProps {
    label: string;
    children: React.ReactNode;
}

const PropDetailRow = ({ label, children }: PropDetailRowProps) => (
    <HStack $css={{ gap: '$300', alignItems: 'flex-start' }}>
        <Text typography="body2" foreground="hint-100" $css={{ width: '150px', flexShrink: 0 }}>
            {label}
        </Text>
        <Flex $css={{ flex: 1, flexDirection: 'column' }}>{children}</Flex>
    </HStack>
);

interface TypeChipProps {
    value: string;
    isLast: boolean;
}

const TypeChip = ({ value, isLast }: TypeChipProps) => (
    <HStack $css={{ alignItems: 'center', gap: '$100' }}>
        <Badge colorPalette="hint" size="md" $css={{ height: 'auto' }}>
            {value}
        </Badge>
        {!isLast && (
            <Text
                typography="body2"
                foreground="hint-100"
                aria-hidden
                $css={{ userSelect: 'none' }}
            >
                |
            </Text>
        )}
    </HStack>
);

function collectReferencedTypes(
    types: string[],
    typeRefs: Record<string, string>,
): { name: string; definition: string }[] {
    const found = new Set<string>();
    for (const typeValue of types) {
        for (const refName of Object.keys(typeRefs)) {
            if (typeValue.includes(refName)) found.add(refName);
        }
    }
    return [...found].map((name) => ({ name, definition: typeRefs[name] }));
}
