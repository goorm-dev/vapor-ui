'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { Primitive } from '@radix-ui/react-primitive';
import {
    Indicator as RadixIndicator,
    Item as RadixItem,
    Root as RadixRoot,
} from '@radix-ui/react-radio-group';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { ControlVariants, RootVariants } from './radio-group.css';
import * as styles from './radio-group.css';

type RadioGroupBaseProps = Pick<
    ComponentPropsWithoutRef<typeof RadixRoot>,
    'name' | 'dir' | 'loop' | 'value' | 'onValueChange' | 'defaultValue' | 'required' | 'disabled'
>;

type RadioGroupVariants = RootVariants & ControlVariants;
type RadioGroupSharedProps = RadioGroupVariants & RadioGroupBaseProps;
type RadioGroupContext = RadioGroupSharedProps;

const [RadioGroupProvider, useRadioGroupContext] = createContext<RadioGroupContext>({
    name: 'RadioGroup',
    hookName: 'useRadioGroupContext',
    providerName: 'RadioGroupProvider',
});

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.Root
 * -----------------------------------------------------------------------------------------------*/

type RadioGroupRootPrimitiveProps = VComponentProps<typeof Primitive.div>;
interface RadioGroupRootProps extends RadioGroupRootPrimitiveProps, RadioGroupSharedProps {}

const Root = forwardRef<HTMLDivElement, RadioGroupRootProps>(({ className, ...props }, ref) => {
    const [sharedProps, _otherProps] = createSplitProps<RadioGroupBaseProps>()(props, [
        'name',
        'value',
        'onValueChange',
        'defaultValue',
        'disabled',
        'required',
        'dir',
        'loop',
    ]);

    const [variantProps, otherProps] = createSplitProps<RadioGroupVariants>()(_otherProps, [
        'size',
        'orientation',
        'invalid',
    ]);

    const { disabled } = sharedProps;
    const { size, orientation, invalid } = variantProps;

    return (
        <RadioGroupProvider value={{ ...sharedProps, ...variantProps }}>
            <RadixRoot
                ref={ref}
                aria-invalid={invalid}
                aria-disabled={disabled}
                orientation={orientation}
                className={clsx(styles.root({ size, orientation }), className)}
                {...sharedProps}
                {...otherProps}
            />
        </RadioGroupProvider>
    );
});
Root.displayName = 'RadioGroup.Root';

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.Item
 * -----------------------------------------------------------------------------------------------*/

type RadioGroupItemPrimitiveProps = VComponentProps<typeof Primitive.label>;
type RadioGroupItemBaseProps = Pick<RadioGroupControlPrimitiveProps, 'value' | 'disabled'>;

type RadioGroupItemVariants = ControlVariants;
type RadioGroupItemSharedProps = RadioGroupItemVariants & RadioGroupItemBaseProps;

type RadioGroupItemContext = RadioGroupItemSharedProps;

const [RadioGroupItemProvider, useRadioGroupItemContext] = createContext<RadioGroupItemContext>({
    name: 'RadioGroupItem',
    hookName: 'useRadioGroupItemContext',
    providerName: 'RadioGroupItemProvider',
});

interface RadioGroupItemProps extends RadioGroupItemPrimitiveProps, RadioGroupItemSharedProps {}

const Item = forwardRef<HTMLLabelElement, RadioGroupItemProps>(({ className, ...props }, ref) => {
    const rootContext = useRadioGroupContext();

    const [itemProps, otherProps] = createSplitProps<RadioGroupItemSharedProps>()(props, [
        'value',
        'disabled',
        'size',
        'invalid',
    ]);

    const { disabled = rootContext.disabled, invalid = rootContext.invalid } = itemProps;

    return (
        <RadioGroupItemProvider value={{ ...itemProps, disabled, invalid }}>
            <Primitive.label
                ref={ref}
                className={clsx(styles.item({ disabled }), className)}
                {...otherProps}
            />
        </RadioGroupItemProvider>
    );
});
Item.displayName = 'RadioGroup.Item';

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.Control
 * -----------------------------------------------------------------------------------------------*/

type RadioGroupControlPrimitiveProps = VComponentProps<typeof RadixItem>;
interface RadioGroupControlProps
    extends Omit<RadioGroupControlPrimitiveProps, keyof RadioGroupItemSharedProps> {}

const Control = forwardRef<HTMLButtonElement, RadioGroupControlProps>(
    ({ className, ...props }, ref) => {
        const { size } = useRadioGroupContext();
        const { value, invalid, disabled } = useRadioGroupItemContext();

        return (
            <RadixItem
                ref={ref}
                value={value}
                disabled={disabled}
                aria-invalid={invalid}
                className={clsx(styles.control({ size, invalid }), className)}
                {...props}
            >
                <RadixIndicator className={clsx(styles.indicator)} />
            </RadixItem>
        );
    },
);
Control.displayName = 'RadioGroup.Control';

/* -----------------------------------------------------------------------------------------------*/

export { Root as RadioGroupRoot, Item as RadioGroupItem, Control as RadioGroupControl };
export type { RadioGroupRootProps, RadioGroupItemProps, RadioGroupControlProps };

export const RadioGroup = { Root, Item, Control };
