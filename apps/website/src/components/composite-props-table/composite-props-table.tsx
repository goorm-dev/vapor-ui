import { VStack } from '@vapor-ui/core';

import { readComponentApi } from '~/utils/component-api';

import { PartTable } from './part-table';

export interface CompositePart {
    /** Part file name without `.json`, e.g. `dialog`, `dialog-action`. */
    file: string;
    /** Public API name to show as the part heading, e.g. `Dialog.Root`, `Dialog.Action`. */
    name: string;
}

interface CompositePropsTableProps {
    /** Parts to document on the page, in display order. */
    parts: CompositePart[];
}

export const CompositePropsTable = ({ parts }: CompositePropsTableProps) => {
    const partData = parts.map(({ file, name }) => {
        const data = readComponentApi(file, 'ko');
        if (!data) {
            throw new Error(`No API JSON for "${file}". Run \`pnpm docs:api\`.`);
        }
        return { file, name, data };
    });

    return (
        <VStack className="not-prose w-full" $css={{ gap: '$500', alignItems: 'stretch' }}>
            {partData.map(({ file, name, data }) => (
                <PartTable key={file} partName={name} componentData={data} />
            ))}
        </VStack>
    );
};
