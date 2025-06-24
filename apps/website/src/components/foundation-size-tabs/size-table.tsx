'use client';

import SizeCell from './size-cell';

type SizeTableProps = {
    header: string;
    description: string;
    sizes: Array<{ name: string; value: string }>;
    sizeType?: 'width' | 'height' | 'borderRadius';
};

function SizeTable({ sizes, sizeType = 'width' }: SizeTableProps) {
    return (
        <table className="mt-0">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Value</th>
                    <th>Example</th>
                </tr>
            </thead>
            <tbody>
                {sizes.map(({ name, value }) => (
                    <SizeCell key={name} sizeType={sizeType} name={name} value={value} />
                ))}
            </tbody>
        </table>
    );
}

export default SizeTable;
