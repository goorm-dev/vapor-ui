import { type ComponentPropsWithoutRef, forwardRef } from 'react';

import { Tabs as BaseTabs } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';

import * as styles from './tabs.css';
import type { ButtonVariants, ListVariants } from './tabs.css';

type TabsVariants = ListVariants & ButtonVariants;
type SharedProps = TabsVariants & { activateOnFocus?: boolean; loop?: boolean };
type TabsContext = SharedProps;

const [TabsProvider, useTabsContext] = createContext<TabsContext>({
    name: 'TabsContext',
    hookName: 'useTabsContext',
    providerName: 'TabsProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Tabs.Root
 * -----------------------------------------------------------------------------------------------*/

type RootPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTabs.Root>;
interface TabsRootProps extends RootPrimitiveProps, SharedProps {}

const Root = forwardRef<HTMLDivElement, TabsRootProps>(({ className, ...props }, ref) => {
    const [sharedProps, otherProps] = createSplitProps<SharedProps>()(props, [
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

/* -------------------------------------------------------------------------------------------------
 * Tabs.List
 * -----------------------------------------------------------------------------------------------*/

type ListPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTabs.List>;
interface TabsListProps extends Omit<ListPrimitiveProps, keyof SharedProps> {}

const List = forwardRef<HTMLDivElement, TabsListProps>(({ className, ...props }, ref) => {
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
});

/* -------------------------------------------------------------------------------------------------
 * Tabs.Button
 * -----------------------------------------------------------------------------------------------*/

type ButtonPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTabs.Tab>;
interface TabsButtonProps extends ButtonPrimitiveProps {}

const Button = forwardRef<HTMLButtonElement, TabsButtonProps>(
    ({ disabled: disabledProp, className, ...props }, ref) => {
        const { disabled: rootDisabled, size, orientation } = useTabsContext();

        const disabled = disabledProp || rootDisabled;

        return (
            <BaseTabs.Tab
                ref={ref}
                disabled={disabled}
                className={clsx(styles.button({ size, disabled, orientation }), className)}
                {...props}
            />
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Tabs.Indicator
 * -----------------------------------------------------------------------------------------------*/

type IndicatorPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTabs.Indicator>;
interface TabsIndicatorProps extends IndicatorPrimitiveProps {}

const Indicator = forwardRef<HTMLDivElement, TabsIndicatorProps>(({ className, ...props }, ref) => {
    const { orientation } = useTabsContext();

    return (
        <BaseTabs.Indicator
            ref={ref}
            className={clsx(styles.indicator({ orientation }), className)}
            {...props}
        />
    );
});

/* -------------------------------------------------------------------------------------------------
 * Tabs.Panel
 * -----------------------------------------------------------------------------------------------*/

type PanelPrimitiveProps = ComponentPropsWithoutRef<typeof BaseTabs.Panel>;
interface TabsPanelProps extends PanelPrimitiveProps {}

const Panel = forwardRef<HTMLDivElement, TabsPanelProps>((props, ref) => {
    return <BaseTabs.Panel ref={ref} {...props} />;
});

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as TabsRoot,
    List as TabsList,
    Button as TabsButton,
    Indicator as TabsIndicator,
    Panel as TabsPanel,
};

export type { TabsRootProps, TabsListProps, TabsButtonProps, TabsIndicatorProps, TabsPanelProps };

export const Tabs = {
    Root,
    List,
    Button,
    Indicator,
    Panel,
};
