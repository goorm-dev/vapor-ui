import type { ReactNode } from 'react';

import { Tabs as VaporTabs } from '@vapor-ui/core';

export interface DocsTabsProps extends Omit<VaporTabs.Root.Props, 'defaultValue' | 'children'> {
    items: string[];
    defaultValue?: string;
    children: ReactNode;
}

export const DocsTabs = ({ items, defaultValue, children, ...props }: DocsTabsProps) => (
    <VaporTabs.Root defaultValue={defaultValue ?? items[0]} {...props}>
        <VaporTabs.List>
            {items.map((item) => (
                <VaporTabs.Button key={item} value={item}>
                    {item}
                </VaporTabs.Button>
            ))}
        </VaporTabs.List>
        {children}
    </VaporTabs.Root>
);

export interface DocsTabProps extends VaporTabs.Panel.Props {
    value: string;
}

export const DocsTab = (props: DocsTabProps) => <VaporTabs.Panel {...props} />;
