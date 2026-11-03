'use client';

import type { ReactNode } from 'react';
import { Fragment } from 'react';

import { Collapsible, Flex, HStack, Popover, Text } from '@vapor-ui/core';
import { ChevronDownOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import type { DetailedTypeSegment, HighlightedPropRow } from './types';
import { TypeChips } from './type-chips';

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
            <Collapsible.Trigger
                $css={{
                    cursor: hasDetails ? 'pointer' : 'default',
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '15rem 1fr 1.25rem',
                    paddingInline: '$300',
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

            <Collapsible.Panel
                $css={{
                    transition: 'none',
                    display: 'grid',
                    gridTemplateColumns: '15rem 1fr',
                    paddingInline: '$300',
                    paddingTop: '$150',
                    paddingBottom: '$250',
                    rowGap: '$300',
                }}
            >
                <PropRowDetail condition={!!row.description} name="description">
                    <Text typography="body2" foreground="normal">
                        {row.description}
                    </Text>
                </PropRowDetail>

                <PropRowDetail condition={!!row.detailedType} name="type">
                    <div className="border border-v-normal rounded-v-400 bg-v-canvas-base p-v-200 whitespace-pre-wrap">
                        <Text render={<code />} typography="code1">
                            {row.detailedType?.map((segment, index) => (
                                <DetailedTypeSegmentNode key={index} segment={segment} />
                            ))}
                        </Text>
                    </div>
                </PropRowDetail>

                <PropRowDetail condition={!!row.defaultValue} name="default value">
                    <Text render={<code />} typography="code1" className="whitespace-pre-wrap">
                        {row.defaultValue}
                    </Text>
                </PropRowDetail>
            </Collapsible.Panel>
        </Collapsible.Root>
    );
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
