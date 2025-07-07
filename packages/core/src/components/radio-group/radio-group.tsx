import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef, useId } from 'react';

import {
    Indicator as RadixIndicator,
    Item as RadixItem,
    Root as RadixRoot,
} from '@radix-ui/react-radio-group';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { vapor } from '~/libs/factory';
import type { MergeRecipeVariants } from '~/libs/recipe';
import { createSplitProps } from '~/utils/create-split-props';

import * as styles from './radio-group.css';

type RadixRootProps = ComponentPropsWithoutRef<typeof RadixRoot>;
type PrimitiveRootProps = Pick<
    RadixRootProps,
    'name' | 'dir' | 'loop' | 'value' | 'onValueChange' | 'defaultValue' | 'required' | 'disabled'
>;

type RadioGroupVariants = MergeRecipeVariants<
    typeof styles.root | typeof styles.label | typeof styles.control
>;
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

type RadioGroupRootPrimitiveProps = ComponentPropsWithoutRef<typeof vapor.div>;
interface RadioGroupRootProps
    extends Omit<RadioGroupRootPrimitiveProps, keyof PrimitiveRootProps>,
        PrimitiveRootProps {}

const Root = forwardRef<HTMLDivElement, RadioGroupRootProps>(({ className, ...props }, ref) => {
    const [sharedProps, otherProps] = createSplitProps<RadioGroupSharedProps>()(props, [
        'name',
        'required',
        'disabled',
        'value',
        'onValueChange',
        'defaultValue',
        'dir',
        'loop',
        'orientation',
        'invalid',
        'size',
        'visuallyHidden',
    ]);

    const { size, orientation } = sharedProps;

    return (
        <RadioGroupProvider value={sharedProps}>
            <RadixRoot
                ref={ref}
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

type RadioGroupItemPrimitiveProps = ComponentPropsWithoutRef<typeof vapor.div>;

type RadioGroupItemVariants = MergeRecipeVariants<typeof styles.control | typeof styles.label>;
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
        'disabled',
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
            <vapor.div
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
 * RadioGroup.ItemText
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveLabelProps = ComponentPropsWithoutRef<typeof vapor.label>;
interface RadioGroupLabelProps extends Omit<PrimitiveLabelProps, keyof RadioGroupItemSharedProps> {}

const Label = forwardRef<HTMLLabelElement, RadioGroupLabelProps>(
    ({ htmlFor, className, ...props }, ref) => {
        const { radioGroupItemId, visuallyHidden } = useRadioGroupItemContext();

        return (
            <vapor.label
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
