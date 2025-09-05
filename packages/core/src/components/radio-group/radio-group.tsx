'use client';

import { forwardRef, useId } from 'react';

import {
    Radio as BaseRadio,
    RadioGroup as BaseRadioGroup,
    useRender,
} from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { ControlVariants, LabelVariants, RootVariants } from './radio-group.css';
import * as styles from './radio-group.css';

type RadioGroupBaseProps = Pick<RadioGroupRootPrimitiveProps, 'disabled' | 'readOnly' | 'required'>;

type RadioGroupVariants = RootVariants & ControlVariants & LabelVariants;
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
        'visuallyHidden',
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

type RadioGroupItemPrimitiveProps = VComponentProps<'div'>;
type RadioGroupItemBaseProps = Pick<
    RadioGroupControlPrimitiveProps,
    'value' | 'disabled' | 'readOnly' | 'required'
>;

type RadioGroupItemVariants = ControlVariants & LabelVariants;
type RadioGroupItemSharedProps = RadioGroupItemVariants & RadioGroupItemBaseProps;

type RadioGroupItemContext = RadioGroupItemSharedProps & {
    radioGroupItemId?: string;
};

const [RadioGroupItemProvider, useRadioGroupItemContext] = createContext<RadioGroupItemContext>({
    name: 'RadioGroupItem',
    hookName: 'useRadioGroupItemContext',
    providerName: 'RadioGroupItemProvider',
});

interface RadioGroupItemProps extends RadioGroupItemPrimitiveProps, RadioGroupItemSharedProps {}

const Item = forwardRef<HTMLDivElement, RadioGroupItemProps>(
    ({ render, className, ...props }, ref) => {
        const radioGroupItemId = useId();
        const {
            size: sizeRoot,
            disabled: disabledRoot,
            readOnly: readOnlyRoot,
            required: requiredRoot,
            invalid: invalidRoot,
            visuallyHidden: visuallyHiddenRoot,
        } = useRadioGroupContext();

        const [itemProps, otherProps] = createSplitProps<RadioGroupItemSharedProps>()(props, [
            'value',
            'disabled',
            'readOnly',
            'required',
            'invalid',
            'size',
            'visuallyHidden',
        ]);

        const {
            value,
            size = sizeRoot,
            disabled = disabledRoot,
            readOnly = readOnlyRoot,
            required = requiredRoot,
            invalid = invalidRoot,
            visuallyHidden = visuallyHiddenRoot,
        } = itemProps;

        const element = useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.item({ disabled }), className),
                ...otherProps,
            },
        });

        return (
            <RadioGroupItemProvider
                value={{
                    value,
                    size,
                    radioGroupItemId,
                    disabled,
                    readOnly,
                    required,
                    invalid,
                    visuallyHidden,
                }}
            >
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
    ({ id, className, ...props }, ref) => {
        const { size } = useRadioGroupContext();
        const { radioGroupItemId, invalid, ...context } = useRadioGroupItemContext();

        const [itemProps] = createSplitProps<RadioGroupItemBaseProps>()(context, [
            'value',
            'disabled',
            'readOnly',
            'required',
        ]);

        return (
            <BaseRadio.Root
                ref={ref}
                id={id || radioGroupItemId}
                aria-invalid={invalid}
                className={clsx(styles.control({ size, invalid }), className)}
                {...itemProps}
                {...props}
            >
                <BaseRadio.Indicator className={clsx(styles.indicator)} />
            </BaseRadio.Root>
        );
    },
);
Control.displayName = 'RadioGroup.Control';

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.Label
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveLabelProps = VComponentProps<'label'>;
interface RadioGroupLabelProps extends Omit<PrimitiveLabelProps, keyof RadioGroupItemSharedProps> {}

const Label = forwardRef<HTMLLabelElement, RadioGroupLabelProps>(
    ({ render, htmlFor, className, ...props }, ref) => {
        const { radioGroupItemId, visuallyHidden } = useRadioGroupItemContext();

        return useRender({
            ref,
            render: render || <label />,
            props: {
                htmlFor: htmlFor || radioGroupItemId,
                className: clsx(styles.label({ visuallyHidden }), className),
                ...props,
            },
        });
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
