import { Fragment } from 'react';

import { Text, VStack } from '@vapor-ui/core';

import type { PropDefinition } from '~/utils/component-api';
import { _readComponentApi } from '~/utils/component-api';

import { getHighlightDetailedType } from './get-highlight-detailed-type';
import { getHighlightTokens } from './get-highlight-tokens';
import { PropRow } from './prop-row';
import type { HighlightedPropRow } from './types';

interface PropsTableProps {
    file: string;
}

export const PropsTable = async ({ file }: PropsTableProps) => {
    const componentData = _readComponentApi(file, 'ko');
    if (!componentData) {
        throw new Error(`No API JSON for "${file}". Run \`pnpm docs:api\`.`);
    }

    const { props, typeRefs } = componentData;

    if (props.length === 0) {
        return (
            <Text typography="body2" foreground="hint-100" className="not-prose">
                No props exposed by this part.
            </Text>
        );
    }

    const rows = await Promise.all(props.map((prop) => highlightProp(prop, typeRefs)));
    const requiredRows = rows.filter((row) => row.required);
    const optionalRows = rows.filter((row) => !row.required);

    return (
        <VStack className="not-prose" $css={{ gap: '$500' }}>
            <PropsAccordion name="Required" rows={requiredRows} />
            <PropsAccordion name="Optional" rows={optionalRows} />
        </VStack>
    );
};

/* -----------------------------------------------------------------------------------------------*/

interface PropsAccordionProps {
    name: string;
    rows: HighlightedPropRow[];
}

const PropsAccordion = ({ name, rows }: PropsAccordionProps) => {
    if (rows.length === 0) return null;

    return (
        <VStack $css={{ gap: '$200' }}>
            <Text $css={{ marginTop: '$300', marginLeft: '$300' }} typography="subtitle1">
                {name}
            </Text>

            <div className="border-v-normal border-y">
                {rows.map((row) => (
                    <PropRow key={row.key} row={row} />
                ))}
            </div>
        </VStack>
    );
};

/* -----------------------------------------------------------------------------------------------*/

async function highlightProp(
    prop: PropDefinition,
    typeRefs: Record<string, string> | undefined,
): Promise<HighlightedPropRow> {
    const types = Array.isArray(prop.type) ? prop.type : [prop.type];

    const [highlightedTypes, detailedType, defaultValue] = await Promise.all([
        Promise.all(types.map((t) => getHighlightTokens(t))),
        prop.detailedType
            ? getHighlightDetailedType(prop.detailedType, typeRefs)
            : Promise.resolve(undefined),
        prop.defaultValue ? getHighlightTokens(prop.defaultValue) : Promise.resolve(undefined),
    ]);

    return {
        key: prop.name,
        name: prop.name,
        description: prop.description,
        required: prop.required,
        types: highlightedTypes.map((node, index) => <Fragment key={index}>{node}</Fragment>),
        detailedType,
        defaultValue,
    };
}
