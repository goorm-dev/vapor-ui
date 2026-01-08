import { Tabs as VaporTabs } from '@vapor-ui/core';

interface TabsProps extends VaporTabs.Root.Props {
    lists: { value: string; trigger: React.ReactNode; panel: React.ReactNode }[];
}

export const Tabs = ({ lists, ...props }: TabsProps) => {
    return (
        <VaporTabs.Root {...props}>
            <VaporTabs.List>
                {lists.map((list) => (
                    <VaporTabs.Button key={list.value} value={list.value}>
                        {list.trigger}
                    </VaporTabs.Button>
                ))}
            </VaporTabs.List>

            {lists.map((list) => (
                <VaporTabs.Panel key={list.value} value={list.value}>
                    {list.panel}
                </VaporTabs.Panel>
            ))}
        </VaporTabs.Root>
    );
};
