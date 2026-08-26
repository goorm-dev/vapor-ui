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
    width: 100%;
    min-width: 0;
    min-height: 320px;
    padding: 16px;
    box-sizing: border-box;
    transform: translateZ(0);
    overflow: hidden;
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
    max-width: 100% !important;
    max-height: 100% !important;
    box-sizing: border-box !important;
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

/* -----------------------------------------------------------------------------------------------
 * Regression.Table
 * -----------------------------------------------------------------------------------------------*/

type RegressionCondition<Key extends PropertyKey = PropertyKey, Value = unknown> = {
    key: Key;
    label: ReactNode;
    values: readonly Value[];
    format: (value: Value) => ReactNode;
};

type AnyRegressionCondition = RegressionCondition<PropertyKey, unknown>;

type RegressionRow<C extends readonly AnyRegressionCondition[]> = {
    [K in C[number]['key']]: Extract<C[number], { key: K }>['values'][number];
};

type RegressionTableProps<C extends readonly AnyRegressionCondition[]> = {
    conditions: C;
    render: (row: RegressionRow<C>, container: HTMLElement | null) => ReactNode;
};

const RegressionTable = <const C extends readonly AnyRegressionCondition[]>({
    conditions,
    render,
}: RegressionTableProps<C>) => {
    const conditionMap = Object.fromEntries(
        conditions.map((condition) => [condition.key, condition.values]),
    );

    const rows = cartesianRows(conditionMap) as RegressionRow<C>[];

    return (
        <RegressionRoot>
            <RegressionColumnGroup>
                {conditions.map((_, colIdx) => (
                    <RegressionConditionColumn key={colIdx} />
                ))}
                <RegressionRenderColumn />
            </RegressionColumnGroup>
            <RegressionHeader>
                <RegressionRow>
                    {conditions.map((condition, colIdx) => (
                        <RegressionHeading key={colIdx}>{condition.label}</RegressionHeading>
                    ))}
                    <RegressionHeading>render</RegressionHeading>
                </RegressionRow>
            </RegressionHeader>
            <RegressionBody>
                {rows.map((row, rowIdx) => (
                    <RegressionRow key={rowIdx}>
                        {conditions.map((condition, colIdx) => (
                            <RegressionCondition key={colIdx}>
                                {condition.format(row[condition.key as keyof RegressionRow<C>])}
                            </RegressionCondition>
                        ))}
                        <RegressionRender>{(container) => render(row, container)}</RegressionRender>
                    </RegressionRow>
                ))}
            </RegressionBody>
            <Table.Footer>
                <Table.Row>
                    <Table.Cell
                        colSpan={conditions.length + 1}
                        $css={{
                            padding: '10px 16px',
                            border: '1px solid rgba(0, 0, 0, 0.12)',
                            textAlign: 'right',
                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        }}
                    >
                        총 {rows.length}개 케이스
                    </Table.Cell>
                </Table.Row>
            </Table.Footer>
        </RegressionRoot>
    );
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
    Table: RegressionTable,
};
