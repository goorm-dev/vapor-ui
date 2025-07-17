'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef, useId } from 'react';

import { Primitive } from '@radix-ui/react-primitive';
import {
    Indicator as RadixIndicator,
    Item as RadixItem,
    Root as RadixRoot,
} from '@radix-ui/react-radio-group';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';

import type { ControlVariants, LabelVariants, RootVariants } from './radio-group.css';
import * as styles from './radio-group.css';

type RadixRootProps = ComponentPropsWithoutRef<typeof RadixRoot>;
type PrimitiveRootProps = Pick<
    RadixRootProps,
    'name' | 'dir' | 'loop' | 'value' | 'onValueChange' | 'defaultValue' | 'required' | 'disabled'
>;

type RadioGroupVariants = RootVariants & ControlVariants & LabelVariants;
type RadioGroupSharedProps = RadioGroupVariants & PrimitiveRootProps;
type RadioGroupContext = RadioGroupSharedProps;

const [RadioGroupProvider, useRadioGroupContext] = createContext<RadioGroupContext>({
    name: 'RadioGroup',
    hookName: 'useRadioGroupContext',
    providerName: 'RadioGroupProvider',
});

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.Root
 * -----------------------------------------------------------------------------------------------*/

type RadioGroupRootPrimitiveProps = ComponentPropsWithoutRef<typeof Primitive.div>;
interface RadioGroupRootProps
    extends Omit<RadioGroupRootPrimitiveProps, keyof PrimitiveRootProps>,
        PrimitiveRootProps,
        RadioGroupVariants {}

const Root = forwardRef<HTMLDivElement, RadioGroupRootProps>(({ className, ...props }, ref) => {
    const [sharedProps, _otherProps] = createSplitProps<PrimitiveRootProps>()(props, [
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
        'visuallyHidden',
        'orientation',
        'invalid',
    ]);

    const { disabled } = sharedProps;
    const { size, orientation, invalid } = variantProps;

    return (
        <RadioGroupProvider value={{ ...sharedProps, ...variantProps }}>
            <RadixRoot
                ref={ref}
                className={clsx(styles.root({ size, orientation }), className)}
                aria-invalid={invalid}
                aria-disabled={disabled}
                orientation={orientation}
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

type RadioGroupItemPrimitiveProps = ComponentPropsWithoutRef<typeof Primitive.div>;

type RadioGroupItemVariants = ControlVariants & LabelVariants;
type RadioGroupItemSharedProps = RadioGroupItemVariants &
    Pick<RadioGroupControlPrimitiveProps, 'value' | 'disabled'>;

type RadioGroupItemContext = RadioGroupItemSharedProps & {
    radioGroupItemId?: string;
};

const [RadioGroupItemProvider, useRadioGroupItemContext] = createContext<RadioGroupItemContext>({
    name: 'RadioGroupItem',
    hookName: 'useRadioGroupItemContext',
    providerName: 'RadioGroupItemProvider',
});

interface RadioGroupItemProps extends RadioGroupItemPrimitiveProps, RadioGroupItemSharedProps {}

const Item = forwardRef<HTMLDivElement, RadioGroupItemProps>(({ className, ...props }, ref) => {
    const radioGroupItemId = useId();
    const rootContext = useRadioGroupContext();

    const [itemProps, otherProps] = createSplitProps<RadioGroupItemSharedProps>()(props, [
        'value',
        'disabled',
        'visuallyHidden',
        'size',
        'invalid',
    ]);

    const {
        disabled = rootContext.disabled,
        invalid = rootContext.invalid,
        visuallyHidden = rootContext.visuallyHidden,
    } = itemProps;

    return (
        <RadioGroupItemProvider
            value={{ ...itemProps, radioGroupItemId, disabled, invalid, visuallyHidden }}
        >
            <Primitive.div
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

type RadioGroupControlPrimitiveProps = ComponentPropsWithoutRef<typeof RadixItem>;

interface RadioGroupControlProps
    extends Omit<RadioGroupControlPrimitiveProps, keyof RadioGroupItemSharedProps> {}

const Control = forwardRef<HTMLButtonElement, RadioGroupControlProps>(
    ({ id, className, ...props }, ref) => {
        const { size } = useRadioGroupContext();
        const { radioGroupItemId, value, invalid, disabled } = useRadioGroupItemContext();

        return (
            <RadixItem
                ref={ref}
                id={id || radioGroupItemId}
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

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.Label
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveLabelProps = ComponentPropsWithoutRef<typeof Primitive.label>;
interface RadioGroupLabelProps extends Omit<PrimitiveLabelProps, keyof RadioGroupItemSharedProps> {}

const Label = forwardRef<HTMLLabelElement, RadioGroupLabelProps>(
    ({ htmlFor, className, ...props }, ref) => {
        const { radioGroupItemId, visuallyHidden } = useRadioGroupItemContext();

        return (
            <Primitive.label
                ref={ref}
                htmlFor={htmlFor || radioGroupItemId}
                className={clsx(styles.label({ visuallyHidden }), className)}
                {...props}
            />
        );
    },
);
Label.displayName = 'RadioGroup.Label';

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as RadioGroupRoot,
    Item as RadioGroupItem,
    Control as RadioGroupControl,
    Label as RadioGroupLabel,
};
export type {
    RadioGroupRootProps,
    RadioGroupItemProps,
    RadioGroupControlProps,
    RadioGroupLabelProps,
};

export const RadioGroup = { Root, Item, Control, Label };
