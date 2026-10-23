'use client';

import type { ReactElement } from 'react';
import { forwardRef } from 'react';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';

import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './tabs.css';
import type { ButtonVariants, ListVariants } from './tabs.css';

const [TabsProvider, useTabsContext] = createContext<TabsContext>({
    name: 'TabsContext',
    hookName: 'useTabsContext',
    providerName: 'TabsProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Tabs.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * Root of the Tabs compound component, which switches between related panels of content shown one at a time. Shares `size`, `variant`, `orientation`, and `disabled` with the parts inside it. Renders a `<div>` element.
 */
export const TabsRoot = forwardRef<HTMLDivElement, TabsRoot.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const [contextProps, otherProps] = createSplitProps<TabsContext>()(componentProps, [
        'activateOnFocus',
        'loopFocus',
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
                className={cn(styles.root({ orientation }), className)}
                {...otherProps}
            />
        </TabsProvider>
    );
});
TabsRoot.displayName = 'Tabs.Root';

/* -------------------------------------------------------------------------------------------------
 * Tabs.ListPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Container that groups the tab buttons and moves focus between them with the arrow keys. Renders a `<div>` element.
 */
export const TabsListPrimitive = forwardRef<HTMLDivElement, TabsListPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);
        const { activateOnFocus, loopFocus, variant, orientation } = useTabsContext();

        return (
            <BaseTabs.List
                ref={ref}
                loopFocus={loopFocus}
                activateOnFocus={activateOnFocus}
                className={cn(styles.list({ variant, orientation }), className)}
                {...componentProps}
            />
        );
    },
);
TabsListPrimitive.displayName = 'Tabs.ListPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Tabs.IndicatorPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Highlight that moves to the active tab, a line on the border of the list or a filled background depending on `variant`. Renders a `<span>` element.
 */
export const TabsIndicatorPrimitive = forwardRef<HTMLSpanElement, TabsIndicatorPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);
        const { orientation, variant } = useTabsContext();

        return (
            <BaseTabs.Indicator
                ref={ref}
                className={cn(styles.indicator({ orientation, variant }), className)}
                {...componentProps}
            />
        );
    },
);
TabsIndicatorPrimitive.displayName = 'Tabs.IndicatorPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Tabs.List
 * -----------------------------------------------------------------------------------------------*/

/**
 * Combines `Tabs.ListPrimitive` and `Tabs.IndicatorPrimitive` into a single part, with the indicator after the tab buttons. Use `indicatorElement` to replace the indicator. Renders a `<div>` element.
 */
export const TabsList = forwardRef<HTMLDivElement, TabsList.Props>((props, ref) => {
    const { children, indicatorElement, ...componentProps } = resolveStyles(props);

    return (
        <TabsListPrimitive ref={ref} {...componentProps}>
            {children}
            {indicatorElement ?? <TabsIndicatorPrimitive />}
        </TabsListPrimitive>
    );
});
TabsList.displayName = 'Tabs.List';

/* -------------------------------------------------------------------------------------------------
 * Tabs.Button
 * -----------------------------------------------------------------------------------------------*/

/**
 * Button that activates the panel with the same `value` when clicked. Renders a `<button>` element.
 */
export const TabsButton = forwardRef<HTMLElement, TabsButton.Props>((props, ref) => {
    const { disabled: disabledProp, className, ...componentProps } = resolveStyles(props);
    const { disabled: rootDisabled, size, orientation, variant } = useTabsContext();

    const disabled = disabledProp || rootDisabled;

    return (
        <BaseTabs.Tab
            ref={ref}
            disabled={disabled}
            className={cn(styles.button({ size, variant, orientation }), className)}
            {...componentProps}
        />
    );
});
TabsButton.displayName = 'Tabs.Button';

/* -------------------------------------------------------------------------------------------------
 * Tabs.Panel
 * -----------------------------------------------------------------------------------------------*/

/**
 * Content area shown while the tab with the same `value` is active. Renders a `<div>` element.
 */
export const TabsPanel = forwardRef<HTMLDivElement, TabsPanel.Props>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseTabs.Panel ref={ref} {...componentProps} />;
});
TabsPanel.displayName = 'Tabs.Panel';

/* -----------------------------------------------------------------------------------------------*/

type TabsVariants = ListVariants & ButtonVariants;
type CommonTabsListProps = Pick<BaseTabs.List.Props, 'activateOnFocus' | 'loopFocus'>;
type CommonTabsTabProps = Pick<BaseTabs.Tab.Props, 'disabled'>;
type TabsContext = TabsVariants & CommonTabsListProps & CommonTabsTabProps;

export namespace TabsRoot {
    export type State = BaseTabs.Root.State;
    export interface Props extends VaporUIComponentProps<typeof BaseTabs.Root, State>, TabsContext {
        /**
         * Disables every tab button, blocking all interactions.
         */
        disabled?: BaseTabs.Tab.Props['disabled'];
    }

    export type ChangeEventDetails = BaseTabs.Root.ChangeEventDetails;
}

export namespace TabsListPrimitive {
    export type State = BaseTabs.List.State;
    export type Props = Omit<
        VaporUIComponentProps<typeof BaseTabs.List, State>,
        keyof CommonTabsListProps
    >;
}

export namespace TabsIndicatorPrimitive {
    export type State = BaseTabs.Indicator.State;
    export type Props = VaporUIComponentProps<typeof BaseTabs.Indicator, State>;
}

export interface TabsListProps extends TabsListPrimitive.Props {
    /**
     * Replaces the default `Tabs.IndicatorPrimitive`. Use to change how the active tab is highlighted.
     */
    indicatorElement?: ReactElement<TabsIndicatorPrimitive.Props>;
}

export namespace TabsList {
    export type State = TabsListPrimitive.State;
    export type Props = TabsListProps;
}

export namespace TabsButton {
    export type State = BaseTabs.Tab.State;
    export type Props = VaporUIComponentProps<typeof BaseTabs.Tab, State>;
}

export namespace TabsPanel {
    export type State = BaseTabs.Panel.State;
    export type Props = VaporUIComponentProps<typeof BaseTabs.Panel, State>;
}
