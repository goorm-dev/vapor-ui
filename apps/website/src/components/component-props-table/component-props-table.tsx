'use client';

import React from 'react';

import { Badge, Text } from '@vapor-ui/core';
import { Info } from 'fumadocs-ui/components/type-table';

interface PropDefinition {
    name: string;
    type: string;
    allowedValues?: string[];
    defaultValue?: string;
    description: string;
    isOptional?: boolean;
}

interface ComponentPropsTableProps {
    props: PropDefinition[];
}

const ComponentPropsTable: React.FC<ComponentPropsTableProps> = ({ props }) => {
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
                        <th className="px-[var(--vapor-size-space-300)] h-[var(--vapor-size-dimension-500)] text-left ">
                            <Text typography="subtitle1" foreground="normal-lighter">
                                Types
                            </Text>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {props.map((prop, index) => (
                        <tr key={prop.name} className="">
                            <td
                                className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] min-w-[160px] ${index === props.length - 1 ? 'rounded-bl-[var(--vapor-size-borderRadius-300)] border-b-0' : ''}`}
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
                                className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] ${index === props.length - 1 ? 'border-b-0' : ''}`}
                            >
                                <Badge color="hint" size="md">
                                    {prop.type}
                                </Badge>
                            </td>
                            <td
                                className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] ${index === props.length - 1 ? 'rounded-br-[var(--vapor-size-borderRadius-300)] border-b-0' : ''}`}
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
                            <td
                                className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] ${index === props.length - 1 ? 'border-b-0' : ''}`}
                            >
                                {prop.allowedValues && prop.allowedValues.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {prop.allowedValues.map((value) => (
                                            <Badge color="hint" size="md" key={value}>
                                                {value}
                                            </Badge>
                                        ))}
                                    </div>
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
