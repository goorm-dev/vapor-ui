'use client';

import { Badge, Text } from '@vapor-ui/core';

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
                        <Text
                            foreground="normal"
                            typography="subtitle1"
                            render={<th />}
                            className="text-left py-3 px-4 "
                        >
                            Name
                        </Text>
                        <Text
                            foreground="normal"
                            typography="subtitle1"
                            render={<th />}
                            className="text-left py-3 px-4 "
                        >
                            Value
                        </Text>
                    </tr>
                </thead>
                <tbody>
                    {tokens.map((token) => (
                        <tr key={token.name} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                                <Badge size="sm" color="hint">
                                    {token.cssVariable}
                                </Badge>
                            </td>
                            <Text
                                foreground="normal"
                                typography="subtitle1"
                                render={<td />}
                                className="text-left py-3 px-4 "
                            >
                                {token.value}
                            </Text>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TypographyTable;
