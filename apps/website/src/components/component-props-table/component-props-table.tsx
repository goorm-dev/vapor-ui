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

interface ComponentData {
    name: string;
    displayName: string;
    description: string;
    props: PropDefinition[];
    generatedAt: string;
    sourceFile: string;
}

interface ComponentPropsTableProps {
    componentName: string;
}

export const ComponentPropsTable = ({ componentName }: ComponentPropsTableProps) => {
    const [componentData, setComponentData] = React.useState<ComponentData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const loadComponentData = async () => {
            try {
                const response = await fetch(`/components/generated/${componentName}.json`);
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

    if (!componentData || componentData.props.length === 0) {
        return <p>No props available for this component.</p>;
    }

    return (
        <VStack className="w-full not-prose" alignItems="flex-start" gap="$200">
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
                    className="w-full  border-separate border-spacing-0 overflow-hidden border border-v-normal rounded-v-300"
                    style={{ tableLayout: 'auto' }}
                >
                    <thead className="w-full items-start self-stretch rounded-v-300">
                        {/* TODO: surface 토큰 없음 - secondary로 대체 */}
                        <tr className="w-full bg-v-secondary-200 border-b border-b-v-normal">
                            <th className="px-v-300 h-v-500 text-left rounded-tl-v-300 min-w-[140px] w-px">
                                <Text typography="subtitle1" foreground="normal-100">
                                    Prop
                                </Text>
                            </th>
                            <th className="px-v-300 h-v-500 text-left min-w-[100px] w-px">
                                <Text typography="subtitle1" foreground="normal-100">
                                    Default
                                </Text>
                            </th>
                            <th className="w-full px-v-300 h-v-500 text-left font-medium">
                                <Text typography="subtitle1" foreground="normal-100">
                                    Type
                                </Text>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {componentData.props.map((prop, index) => (
                            <tr key={prop.name}>
                                <td
                                    className={` px-v-300 py-v-200 border-b border-b-v-normal min-w-[140px] w-px ${index === componentData.props.length - 1 ? 'rounded-bl-v-300 border-b-0' : ''}`}
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
                                    className={`px-v-300 py-v-200 border-b border-b-v-normal min-w-[100px] w-px ${index === componentData.props.length - 1 ? 'border-b-0' : ''}`}
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
                                    className={`px-v-300 py-v-200 border-b border-b-v-normal ${index === componentData.props.length - 1 ? 'rounded-br-v-300 border-b-0' : ''}`}
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
                        ))}
                    </tbody>
                </table>
            </VStack>
        </VStack>
    );
};
