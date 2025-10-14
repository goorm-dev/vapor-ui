'use client';

import { type ComponentPropsWithoutRef, forwardRef } from 'react';

import { Tabs as BaseTabs } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { Assign } from '~/utils/types';

import * as styles from './tabs.css';
import type { ListVariants, TriggerVariants } from './tabs.css';

type TabsVariants = ListVariants & TriggerVariants;
type TabsSharedProps = TabsVariants & { activateOnFocus?: boolean; loop?: boolean };
type TabsContext = TabsSharedProps;

const [TabsProvider, useTabsContext] = createContext<TabsContext>({
    name: 'TabsContext',
    hookName: 'useTabsContext',
    providerName: 'TabsProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Tabs.Root
 * -----------------------------------------------------------------------------------------------*/

export const TabsRoot = forwardRef<HTMLDivElement, TabsRoot.Props>(
    ({ className, ...props }, ref) => {
        const [sharedProps, otherProps] = createSplitProps<TabsSharedProps>()(props, [
            'activateOnFocus',
            'loop',
            'variant',
            'size',
            'disabled',
            'orientation',
        ]);

        const { orientation } = sharedProps;

        return (
            <TabsProvider value={sharedProps}>
                <BaseTabs.Root
                    ref={ref}
                    orientation={orientation}
                    className={clsx(styles.root({ orientation }), className)}
                    {...otherProps}
                />
            </TabsProvider>
        );
    },
);
TabsRoot.displayName = 'Tabs.Root';

/* -------------------------------------------------------------------------------------------------
 * Tabs.List
 * -----------------------------------------------------------------------------------------------*/

export const TabsList = forwardRef<HTMLDivElement, TabsList.Props>(
    ({ className, ...props }, ref) => {
        const { activateOnFocus, loop, variant, orientation } = useTabsContext();

        return (
            <BaseTabs.List
                ref={ref}
                activateOnFocus={activateOnFocus}
                loop={loop}
                className={clsx(styles.list({ variant, orientation }), className)}
                {...props}
            />
        );
    },
);
TabsList.displayName = 'Tabs.List';

/* -------------------------------------------------------------------------------------------------
 * Tabs.Trigger
 * -----------------------------------------------------------------------------------------------*/

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTrigger.Props>(
    ({ disabled: disabledProp, className, ...props }, ref) => {
        const { disabled: rootDisabled, size, orientation } = useTabsContext();

        const disabled = disabledProp || rootDisabled;

        return (
            <BaseTabs.Tab
                ref={ref}
                disabled={disabled}
                className={clsx(styles.trigger({ size, disabled, orientation }), className)}
                {...props}
            />
        );
    },
);
TabsTrigger.displayName = 'Tabs.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Tabs.Indicator
 * -----------------------------------------------------------------------------------------------*/

export const TabsIndicator = forwardRef<HTMLDivElement, TabsIndicator.Props>(
    ({ className, ...props }, ref) => {
        const { orientation } = useTabsContext();

        return (
            <BaseTabs.Indicator
                ref={ref}
                className={clsx(styles.indicator({ orientation }), className)}
                {...props}
            />
        );
    },
);
TabsIndicator.displayName = 'Tabs.Indicator';

/* -------------------------------------------------------------------------------------------------
 * Tabs.Panel
 * -----------------------------------------------------------------------------------------------*/

export const TabsPanel = forwardRef<HTMLDivElement, TabsPanel.Props>((props, ref) => {
    return <BaseTabs.Panel ref={ref} {...props} />;
});
TabsPanel.displayName = 'Tabs.Panel';

/* -----------------------------------------------------------------------------------------------*/

export namespace TabsRoot {
    type RootPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTabs.Root>;

    export interface Props extends RootPrimitiveProps, TabsSharedProps {}
}

export namespace TabsList {
    type ListPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTabs.List>;

    export interface Props extends Assign<ListPrimitiveProps, TabsSharedProps> {}
}

export namespace TabsTrigger {
    export interface Props extends ComponentPropsWithoutRef<typeof BaseTabs.Tab> {}
}

export namespace TabsIndicator {
    export interface Props extends ComponentPropsWithoutRef<typeof BaseTabs.Indicator> {}
}

export namespace TabsPanel {
    export interface Props extends ComponentPropsWithoutRef<typeof BaseTabs.Panel> {}
}
