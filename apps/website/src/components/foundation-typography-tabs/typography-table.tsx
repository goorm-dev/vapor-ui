'use client';

import { Badge } from '@vapor-ui/core';

type TypographyToken = {
    name: string;
    value: string;
    cssVariable: string;
};

type TypographyTableProps = {
    tokens: TypographyToken[];
};

const TypographyTable = ({ tokens }: TypographyTableProps) => {
    return (
        <div className="space-y-4">
            <table className="mt-0">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-sm text-gray-700">
                            Name
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-gray-700">
                            Value
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {tokens.map((token) => (
                        <tr key={token.name} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                                <Badge size="sm" color="hint">
                                    {token.cssVariable}
                                </Badge>
                            </td>
                            <td className="py-3 px-4 font-mono text-sm text-gray-600">
                                {token.value}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TypographyTable;
