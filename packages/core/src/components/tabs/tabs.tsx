'use client';

import { type ReactElement, forwardRef } from 'react';

import { Tabs as BaseTabs } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSlot } from '~/libs/create-slot';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { Assign, VComponentProps } from '~/utils/types';

import * as styles from './tabs.css';
import type { ButtonVariants, ListVariants } from './tabs.css';

type StyleVariants = ListVariants & ButtonVariants;

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
 * Tabs.ListPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const TabsListPrimitive = forwardRef<HTMLDivElement, TabsListPrimitive.Props>(
    (props, ref) => {
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
    },
);
TabsListPrimitive.displayName = 'Tabs.ListPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Tabs.IndicatorPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const TabsIndicatorPrimitive = forwardRef<HTMLDivElement, TabsIndicatorPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);
        const { orientation, variant } = useTabsContext();

        return (
            <BaseTabs.Indicator
                ref={ref}
                className={clsx(styles.indicator({ orientation, variant }), className)}
                {...componentProps}
            />
        );
    },
);
TabsIndicatorPrimitive.displayName = 'Tabs.IndicatorPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Tabs.List
 * -----------------------------------------------------------------------------------------------*/

export const TabsList = forwardRef<HTMLDivElement, TabsList.Props>((props, ref) => {
    const { children, indicatorElement, ...componentProps } = resolveStyles(props);

    const IndicatorElement = createSlot(indicatorElement || <TabsIndicatorPrimitive />);

    return (
        <TabsListPrimitive ref={ref} {...componentProps}>
            {children}
            <IndicatorElement />
        </TabsListPrimitive>
    );
});
TabsList.displayName = 'Tabs.List';

/* -------------------------------------------------------------------------------------------------
 * Tabs.Button
 * -----------------------------------------------------------------------------------------------*/

export const TabsButton = forwardRef<HTMLButtonElement, TabsButton.Props>((props, ref) => {
    const { disabled: disabledProp, className, ...componentProps } = resolveStyles(props);
    const { disabled: rootDisabled, size, orientation, variant } = useTabsContext();

    const disabled = disabledProp || rootDisabled;

    return (
        <BaseTabs.Tab
            ref={ref}
            disabled={disabled}
            className={clsx(styles.button({ size, variant, orientation }), className)}
            {...componentProps}
        />
    );
});
TabsButton.displayName = 'Tabs.Button';

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
    type BaseProps = VComponentProps<typeof BaseTabs.Root>;

    export interface Props extends BaseProps, StyleVariants, RootControlledProps {}
    export type ChangeEventDetails = BaseTabs.Root.ChangeEventDetails;
}

export namespace TabsListPrimitive {
    type BaseProps = VComponentProps<typeof BaseTabs.List>;

    export interface Props extends Assign<BaseProps, TabsContextValue> {}
}

export namespace TabsIndicatorPrimitive {
    export interface Props extends VComponentProps<typeof BaseTabs.Indicator> {}
}

export namespace TabsList {
    export interface Props extends TabsListPrimitive.Props {
        indicatorElement?: ReactElement<typeof TabsIndicatorPrimitive>;
    }
}

export namespace TabsButton {
    export interface Props extends VComponentProps<typeof BaseTabs.Tab> {}
}

export namespace TabsIndicator {
    export interface Props extends VComponentProps<typeof BaseTabs.Indicator> {}
}

export namespace TabsPanel {
    export interface Props extends VComponentProps<typeof BaseTabs.Panel> {}
}
