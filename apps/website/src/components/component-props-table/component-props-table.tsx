'use client';

import React from 'react';

import { Badge, Text } from '@vapor-ui/core';
import { Info } from 'fumadocs-ui/components/type-table';

import { ComponentDocsMap } from '~/constants/components';

interface PropDefinition {
    name: string;
    type: string[];
    allowedValues?: string[];
    defaultValue?: string;
    description: string;
    isOptional?: boolean;
}

interface PropItem {
    prop: string;
    type: string[];
    default: string | number | null;
    description: string;
}

interface ComponentPropsTableProps {
    props?: PropDefinition[];
    file?: string;
    section?: 'props' | 'imageProps' | 'fallbackProps' | 'simpleProps';
}

const ComponentPropsTable: React.FC<ComponentPropsTableProps> = ({
    props,
    file,
    section = 'props',
}) => {
    let tableProps: PropDefinition[] = [];

    if (file) {
        const doc = ComponentDocsMap[file];
        if (!doc) {
            console.error(`ComponentPropsTable: No documentation preloaded for file "${file}"`);
            return null;
        }

        const items = (doc[section] as PropItem[]) ?? [];
        tableProps = items.map((item) => ({
            name: item.prop,
            type: item.type,
            defaultValue: item.default !== null ? String(item.default) : undefined,
            description: item.description,
            isOptional: item.default !== null || item.type.includes('undefined'),
        }));
    } else if (props) {
        tableProps = props;
    }

    if (tableProps.length === 0) {
        return <p>표시할 데이터가 없습니다.</p>;
    }
    return (
        <div className="not-prose overflow-auto flex flex-col items-start gap-0 self-stretch rounded-[var(--vapor-size-borderRadius-300)]">
            <table className="w-full border-separate border-spacing-0 overflow-hidden border border-[var(--vapor-color-border-normal)] rounded-[var(--vapor-size-borderRadius-300)]">
                <thead className="flex, items-start self-stretch rounded-[var(--vapor-size-borderRadius-300)]">
                    <tr className="bg-[var(--vapor-color-background-normal-darker)] border-b border-b-[var(--vapor-color-border-normal)]">
                        <th className="px-[var(--vapor-size-space-300)] h-[var(--vapor-size-dimension-500)] text-left rounded-tl-[var(--vapor-size-borderRadius-300)] min-w-[160px]">
                            <Text typography="subtitle1" foreground="normal-lighter">
                                Prop
                            </Text>
                        </th>
                        <th className="px-[var(--vapor-size-space-300)] h-[var(--vapor-size-dimension-500)] text-left font-medium">
                            <Text typography="subtitle1" foreground="normal-lighter">
                                Type
                            </Text>
                        </th>
                        <th className="px-[var(--vapor-size-space-300)] h-[var(--vapor-size-dimension-500)] text-left ">
                            <Text typography="subtitle1" foreground="normal-lighter">
                                Default
                            </Text>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {tableProps.map((prop, index) => (
                        <tr key={prop.name} className="">
                            <td
                                className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] min-w-[160px] ${index === tableProps.length - 1 ? 'rounded-bl-[var(--vapor-size-borderRadius-300)] border-b-0' : ''}`}
                            >
                                <div className="flex items-center gap-[var(--vapor-size-space-100)]">
                                    <Text typography="body2" foreground="normal">
                                        <span>
                                            {prop.name}
                                            {prop.isOptional && '?'}
                                        </span>
                                    </Text>
                                    <Info>{prop.description}</Info>
                                </div>
                            </td>
                            <td
                                className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] ${index === tableProps.length - 1 ? 'border-b-0' : ''}`}
                            >
                                {prop.type.length > 5 ? (
                                    <div className="flex items-center gap-[var(--vapor-size-space-100)]">
                                        <Badge color="hint" size="md">
                                            enum
                                        </Badge>
                                        <Info>
                                            <div className="flex flex-wrap gap-1">
                                                {prop.type.map((typeValue) => (
                                                    <Badge key={typeValue} color="hint" size="sm">
                                                        {typeValue}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </Info>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-[var(--vapor-size-space-100)]">
                                        {prop.type.map((typeValue) => (
                                            <Badge key={typeValue} color="hint" size="md">
                                                {typeValue}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </td>
                            <td
                                className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] ${index === tableProps.length - 1 ? 'rounded-br-[var(--vapor-size-borderRadius-300)] border-b-0' : ''}`}
                            >
                                {prop.defaultValue ? (
                                    <Badge color="hint" size="md">
                                        {prop.defaultValue}
                                    </Badge>
                                ) : prop.isOptional ? (
                                    '-'
                                ) : (
                                    '-'
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ComponentPropsTable;
