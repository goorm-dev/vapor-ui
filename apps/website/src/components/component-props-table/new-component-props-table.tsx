'use client';

import React from 'react';

import { Badge, Text } from '@vapor-ui/core';

import { InfoPopover } from '~/components/Info';

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

interface NewComponentPropsTableProps {
    componentName: string;
}

const NewComponentPropsTable: React.FC<NewComponentPropsTableProps> = ({ componentName }) => {
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
        <div
            className="w-full not-prose"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 'var(--vapor-size-space-200)',
            }}
        >
            <Text typography="body1" foreground="normal-200">
                {componentData.description.split('Documentation')[0].trim()}
            </Text>
            <div className="w-full overflow-auto flex flex-col items-start gap-0 self-stretch rounded-[var(--vapor-size-borderRadius-300)]">
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
                        {componentData.props.map((prop, index) => (
                            <tr key={prop.name}>
                                <td
                                    className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] min-w-[140px] w-px ${index === componentData.props.length - 1 ? 'rounded-bl-[var(--vapor-size-borderRadius-300)] border-b-0' : ''}`}
                                >
                                    <div className="flex items-center gap-[var(--vapor-size-space-100)] w-fit">
                                        <Text typography="body2" foreground="normal-200">
                                            <span>
                                                {prop.name}
                                                {!prop.required && '?'}
                                            </span>
                                        </Text>
                                        <InfoPopover>{prop.description}</InfoPopover>
                                    </div>
                                </td>
                                <td
                                    className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] min-w-[100px] w-px ${index === componentData.props.length - 1 ? 'border-b-0' : ''}`}
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
                                    className={`px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] border-b border-b-[var(--vapor-color-border-normal)] ${index === componentData.props.length - 1 ? 'rounded-br-[var(--vapor-size-borderRadius-300)] border-b-0' : ''}`}
                                >
                                    <div className="flex flex-wrap gap-[var(--vapor-size-space-100)]">
                                        {Array.isArray(prop.type) ? (
                                            prop.type.map((typeValue) => (
                                                <Badge key={typeValue} color="hint" size="md">
                                                    {typeValue}
                                                </Badge>
                                            ))
                                        ) : (
                                            <Badge color="hint" size="md">
                                                {prop.type}
                                            </Badge>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NewComponentPropsTable;
