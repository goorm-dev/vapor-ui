'use client';

import { Badge, Text } from '@vapor-ui/core';

import { ComponentDocsMap } from '~/constants/components';

export interface PropsTableProps {
    /**
     * The base filename located under `/public/components` without extension.
     * For example, passing `"avatar"` will load `/components/avatar.json`.
     */
    file: string;

    /**
     * Additional classname to add to the table element.
     */
    className?: string;
}

const PropsTable = ({ file, className }: PropsTableProps) => {
    const doc = ComponentDocsMap[file];

    if (!doc) {
        console.error(`PropsTable: No documentation preloaded for file "${file}"`);
        return null;
    }

    const items = doc.props ?? [];

    if (items.length === 0) {
        return <p>표시할 데이터가 없습니다.</p>;
    }

    return (
        <table className={className}>
            <thead>
                <tr>
                    <th>이름</th>
                    <th>타입</th>
                    <th>기본값</th>
                    <th>설명</th>
                </tr>
            </thead>
            <tbody>
                {items.map(({ name, type, defaultValue, description }) => (
                    <tr key={name}>
                        <td>
                            <Text typography="body2" foreground="normal-200">
                                {name}
                            </Text>
                        </td>
                        <td>
                            <div className="flex flex-col gap-[var(--vapor-size-space-100)]">
                                {(Array.isArray(type) ? type : type.split('|')).map(
                                    (segment, index) => {
                                        const value = segment.trim ? segment.trim() : segment;
                                        return (
                                            <Badge
                                                key={index}
                                                color="hint"
                                                shape="square"
                                                className="w-max"
                                            >
                                                {value}
                                            </Badge>
                                        );
                                    },
                                )}
                            </div>
                        </td>
                        <td>
                            <Badge color="hint" shape="square" className="w-max">
                                {defaultValue !== null ? String(defaultValue) : '-'}
                            </Badge>
                        </td>
                        <td>{description}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default PropsTable;
