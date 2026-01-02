'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

import { Badge, Flex, HStack, Text, VStack } from '@vapor-ui/core';

import { InfoPopover } from '~/components/info';

interface PropDefinition {
    name: string;
    type: string | string[];
    required: boolean;
    description: string;
    defaultValue?: string;
}

interface VariantDefinition {
    name: string;
    values: string[];
    defaultValue?: string;
}

interface ComponentData {
    name: string;
    displayName: string;
    description: string;
    props: PropDefinition[];
    variants?: VariantDefinition[];
    generatedAt: string;
    sourceFile: string;
}

interface ComponentPropsTableProps {
    componentName: string;
}

/**
 * kebab-case를 PascalCase로 변환
 * @example "avatar" -> "Avatar", "text-input" -> "TextInput"
 */
const kebabToPascal = (str: string): string => {
    return str
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
};

/**
 * componentName을 폴더와 파일명으로 파싱
 * @example "avatar-root" -> { folder: "Avatar", filename: "root" }
 * @example "button" -> { folder: "Button", filename: "Button" }
 */
const parseComponentName = (componentName: string): { folder: string; filename: string } => {
    const parts = componentName.split('-');
    const folder = kebabToPascal(parts[0]);

    if (parts.length === 1) {
        // 단일 컴포넌트: "button" -> Button/Button
        return { folder, filename: folder };
    }

    // 복합 컴포넌트: "avatar-root" -> Avatar/root
    const filename = parts.slice(1).join('-');
    return { folder, filename };
};

export const ComponentPropsTable = ({ componentName }: ComponentPropsTableProps) => {
    const [componentData, setComponentData] = React.useState<ComponentData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const loadComponentData = async () => {
            try {
                const { folder, filename } = parseComponentName(componentName);

                const response = await fetch(`/references/${folder}/${filename}.json`);
                if (!response.ok) {
                    throw new Error(`Failed to load component data for ${componentName}`);
                }
                const data = await response.json();
                setComponentData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        loadComponentData();
    }, [componentName]);

    if (loading) {
        return <p>Loading component documentation...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    const hasProps = componentData?.props && componentData.props.length > 0;
    const hasVariants = componentData?.variants && componentData.variants.length > 0;

    if (!componentData || (!hasProps && !hasVariants)) {
        return <p>No props available for this component.</p>;
    }

    // Props와 Variants를 하나의 배열로 통합
    type TableRow =
        | { kind: 'prop'; data: PropDefinition }
        | { kind: 'variant'; data: VariantDefinition };

    const tableRows: TableRow[] = [
        ...(componentData?.variants ?? []).map(
            (variant) => ({ kind: 'variant', data: variant }) as TableRow,
        ),
        ...(componentData?.props ?? []).map((prop) => ({ kind: 'prop', data: prop }) as TableRow),
    ];

    return (
        <VStack className="w-full not-prose" alignItems="flex-start" gap="$400">
            <Text typography="body1" foreground="normal-200">
                <ReactMarkdown
                    components={{
                        code: ({ children }) => (
                            <code className="px-1 py-0.5 rounded bg-v-gray-100 text-sm">
                                {children}
                            </code>
                        ),
                    }}
                >
                    {componentData.description}
                </ReactMarkdown>
            </Text>
            <VStack
                width="100%"
                overflow="auto"
                alignItems="flex-start"
                gap="$0"
                alignContent="stretch"
                borderRadius="$300"
            >
                <table
                    className="w-full border-separate border-spacing-0 overflow-hidden border border-[var(--vapor-color-border-normal)] rounded-[var(--vapor-size-borderRadius-300)]"
                    style={{ tableLayout: 'auto' }}
                >
                    <thead className="w-full items-start self-stretch rounded-[var(--vapor-size-borderRadius-300)]">
                        <tr className="w-full bg-[var(--vapor-color-background-surface-200)] border-b border-b-[var(--vapor-color-border-normal)]">
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
                            <th className="w-full px-[var(--vapor-size-space-300)] h-[var(--vapor-size-dimension-500)] text-left font-medium">
                                <Text typography="subtitle1" foreground="normal-100">
                                    Type
                                </Text>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows.map((row, index) => {
                            const isLast = index === tableRows.length - 1;

                            if (row.kind === 'variant') {
                                const variant = row.data;
                                return (
                                    <tr key={`variant-${variant.name}`}>
                                        <td
                                            className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] min-w-[140px] w-px ${isLast ? 'rounded-bl-[var(--vapor-size-borderRadius-300)] border-b-0' : ''}`}
                                        >
                                            <Text typography="body2" foreground="normal-200">
                                                {variant.name}
                                            </Text>
                                        </td>
                                        <td
                                            className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] min-w-[100px] w-px ${isLast ? 'border-b-0' : ''}`}
                                        >
                                            {variant.defaultValue ? (
                                                <Badge colorPalette="hint" size="md">
                                                    {variant.defaultValue}
                                                </Badge>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td
                                            className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] ${isLast ? 'rounded-br-[var(--vapor-size-borderRadius-300)] border-b-0' : ''}`}
                                        >
                                            <Flex gap="$100" className="flex-wrap">
                                                {variant.values.map((value) => (
                                                    <Badge
                                                        key={value}
                                                        colorPalette="hint"
                                                        size="md"
                                                    >
                                                        {value}
                                                    </Badge>
                                                ))}
                                            </Flex>
                                        </td>
                                    </tr>
                                );
                            }

                            const prop = row.data;
                            return (
                                <tr key={`prop-${prop.name}`}>
                                    <td
                                        className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] min-w-[140px] w-px ${isLast ? 'rounded-bl-[var(--vapor-size-borderRadius-300)] border-b-0' : ''}`}
                                    >
                                        <HStack alignItems="center" gap="$100" width="fit-content">
                                            <Text typography="body2" foreground="normal-200">
                                                <span>
                                                    {prop.name}
                                                    {!prop.required && '?'}
                                                </span>
                                            </Text>
                                            {prop.description && (
                                                <InfoPopover>
                                                    <ReactMarkdown
                                                        components={{
                                                            code: ({ children }) => (
                                                                <code className="px-1 py-0.5 rounded bg-v-gray-100 text-sm">
                                                                    {children}
                                                                </code>
                                                            ),
                                                        }}
                                                    >
                                                        {prop.description}
                                                    </ReactMarkdown>
                                                </InfoPopover>
                                            )}
                                        </HStack>
                                    </td>
                                    <td
                                        className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] min-w-[100px] w-px ${isLast ? 'border-b-0' : ''}`}
                                    >
                                        {prop.defaultValue ? (
                                            <Badge colorPalette="hint" size="md">
                                                {prop.defaultValue}
                                            </Badge>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td
                                        className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] ${isLast ? 'rounded-br-[var(--vapor-size-borderRadius-300)] border-b-0' : ''}`}
                                    >
                                        <Flex gap="$100" className="flex-wrap">
                                            {Array.isArray(prop.type) ? (
                                                prop.type.map((typeValue) => (
                                                    <Badge
                                                        key={typeValue}
                                                        colorPalette="hint"
                                                        size="md"
                                                    >
                                                        {typeValue}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <Badge colorPalette="hint" size="md">
                                                    {prop.type}
                                                </Badge>
                                            )}
                                        </Flex>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </VStack>
        </VStack>
    );
};
