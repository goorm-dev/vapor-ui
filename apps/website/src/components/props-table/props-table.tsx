'use client';

import { useEffect, useState } from 'react';

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
    const [items, setItems] = useState<PropItem[] | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        fetch(`/components/${file}.json`, { signal: controller.signal })
            .then((res) => res.json())
            .then((json) => {
                setItems(json[section] ?? []);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    console.error(`Failed to load props from /components/${file}.json`, err);
                }
            });

        return () => controller.abort();
    }, [file, section]);

    if (items === null) {
        return null; // could return a spinner here if desired
    }

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
