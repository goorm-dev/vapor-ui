'use client';

import { forwardRef } from 'react';

import { Tabs } from '@base-ui/react/tabs';

interface LocalTabsProps {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
}

interface LocalTabsListProps {
    children: React.ReactNode;
}

interface LocalTabProps {
    value: string;
    children: React.ReactNode;
}

interface LocalTabsContentProps {
    value: string;
    children: React.ReactNode;
}

const LocalTabs = ({ children, value, defaultValue, onValueChange }: LocalTabsProps) => {
    return (
        <Tabs.Root
            defaultValue={defaultValue}
            value={value}
            onValueChange={onValueChange}
            className="w-full flex flex-col gap-[var(--vapor-size-space-150)] items-center"
        >
            {children}
        </Tabs.Root>
    );
};

const LocalTabsIndicator = forwardRef<HTMLDivElement, {}>((props, ref) => {
    return (
        <Tabs.Indicator
            ref={ref}
            className="absolute bottom-[-1px] left-0 h-[2px] bg-[var(--vapor-color-border-primary)] transition-all duration-200 ease-in-out"
            style={{
                width: 'var(--active-tab-width)',
                transform: 'translateX(var(--active-tab-left))',
                transitionProperty: 'translate, width',
            }}
            {...props}
        />
    );
});

const LocalTabsList = forwardRef<HTMLDivElement, LocalTabsListProps>(({ children }, ref) => {
    return (
        <Tabs.List
            ref={ref}
            className="relative justify-center flex w-[600px] max-[991px]:w-full h-[var(--vapor-size-dimension-500)] px-[var(--vapor-size-space-000)] py-0 items-start gap-[var(--vapor-size-space-100)] border-b border-[var(--vapor-color-border-normal)]"
        >
            {children}
            <LocalTabsIndicator />
        </Tabs.List>
    );
});

const LocalTab = forwardRef<HTMLButtonElement, LocalTabProps>(({ children, value }, ref) => {
    return (
        <Tabs.Tab
            ref={ref}
            value={value}
            className="flex px-[var(--vapor-size-space-000)] py-0 justify-center items-center gap-[var(--space-075)] flex-1 self-stretch bg-transparent border-none cursor-pointer text-[var(--vapor-color-foreground-hint)] text-sm font-normal transition-all duration-200 ease-in-out data-[active]:text-[var(--vapor-color-foreground-primary)] data-[active]:font-medium [&[data-active]_span]:!text-[var(--vapor-color-foreground-primary)]"
        >
            {children}
        </Tabs.Tab>
    );
});

const LocalTabsContent = forwardRef<HTMLDivElement, LocalTabsContentProps>(
    ({ children, value }, ref) => {
        return (
            <Tabs.Panel ref={ref} value={value}>
                {children}
            </Tabs.Panel>
        );
    },
);

LocalTabsList.displayName = 'LocalTabsList';
LocalTab.displayName = 'LocalTab';
LocalTabsContent.displayName = 'LocalTabsContent';
LocalTabsIndicator.displayName = 'LocalTabsIndicator';

export { LocalTabs, LocalTabsList, LocalTab, LocalTabsContent, LocalTabsIndicator };
