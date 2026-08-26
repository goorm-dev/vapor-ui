import type { ReactNode } from 'react';
import { useState } from 'react';

import { Box, Table } from '@vapor-ui/core';

/* -----------------------------------------------------------------------------------------------
 * Regression.Root
 * -----------------------------------------------------------------------------------------------*/

const RegressionRoot = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <style>{portalResetStyles}</style>
            <Box $css={{ width: '100%', overflowX: 'auto' }}>
                <Table.Root
                    $css={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}
                >
                    {children}
                </Table.Root>
            </Box>
        </>
    );
};

const portalResetStyles = `
.regression-cell {
    position: relative;
    display: flex;
    justify-content: flex-start;
    width: fit-content;
    min-width: 100%;
    min-height: 320px;
    padding: 16px;
    box-sizing: border-box;
    transform: translateZ(0);
}
.regression-cell [data-base-ui-portal] {
    position: static !important;
    display: contents !important;
}
.regression-cell [data-base-ui-portal] > [data-open][role="presentation"] {
    position: static !important;
    inset: auto !important;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    transform: none !important;
    max-height: 100% !important;
}
`;

/* -----------------------------------------------------------------------------------------------
 * Regression.ColumnGroup
 * -----------------------------------------------------------------------------------------------*/

const RegressionColumnGroup = ({ children }: { children: ReactNode }) => {
    return <Table.ColumnGroup>{children}</Table.ColumnGroup>;
};

/* -----------------------------------------------------------------------------------------------
 * Regression.ConditionColumn
 * -----------------------------------------------------------------------------------------------*/

const RegressionConditionColumn = () => {
    return <Table.Column $css={{ width: 'auto' }} />;
};

/* -----------------------------------------------------------------------------------------------
 * Regression.RenderColumn
 * -----------------------------------------------------------------------------------------------*/

const RegressionRenderColumn = () => {
    return <Table.Column $css={{ width: '100%' }} />;
};

/* -----------------------------------------------------------------------------------------------
 * Regression.Header
 * -----------------------------------------------------------------------------------------------*/

const RegressionHeader = ({ children }: { children: ReactNode }) => {
    return <Table.Header>{children}</Table.Header>;
};

/* -----------------------------------------------------------------------------------------------
 * Regression.Body
 * -----------------------------------------------------------------------------------------------*/

const RegressionBody = ({ children }: { children: ReactNode }) => {
    return <Table.Body>{children}</Table.Body>;
};

/* -----------------------------------------------------------------------------------------------
 * Regression.Row
 * -----------------------------------------------------------------------------------------------*/

const RegressionRow = ({ children }: { children: ReactNode }) => {
    return <Table.Row>{children}</Table.Row>;
};

/* -----------------------------------------------------------------------------------------------
 * Regression.Heading
 * -----------------------------------------------------------------------------------------------*/

const RegressionHeading = ({ children }: { children: ReactNode }) => {
    return (
        <Table.Heading
            scope="col"
            $css={{
                padding: '12px 16px',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                verticalAlign: 'top',
                textAlign: 'left',
                fontSize: '13px',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                fontWeight: '600',
            }}
        >
            {children}
        </Table.Heading>
    );
};

/* -----------------------------------------------------------------------------------------------
 * Regression.Condition
 * -----------------------------------------------------------------------------------------------*/

const RegressionCondition = ({ children }: { children: ReactNode }) => {
    return (
        <Table.Cell
            $css={{
                padding: '12px 16px',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                verticalAlign: 'top',
                textAlign: 'left',
                fontSize: '13px',
                whiteSpace: 'nowrap',
            }}
        >
            {children}
        </Table.Cell>
    );
};

/* -----------------------------------------------------------------------------------------------
 * Regression.Render
 * -----------------------------------------------------------------------------------------------*/

const RegressionRender = ({
    children: childrenProp,
}: {
    children: ((container: HTMLElement | null) => ReactNode) | ReactNode;
}) => {
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const children = typeof childrenProp === 'function' ? childrenProp(container) : childrenProp;

    return (
        <Table.Cell
            $css={{
                padding: '0',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                verticalAlign: 'top',
                textAlign: 'left',
            }}
        >
            <div ref={setContainer} className="regression-cell">
                {children}
            </div>
        </Table.Cell>
    );
};

/* -----------------------------------------------------------------------------------------------
 * cartesianRows
 * -----------------------------------------------------------------------------------------------*/

export type CartesianRows<T extends Record<string, readonly unknown[]>> = Array<{
    [K in keyof T]: T[K][number];
}>;

export const cartesianRows = <T extends Record<string, readonly unknown[]>>(
    conditions: T,
): CartesianRows<T> => {
    const keys = Object.keys(conditions) as (keyof T)[];
    if (keys.length === 0) return [{}] as CartesianRows<T>;

    return keys.reduce<Array<Partial<{ [K in keyof T]: T[K][number] }>>>(
        (acc, key) =>
            acc.flatMap((row) => conditions[key].map((value) => ({ ...row, [key]: value }))),
        [{}],
    ) as CartesianRows<T>;
};

/* -----------------------------------------------------------------------------------------------*/

export const Regression = {
    Root: RegressionRoot,
    ColumnGroup: RegressionColumnGroup,
    ConditionColumn: RegressionConditionColumn,
    RenderColumn: RegressionRenderColumn,
    Header: RegressionHeader,
    Body: RegressionBody,
    Row: RegressionRow,
    Heading: RegressionHeading,
    Condition: RegressionCondition,
    Render: RegressionRender,
};
