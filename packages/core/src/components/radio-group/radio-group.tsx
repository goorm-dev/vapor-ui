'use client';

import { forwardRef } from 'react';

import {
    Radio as BaseRadio,
    RadioGroup as BaseRadioGroup,
    useRender,
} from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { ControlVariants, RootVariants } from './radio-group.css';
import * as styles from './radio-group.css';

type RadioGroupBaseProps = Pick<RadioGroupRootPrimitiveProps, 'disabled' | 'readOnly' | 'required'>;

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

type RadioGroupRootPrimitiveProps = VComponentProps<typeof BaseRadioGroup>;
interface RadioGroupRootProps extends RadioGroupRootPrimitiveProps, RadioGroupSharedProps {}

const Root = forwardRef<HTMLDivElement, RadioGroupRootProps>(({ className, ...props }, ref) => {
    const [sharedProps, _otherProps] = createSplitProps<RadioGroupBaseProps>()(props, [
        'disabled',
        'required',
        'readOnly',
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
            <BaseRadioGroup
                ref={ref}
                aria-invalid={invalid}
                aria-disabled={disabled}
                aria-orientation={orientation}
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

type RadioGroupItemPrimitiveProps = VComponentProps<'label'>;
type RadioGroupItemBaseProps = Pick<
    RadioGroupControlPrimitiveProps,
    'value' | 'disabled' | 'required' | 'readOnly'
>;

type RadioGroupItemVariants = Pick<ControlVariants, 'invalid'>;
type RadioGroupItemSharedProps = RadioGroupItemVariants & RadioGroupItemBaseProps;

type RadioGroupItemContext = RadioGroupItemSharedProps;

const [RadioGroupItemProvider, useRadioGroupItemContext] = createContext<RadioGroupItemContext>({
    name: 'RadioGroupItem',
    hookName: 'useRadioGroupItemContext',
    providerName: 'RadioGroupItemProvider',
});

interface RadioGroupItemProps extends RadioGroupItemPrimitiveProps, RadioGroupItemSharedProps {}

const Item = forwardRef<HTMLLabelElement, RadioGroupItemProps>(
    ({ render, className, ...props }, ref) => {
        const {
            disabled: disabledRoot,
            readOnly: readOnlyRoot,
            required: requiredRoot,
            invalid: invalidRoot,
        } = useRadioGroupContext();

        const [itemProps, otherProps] = createSplitProps<RadioGroupItemSharedProps>()(props, [
            'value',
            'disabled',
            'readOnly',
            'required',
            'invalid',
        ]);

        const {
            value,
            disabled = disabledRoot,
            readOnly = readOnlyRoot,
            required = requiredRoot,
            invalid = invalidRoot,
        } = itemProps;

        const element = useRender({
            ref,
            render: render || <label />,
            props: {
                className: clsx(styles.item({ disabled }), className),
                ...otherProps,
            },
        });

        return (
            <RadioGroupItemProvider value={{ value, disabled, readOnly, required, invalid }}>
                {element}
            </RadioGroupItemProvider>
        );
    },
);
Item.displayName = 'RadioGroup.Item';

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.Control
 * -----------------------------------------------------------------------------------------------*/

type RadioGroupControlPrimitiveProps = VComponentProps<typeof BaseRadio.Root>;
interface RadioGroupControlProps
    extends Omit<RadioGroupControlPrimitiveProps, keyof RadioGroupItemSharedProps> {}

const Control = forwardRef<HTMLButtonElement, RadioGroupControlProps>(
    ({ className, ...props }, ref) => {
        const { size } = useRadioGroupContext();

        const { invalid, ...context } = useRadioGroupItemContext();

        return (
            <BaseRadio.Root
                ref={ref}
                aria-invalid={invalid}
                className={clsx(styles.control({ size, invalid }), className)}
                {...context}
                {...props}
            >
                <BaseRadio.Indicator className={clsx(styles.indicator)} />
            </BaseRadio.Root>
        );
    },
);
Control.displayName = 'RadioGroup.Control';

/* -----------------------------------------------------------------------------------------------*/

export { Root as RadioGroupRoot, Item as RadioGroupItem, Control as RadioGroupControl };
export type { RadioGroupRootProps, RadioGroupItemProps, RadioGroupControlProps };

export const RadioGroup = { Root, Item, Control };
