import { readComponentApi } from '~/utils/component-api';

import { PropsTableView } from './props-table-view';

interface ComponentPropsTableProps {
    /** Part file name without `.json`, e.g. `button` or `avatar-root`. */
    componentName: string;
}

/** Reads the part's generated API JSON at build time and renders its props table. */
export const ComponentPropsTable = ({ componentName }: ComponentPropsTableProps) => {
    const componentData = readComponentApi(componentName, 'ko');

    if (!componentData) {
        throw new Error(`No API JSON for "${componentName}". Run \`pnpm docs:api\`.`);
    }

    return <PropsTableView componentData={componentData} />;
};
