'use client';

import { type ComponentPropsWithoutRef, forwardRef } from 'react';

import { Tabs as BaseTabs } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';

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

type RootPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTabs.Root>;
interface TabsRootProps extends RootPrimitiveProps, TabsSharedProps {}

const Root = forwardRef<HTMLDivElement, TabsRootProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const [sharedProps, otherProps] = createSplitProps<TabsSharedProps>()(componentProps, [
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
});
Root.displayName = 'Tabs.Root';

/* -------------------------------------------------------------------------------------------------
 * Tabs.List
 * -----------------------------------------------------------------------------------------------*/

type ListPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTabs.List>;
interface TabsListProps extends Omit<ListPrimitiveProps, keyof TabsSharedProps> {}

const List = forwardRef<HTMLDivElement, TabsListProps>((props, ref) => {
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
List.displayName = 'Tabs.List';

/* -------------------------------------------------------------------------------------------------
 * Tabs.Trigger
 * -----------------------------------------------------------------------------------------------*/

type TriggerPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTabs.Tab>;
interface TabsTriggerProps extends TriggerPrimitiveProps {}

const Trigger = forwardRef<HTMLButtonElement, TabsTriggerProps>((props, ref) => {
    const { disabled: disabledProp, className, ...componentProps } = resolveStyles(props);
    const { disabled: rootDisabled, size, orientation } = useTabsContext();

    const disabled = disabledProp || rootDisabled;

    return (
        <BaseTabs.Tab
            ref={ref}
            disabled={disabled}
            className={clsx(styles.trigger({ size, disabled, orientation }), className)}
            {...componentProps}
        />
    );
});
Trigger.displayName = 'Tabs.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Tabs.Indicator
 * -----------------------------------------------------------------------------------------------*/

type IndicatorPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTabs.Indicator>;
interface TabsIndicatorProps extends IndicatorPrimitiveProps {}

const Indicator = forwardRef<HTMLDivElement, TabsIndicatorProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const { orientation } = useTabsContext();

    return (
        <BaseTabs.Indicator
            ref={ref}
            className={clsx(styles.indicator({ orientation }), className)}
            {...componentProps}
        />
    );
});
Indicator.displayName = 'Tabs.Indicator';

/* -------------------------------------------------------------------------------------------------
 * Tabs.Panel
 * -----------------------------------------------------------------------------------------------*/

type PanelPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTabs.Panel>;
interface TabsPanelProps extends PanelPrimitiveProps {}

const Panel = forwardRef<HTMLDivElement, TabsPanelProps>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseTabs.Panel ref={ref} {...componentProps} />;
});
Panel.displayName = 'Tabs.Panel';

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as TabsRoot,
    List as TabsList,
    Trigger as TabsTrigger,
    Indicator as TabsIndicator,
    Panel as TabsPanel,
};

export type { TabsRootProps, TabsListProps, TabsTriggerProps, TabsIndicatorProps, TabsPanelProps };

export const Tabs = {
    Root,
    List,
    Trigger,
    Indicator,
    Panel,
};
