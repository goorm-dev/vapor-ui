'use client';

import type { ElementRef, ReactNode } from 'react';
import { createContext, forwardRef, useContext } from 'react';

import styles from './tabs.module.scss';
import type {
    TabsListProps as RadixListProps,
    TabsProps as RadixTabsProps,
    TabsContentProps,
    TabsTriggerProps,
} from '@radix-ui/react-tabs';
import {
    Tabs as RadixTabs,
    Trigger as TabsButton,
    TabsContent,
    TabsList,
} from '@radix-ui/react-tabs';
import { Text } from '@vapor-ui/core';
import clsx from 'clsx';

export type TabsSize = 'sm' | 'md' | 'lg' | 'xl';

export type TabsContextType = {
    size: TabsSize;
    stretch: boolean;
    position: 'start' | 'center';
};

export type TabsProviderProps = TabsContextType & { children: ReactNode };

export type TabsProps = Partial<TabsProviderProps> & {
    direction?: RadixTabsProps['orientation'];
} & Omit<RadixTabsProps, 'orientation' | 'activationMode' | 'dir'>;

const TabsContext = createContext<TabsContextType>({
    size: 'md',
    stretch: false,
    position: 'start',
});

const TabsProvider = ({ children, ...values }: TabsProviderProps) => {
    return <TabsContext.Provider value={values}>{children}</TabsContext.Provider>;
};

const useTabsContext = () => {
    const context = useContext(TabsContext);

    if (!context) {
        throw new Error('useTabsContext must be used within a TabsProvider');
    }

    return context;
};

export const Tabs = ({
    size = 'md',
    direction = 'horizontal',
    stretch = false,
    position = 'start',
    className,
    children,
    ...props
}: TabsProps) => {
    return (
        <TabsProvider size={size} stretch={stretch} position={position}>
            <RadixTabs
                className={clsx(styles.root, className)}
                activationMode="manual"
                orientation={direction}
                {...props}
            >
                {children}
            </RadixTabs>
        </TabsProvider>
    );
};

export type ListProps = RadixListProps & {
    hasBorder?: boolean;
};

const List = ({ loop = true, hasBorder = true, children, className, ...props }: ListProps) => {
    const { position } = useTabsContext();

    return (
        <TabsList
            className={clsx(
                styles.list,
                styles[`list_${position}`],
                {
                    [styles.list_hasBorder]: hasBorder,
                },
                className,
            )}
            loop={loop}
            {...props}
        >
            {children}
        </TabsList>
    );
};

export type PanelProps = TabsContentProps;

const Panel = ({ className, children, ...props }: PanelProps) => {
    return (
        <TabsContent className={clsx(styles.panel, className)} {...props}>
            {children}
        </TabsContent>
    );
};

export type ButtonElement = ElementRef<typeof TabsButton>;
export type ButtonProps = TabsTriggerProps;

export const SIZE_TO_TEXT_TYPO = {
    sm: 'body3',
    md: 'body2',
    lg: 'body2',
    xl: 'body1',
} as const;

const Button = forwardRef<ButtonElement, ButtonProps>(({ className, children, ...props }, ref) => {
    const { size, stretch } = useTabsContext();

    return (
        <Text asChild typography={SIZE_TO_TEXT_TYPO[size]} title={children as string}>
            <TabsButton
                ref={ref}
                className={clsx(
                    styles.tab,
                    styles[`tab_${size}`],
                    {
                        [styles.tab_stretch]: stretch,
                    },
                    className,
                )}
                {...props}
            >
                {children}
            </TabsButton>
        </Text>
    );
});
Button.displayName = 'Tabs.Button';

Tabs.List = List;
Tabs.Button = Button;
Tabs.Panel = Panel;

export default Tabs;
