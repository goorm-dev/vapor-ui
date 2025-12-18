'use client';

import { type ComponentPropsWithoutRef, forwardRef } from 'react';

import { Tabs as BaseTabs } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { Assign } from '~/utils/types';

import * as styles from './tabs.css';
import type { ListVariants, TriggerVariants } from './tabs.css';

type StyleVariants = ListVariants & TriggerVariants;

type RootControlledProps = {
    activateOnFocus?: boolean;
    loop?: boolean;
    disabled?: boolean;
};

type TabsContextValue = StyleVariants & RootControlledProps;

const [TabsProvider, useTabsContext] = createContext<TabsContextValue>({
    name: 'TabsContext',
    hookName: 'useTabsContext',
    providerName: 'TabsProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Tabs.Root
 * -----------------------------------------------------------------------------------------------*/

export const TabsRoot = forwardRef<HTMLDivElement, TabsRoot.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const [contextProps, otherProps] = createSplitProps<TabsContextValue>()(componentProps, [
        'activateOnFocus',
        'loop',
        'variant',
        'size',
        'disabled',
        'orientation',
    ]);

    const { orientation } = contextProps;

    return (
        <TabsProvider value={contextProps}>
            <BaseTabs.Root
                ref={ref}
                orientation={orientation}
                className={clsx(styles.root({ orientation }), className)}
                {...otherProps}
            />
        </TabsProvider>
    );
});
TabsRoot.displayName = 'Tabs.Root';

/* -------------------------------------------------------------------------------------------------
 * Tabs.List
 * -----------------------------------------------------------------------------------------------*/

export const TabsList = forwardRef<HTMLDivElement, TabsList.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const { activateOnFocus, loop, variant, orientation } = useTabsContext();

    return (
        <BaseTabs.List
            ref={ref}
            loop={loop}
            activateOnFocus={activateOnFocus}
            className={clsx(styles.list({ variant, orientation }), className)}
            {...componentProps}
        />
    );
});
TabsList.displayName = 'Tabs.List';

/* -------------------------------------------------------------------------------------------------
 * Tabs.Trigger
 * -----------------------------------------------------------------------------------------------*/

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTrigger.Props>((props, ref) => {
    const { disabled: disabledProp, className, ...componentProps } = resolveStyles(props);
    const { disabled: rootDisabled, size, orientation, variant } = useTabsContext();

    const disabled = disabledProp || rootDisabled;

    return (
        <BaseTabs.Tab
            ref={ref}
            disabled={disabled}
            className={clsx(styles.trigger({ size, variant, orientation }), className)}
            {...componentProps}
        />
    );
});
TabsTrigger.displayName = 'Tabs.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Tabs.Indicator
 * -----------------------------------------------------------------------------------------------*/

export const TabsIndicator = forwardRef<HTMLDivElement, TabsIndicator.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const { orientation, variant } = useTabsContext();

    return (
        <BaseTabs.Indicator
            ref={ref}
            className={clsx(styles.indicator({ orientation, variant }), className)}
            {...componentProps}
        />
    );
});
TabsIndicator.displayName = 'Tabs.Indicator';

/* -------------------------------------------------------------------------------------------------
 * Tabs.Panel
 * -----------------------------------------------------------------------------------------------*/

export const TabsPanel = forwardRef<HTMLDivElement, TabsPanel.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseTabs.Panel ref={ref} {...componentProps} />;
});
TabsPanel.displayName = 'Tabs.Panel';

/* -----------------------------------------------------------------------------------------------*/

export namespace TabsRoot {
    type BaseProps = ComponentPropsWithoutRef<typeof BaseTabs.Root>;

    export interface Props extends BaseProps, StyleVariants, RootControlledProps {}
    export type ChangeEventDetails = BaseTabs.Root.ChangeEventDetails;
}

export namespace TabsList {
    type BaseProps = ComponentPropsWithoutRef<typeof BaseTabs.List>;

    export interface Props extends Assign<BaseProps, TabsContextValue> {}
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
