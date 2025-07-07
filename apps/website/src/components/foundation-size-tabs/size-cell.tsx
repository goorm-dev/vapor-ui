'use client';

import { Badge } from '@vapor-ui/core';

type SemanticSizeRowProps = {
    sizeType?: 'width' | 'height' | 'borderRadius';
    name: string;
    value: string;
};

const SemanticSizeRow = ({ sizeType = 'width', name, value }: SemanticSizeRowProps) => {
    const isBorderRadius = sizeType === 'borderRadius';

    return (
        <tr tabIndex={0} role="button">
            <td>
                <Badge size="sm" color="hint">
                    {name}
                </Badge>
            </td>
            <td>{value}</td>
            <td>
                <div
                    style={{
                        width: isBorderRadius ? ' 5rem' : `var(--${name})`,
                        height: isBorderRadius ? ' 5rem' : `var(--${name})`,
                        backgroundColor: 'var(--vapor-color-blue-100)',
                        borderRadius: isBorderRadius ? `var(--${name})` : '0',
                    }}
                />
            </td>
        </tr>
    );
};

export default SemanticSizeRow;
