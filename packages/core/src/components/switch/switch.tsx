'use client';

import { forwardRef } from 'react';

import { Primitive } from '@radix-ui/react-primitive';
import { Thumb as RadixSwitchIndicator, Root as RadixSwitchRoot } from '@radix-ui/react-switch';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { ControlVariants, RootVariants } from './switch.css';
import * as styles from './switch.css';

type SwitchVariants = RootVariants & ControlVariants;

type SwitchSharedProps = SwitchVariants & {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    defaultChecked?: boolean;
};

type SwitchContext = SwitchSharedProps;

const [SwitchProvider, useSwitchContext] = createContext<SwitchContext>({
    name: 'Switch',
    hookName: 'useSwitch',
    providerName: 'SwitchProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Switch.Root
 * -----------------------------------------------------------------------------------------------*/

type SwitchRootPrimitiveProps = VComponentProps<typeof Primitive.label>;
interface SwitchRootProps extends SwitchRootPrimitiveProps, SwitchSharedProps {}

const Root = forwardRef<HTMLLabelElement, SwitchRootProps>(({ className, ...props }, ref) => {
    const [switchProps, otherProps] = createSplitProps<SwitchSharedProps>()(props, [
        'checked',
        'onCheckedChange',
        'defaultChecked',
        'disabled',
        'size',
    ]);

    const { disabled } = switchProps;

    return (
        <SwitchProvider value={{ ...switchProps }}>
            <Primitive.label
                ref={ref}
                className={clsx(styles.root({ disabled }), className)}
                {...otherProps}
            />
        </SwitchProvider>
    );
});
Root.displayName = 'Switch.Root';

/* -------------------------------------------------------------------------------------------------
 * Switch.Control
 * -----------------------------------------------------------------------------------------------*/

type SwitchControlPrimitiveProps = VComponentProps<typeof RadixSwitchRoot>;
interface SwitchControlProps extends Omit<SwitchControlPrimitiveProps, keyof SwitchSharedProps> {}

const Control = forwardRef<HTMLButtonElement, SwitchControlProps>(
    ({ className, ...props }, ref) => {
        const { checked, onCheckedChange, defaultChecked, disabled, size } = useSwitchContext();

        return (
            <RadixSwitchRoot
                ref={ref}
                checked={checked}
                defaultChecked={defaultChecked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
                className={clsx(styles.control({ size }), className)}
                {...props}
            >
                <RadixSwitchIndicator className={styles.indicator({ size })} />
            </RadixSwitchRoot>
        );
    },
);
Control.displayName = 'Switch.Control';

/* -----------------------------------------------------------------------------------------------*/

export { Root as SwitchRoot, Control as SwitchControl };
export type { SwitchRootProps, SwitchControlProps };

export const Switch = { Root, Control };
