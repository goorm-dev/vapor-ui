// @ts-nocheck
import { forwardRef } from 'react';

import clsx from 'clsx';

import * as styles from './simple-component.css';

type SimpleVariants = {
    colorPalette?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    variant?: 'fill' | 'outline' | 'ghost';
};

/**
 * A simple button component for testing.
 */
export const SimpleButton = forwardRef<HTMLButtonElement, SimpleButton.Props>((props, ref) => {
    const { className, colorPalette, size, variant, ...otherProps } = props;

    return (
        <button
            ref={ref}
            className={clsx(styles.root({ colorPalette, size, variant }), className)}
            {...otherProps}
        />
    );
});
SimpleButton.displayName = 'SimpleButton';

export namespace SimpleButton {
    export interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement>, SimpleVariants {}
}
