import { Fragment } from 'react';

import { Badge, Text } from '@vapor-ui/core';
import clsx from 'clsx';

import { ComponentAccessibilityDataMap } from '~/constants/accessibility';

interface RawAccessibilityItem {
    accessibility: string;
    description: string;
    headerDescription?: string;
    // optional for advanced view
    badgeColor?: 'primary' | 'success' | 'warning' | 'danger' | 'contrast' | 'hint';
    exampleCode?: string;
}

export type AccessibilitySectionItem = {
    itemKey: string;
    badgeColor?: 'primary' | 'success' | 'warning' | 'danger' | 'contrast' | 'hint';
    descriptions: string[];
    exampleCode?: string;
};

export interface AccessibilitySection {
    title?: string;
    headerList: { [key: string]: string };
    items: AccessibilitySectionItem[];
}

export interface AccessibilityData {
    headingDescription?: string;
    sections: AccessibilitySection[];
}

export interface AccessibilityTableProps {
    file?: string;
    className?: string;
}

/* ---------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------*/

const transformRawJson = (raw: RawAccessibilityItem[]): AccessibilityData => {
    if (!raw.length) {
        return { sections: [] };
    }

    const headingDescription = raw[0].headerDescription;

    const items: AccessibilitySectionItem[] = raw.map((item) => ({
        itemKey: item.accessibility,
        descriptions: [item.description],
        badgeColor: item.badgeColor ?? 'primary',
        exampleCode: item.exampleCode,
    }));

    return {
        headingDescription,
        sections: [
            {
                headerList: {
                    itemKey: 'Accessibility',
                    descriptions: '설명',
                } as unknown as { [key: string]: string },
                items,
            },
        ],
    };
};

/* ---------------------------------------------------------------------------
 * Normalizer: accepts various JSON shapes and converts to AccessibilityData
 * -------------------------------------------------------------------------*/

/**
 * Accepts raw JSON (could be array, object with `sections`, or object with
 *  `devNote` / `a11ySupport` / `keyboardInteractions`) and converts it to the
 * canonical `AccessibilityData` structure used by the presentational layer.
 */
const normalizeAccessibilityData = (input: unknown): AccessibilityData => {
    // Case 1: Array input
    if (Array.isArray(input)) {
        if (
            input.length > 0 &&
            typeof input[0] === 'object' &&
            input[0] !== null &&
            'sections' in (input[0] as Record<string, unknown>)
        ) {
            return input[0] as unknown as AccessibilityData;
        }
        return transformRawJson(input as RawAccessibilityItem[]);
    }

    // Case 2: Object input
    if (input && typeof input === 'object') {
        const obj = input as Record<string, unknown>;

        if ('sections' in obj) {
            return obj as unknown as AccessibilityData;
        }

        // Shape with devNote / a11ySupport / keyboardInteractions, etc.
        const headingDescription = obj['headingDescription'] as string | undefined;
        const potentialSectionsKeys = [
            'devNote',
            'a11ySupport',
            'keyboardInteractions',
            // In case there are additional custom keys, add here.
        ];

        const sections = potentialSectionsKeys
            .map((key) => obj[key] as AccessibilitySection | undefined)
            .filter(Boolean) as AccessibilitySection[];

        return {
            headingDescription,
            sections,
        };
    }

    // Fallback: empty
    return { sections: [] };
};

/* ---------------------------------------------------------------------------
 * Presentational sub-components
 * -------------------------------------------------------------------------*/

const Heading = ({ description }: { description?: string }) => {
    if (!description) return null;
    return <p className="text-base leading-6 text-gray-700 whitespace-pre-line">{description}</p>;
};

const Section = ({ section }: { section: AccessibilitySection }) => {
    const { title, headerList, items } = section;
    if (!items?.length) return null;
    return (
        <div className="flex flex-col gap-4 w-full">
            {title && (
                <Text typography="body1" foreground="hint-darker">
                    {title}
                </Text>
            )}
            <table className="not-prose w-full table-auto border-collapse text-sm text-left m-0 rounded-lg overflow-hidden [outline:0.0625rem_solid_var(--vapor-color-border-normal)]">
                <thead className="bg-gray-50">
                    <tr>
                        {Object.values(headerList).map((header) => (
                            <th
                                key={header}
                                className="px-4 py-2 border-b font-medium text-gray-700"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, i) => (
                        <Fragment key={item.itemKey}>
                            <tr className="odd:bg-white even:bg-gray-50">
                                {/* First column */}
                                <td
                                    className={clsx(
                                        'px-4 py-4 whitespace-nowrap align-middle',
                                        i !== items.length - 1 && 'border-b',
                                    )}
                                >
                                    <Badge color={item.badgeColor ?? 'primary'}>
                                        {item.itemKey}
                                    </Badge>
                                </td>
                                {/* Description column */}
                                <td
                                    className={clsx(
                                        'px-4 py-2 align-middle',
                                        i !== items.length - 1 && 'border-b',
                                    )}
                                >
                                    {item.descriptions.map((desc) => (
                                        <p key={desc} className="mb-1 last:mb-0">
                                            {desc}
                                        </p>
                                    ))}
                                </td>
                            </tr>
                            {item.exampleCode && (
                                <tr>
                                    <td colSpan={Object.keys(headerList).length} className="p-0">
                                        <pre className="bg-gray-100 p-4 overflow-auto text-xs leading-relaxed">
                                            {item.exampleCode}
                                        </pre>
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

/* ---------------------------------------------------------------------------
 * Main component
 * -------------------------------------------------------------------------*/

const AccessibilityTable = ({ file, className }: AccessibilityTableProps) => {
    let resolved: AccessibilityData | null = null;
    if (file && file in ComponentAccessibilityDataMap) {
        resolved = normalizeAccessibilityData(ComponentAccessibilityDataMap[file]);
    } else if (file) {
        console.error(`AccessibilityTable: No accessibility data preloaded for file "${file}"`);
    }

    if (resolved === null) {
        return null;
    }

    if (!resolved.sections.length) {
        return <p>표시할 데이터가 없습니다.</p>;
    }

    return (
        <div className={clsx('flex flex-col gap-8 w-full', className)}>
            <Heading description={resolved.headingDescription} />
            {resolved.sections.map((section: AccessibilitySection, idx: number) => (
                <Section key={idx} section={section} />
            ))}
        </div>
    );
};

export default AccessibilityTable;
