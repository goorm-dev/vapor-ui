'use client';

import { ComponentDocsMap } from '~/constants/components';

interface PropItem {
    prop: string;
    type: string;
    default: string | number | null;
    description: string;
}

export interface PropsTableProps {
    /**
     * The base filename located under `/public/components` without extension.
     * For example, passing `"avatar"` will load `/components/avatar.json`.
     */
    file: string;
    /**
     * The key inside the JSON to be displayed.
     * Defaults to `"props"`.
     */
    section?: 'props' | 'imageProps' | 'fallbackProps' | 'simpleProps';
    /**
     * Additional classname to add to the table element.
     */
    className?: string;
}

const PropsTable = ({ file, section = 'props', className }: PropsTableProps) => {
    const doc = ComponentDocsMap[file];

    if (!doc) {
        console.error(`PropsTable: No documentation preloaded for file "${file}"`);
        return null;
    }

    const items = (doc[section] as PropItem[]) ?? [];

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
                {items.map(({ prop, type, default: defaultValue, description }) => (
                    <tr key={prop}>
                        <td>
                            <code>{prop}</code>
                        </td>
                        <td>
                            {type.split('|').map((segment, index, arr) => {
                                const value = segment.trim();
                                return (
                                    <span key={index}>
                                        <code>{value}</code>
                                        {index < arr.length - 1 && ' | '}
                                    </span>
                                );
                            })}
                        </td>
                        <td>
                            <code>{defaultValue !== null ? String(defaultValue) : '-'}</code>
                        </td>
                        <td>{description}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default PropsTable;
