import { forwardRef, createContext, useContext } from 'react';
import clsx from 'clsx';

import * as styles from './compound-component.css';

type TabsContextValue = {
    orientation?: 'horizontal' | 'vertical';
    variant?: 'line' | 'fill';
    size?: 'sm' | 'md' | 'lg';
};

const TabsContext = createContext<TabsContextValue>({});
const useTabsContext = () => useContext(TabsContext);

// Root component - uses styles.root
export const TabsRoot = forwardRef<HTMLDivElement, TabsRoot.Props>((props, ref) => {
    const { className, orientation = 'horizontal', variant, size, children, ...otherProps } = props;

    return (
        <TabsContext.Provider value={{ orientation, variant, size }}>
            <div
                ref={ref}
                className={clsx(styles.root({ orientation }), className)}
                {...otherProps}
            >
                {children}
            </div>
        </TabsContext.Provider>
    );
});
TabsRoot.displayName = 'TabsRoot';

export namespace TabsRoot {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
        orientation?: 'horizontal' | 'vertical';
        variant?: 'line' | 'fill';
        size?: 'sm' | 'md' | 'lg';
    }
}

// List component - uses styles.list
export const TabsList = forwardRef<HTMLDivElement, TabsList.Props>((props, ref) => {
    const { className, ...otherProps } = props;
    const { variant, orientation } = useTabsContext();

    return (
        <div
            ref={ref}
            className={clsx(styles.list({ variant, orientation }), className)}
            {...otherProps}
        />
    );
});
TabsList.displayName = 'TabsList';

export namespace TabsList {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
        variant?: 'line' | 'fill';
        orientation?: 'horizontal' | 'vertical';
    }
}

// Button component - uses styles.button
export const TabsButton = forwardRef<HTMLButtonElement, TabsButton.Props>((props, ref) => {
    const { className, ...otherProps } = props;
    const { size, variant, orientation } = useTabsContext();

    return (
        <button
            ref={ref}
            className={clsx(styles.button({ size, variant, orientation }), className)}
            {...otherProps}
        />
    );
});
TabsButton.displayName = 'TabsButton';

export namespace TabsButton {
    export interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
        size?: 'sm' | 'md' | 'lg';
        variant?: 'line' | 'fill';
        orientation?: 'horizontal' | 'vertical';
    }
}

// Indicator component - uses styles.indicator
export const TabsIndicator = forwardRef<HTMLDivElement, TabsIndicator.Props>((props, ref) => {
    const { className, ...otherProps } = props;
    const { orientation, variant } = useTabsContext();

    return (
        <div
            ref={ref}
            className={clsx(styles.indicator({ orientation, variant }), className)}
            {...otherProps}
        />
    );
});
TabsIndicator.displayName = 'TabsIndicator';

export namespace TabsIndicator {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
        orientation?: 'horizontal' | 'vertical';
        variant?: 'line' | 'fill';
    }
}
