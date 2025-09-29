'use client';

import React from 'react';

import { Badge, Text } from '@vapor-ui/core';

import { InfoPopover } from '~/components/Info';
import { ComponentDocsMap } from '~/constants/components';

interface ComponentPropsTableProps {
    file: string;
}

const ComponentPropsTable: React.FC<ComponentPropsTableProps> = ({ file }) => {
    const doc = ComponentDocsMap[file];

    if (!doc) {
        console.error(`ComponentPropsTable: No documentation preloaded for file "${file}"`);
        return <p>문서를 찾을 수 없습니다: {file}</p>;
    }

    if (!doc.props || doc.props.length === 0) {
        return <p>표시할 속성이 없습니다.</p>;
    }
    return (
        <div className="w-full not-prose overflow-auto flex flex-col items-start gap-0 self-stretch rounded-[var(--vapor-size-borderRadius-300)]">
            <table
                className="w-full border-separate border-spacing-0 overflow-hidden border border-[var(--vapor-color-border-normal)] rounded-[var(--vapor-size-borderRadius-300)]"
                style={{ tableLayout: 'auto' }}
            >
                <thead className="flex, items-start self-stretch rounded-[var(--vapor-size-borderRadius-300)]">
                    <tr className="bg-[var(--vapor-color-background-surface-200)] border-b border-b-[var(--vapor-color-border-normal)]">
                        <th className="px-[var(--vapor-size-space-300)] h-[var(--vapor-size-dimension-500)] text-left rounded-tl-[var(--vapor-size-borderRadius-300)] min-w-[140px] w-px">
                            <Text typography="subtitle1" foreground="normal-100">
                                Prop
                            </Text>
                        </th>
                        <th className="px-[var(--vapor-size-space-300)] h-[var(--vapor-size-dimension-500)] text-left min-w-[100px] w-px">
                            <Text typography="subtitle1" foreground="normal-100">
                                Default
                            </Text>
                        </th>
                        <th className="px-[var(--vapor-size-space-300)] h-[var(--vapor-size-dimension-500)] text-left font-medium">
                            <Text typography="subtitle1" foreground="normal-100">
                                Type
                            </Text>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {doc.props.map((prop, index) => {
                        const types = Array.isArray(prop.type) ? prop.type : [prop.type];
                        const isOptional = !prop.required;
                        const isLastRow = index === doc.props.length - 1;

                        return (
                            <tr key={prop.name} className="">
                                <td
                                    className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] min-w-[140px] w-px ${isLastRow ? 'rounded-bl-[var(--vapor-size-borderRadius-300)] border-b-0' : ''}`}
                                >
                                    <div className="flex items-center gap-[var(--vapor-size-space-100)] w-fit">
                                        <Text typography="body2" foreground="normal-200">
                                            <span>
                                                {prop.name}
                                                {isOptional && '?'}
                                            </span>
                                        </Text>
                                        {prop.description && (
                                            <InfoPopover>{prop.description}</InfoPopover>
                                        )}
                                    </div>
                                </td>
                                <td
                                    className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] min-w-[100px] w-px ${isLastRow ? 'border-b-0' : ''}`}
                                >
                                    {prop.defaultValue ? (
                                        <Badge color="hint" size="md">
                                            {prop.defaultValue}
                                        </Badge>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                                <td
                                    className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] ${isLastRow ? 'rounded-br-[var(--vapor-size-borderRadius-300)] border-b-0' : ''}`}
                                >
                                    <div className="flex flex-wrap gap-[var(--vapor-size-space-100)]">
                                        {types.map((typeValue, typeIndex) => (
                                            <Badge
                                                key={`${prop.name}-type-${typeIndex}`}
                                                color="hint"
                                                size="md"
                                            >
                                                {typeValue}
                                            </Badge>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ComponentPropsTable;
