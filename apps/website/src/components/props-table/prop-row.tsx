'use client';

import type { ReactNode } from 'react';
import { Fragment } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';

import { Collapsible, Flex, HStack, Popover, Text } from '@vapor-ui/core';
import { ChevronDownOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';
import remarkGfm from 'remark-gfm';

import { InlineCode } from '../ui/inline-code';
import { Interaction } from '../ui/interaction';
import { TypeChips } from './type-chips';
import type { DetailedTypeSegment, HighlightedPropRow } from './types';

interface PropRowProps {
    row: HighlightedPropRow;
}

export const PropRow = ({ row }: PropRowProps) => {
    const hasDetails = !!(row.description || row.detailedType || row.defaultValue);

    return (
        <Collapsible.Root
            disabled={!hasDetails}
            className="shiki [&_span.line]:px-0! not-first-of-type:border-t not-first-of-type:border-v-normal"
        >
            <Interaction>
                <Collapsible.Trigger
                    $css={{
                        cursor: hasDetails ? 'pointer' : 'default',
                        width: '100%',
                        display: 'grid',
                        gridTemplateColumns: '12.5rem 1fr 1.25rem',
                        gap: '$250',
                        paddingInline: '$150',
                        paddingBlock: '$200',
                        alignItems: 'flex-start',
                    }}
                >
                    <HStack>
                        <Text typography="code1" className="font-v-500">
                            {row.name}
                        </Text>
                    </HStack>

                    <TypeChips types={row.types} />

                    <ChevronDownOutlineIcon
                        size={20}
                        className={clsx('in-data-panel-open:rotate-180', !hasDetails && 'hidden')}
                    />
                </Collapsible.Trigger>
            </Interaction>

            <Collapsible.Panel
                $css={{
                    transition: 'none',
                    display: 'grid',
                    gridTemplateColumns: '12.5rem 1fr',
                    paddingInline: '$150',
                    paddingTop: '$100',
                    paddingBottom: '$250',
                    columnGap: '$250',
                    rowGap: '$200',
                }}
            >
                <PropRowDetail condition={!!row.description} name="Description">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={descriptionMarkdownCode}>
                        {row.description}
                    </ReactMarkdown>
                </PropRowDetail>

                <PropRowDetail condition={!!row.detailedType} name="Type">
                    <div className="border border-v-normal rounded-v-400 bg-v-canvas-base py-v-150 px-v-200 whitespace-pre-wrap">
                        <Text render={<code />} typography="code1">
                            {row.detailedType?.map((segment, index) => (
                                <DetailedTypeSegmentNode key={index} segment={segment} />
                            ))}
                        </Text>
                    </div>
                </PropRowDetail>

                <PropRowDetail condition={!!row.defaultValue} name="Default Value">
                    <Text render={<code />} typography="code1" className="whitespace-pre-wrap">
                        {row.defaultValue}
                    </Text>
                </PropRowDetail>
            </Collapsible.Panel>
        </Collapsible.Root>
    );
};

/* -----------------------------------------------------------------------------------------------*/

const descriptionMarkdownCode: Components = {
    p: ({ children }) => (
        <Text typography="body2" foreground="normal">
            {children}
        </Text>
    ),
    code: InlineCode,
    ul: ({ children }) => <ul className="list-disc pl-4 ">{children}</ul>,
    li: ({ children }) => (
        <Text render={<li />} typography="body2" className="my-v-50">
            {children}
        </Text>
    ),
};

/* -----------------------------------------------------------------------------------------------*/

interface PropRowDetailProps {
    condition: boolean;
    name: string;
    children: ReactNode;
}

const PropRowDetail = ({ condition, name, children }: PropRowDetailProps) => {
    if (!condition) return null;

    return (
        <>
            <Text typography="subtitle1" foreground="hint">
                {name}
            </Text>
            <Flex $css={{ flex: 1, flexDirection: 'column' }}>{children}</Flex>
        </>
    );
};

/* -----------------------------------------------------------------------------------------------*/

interface DetailedTypeSegmentNodeProps {
    segment: DetailedTypeSegment;
}

const DetailedTypeSegmentNode = ({ segment }: DetailedTypeSegmentNodeProps) => {
    if (segment.kind === 'plain') return <Fragment>{segment.node}</Fragment>;

    return (
        <Popover.Root>
            <Popover.Trigger className="cursor-pointer [&_span]:underline">
                {segment.node}
            </Popover.Trigger>
            <Popover.Popup className={'shiki [&_span.line]:px-0!'}>
                <Text
                    render={<code />}
                    typography="code1"
                    foreground="hint"
                    className="whitespace-pre-wrap"
                >
                    type {segment.refName} = {segment.definition}
                </Text>
            </Popover.Popup>
        </Popover.Root>
    );
};
