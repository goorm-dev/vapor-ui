'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef, useId } from 'react';

import type { CheckedState } from '@radix-ui/react-checkbox';
import { Indicator as RadixIndicator, Root as RadixRoot } from '@radix-ui/react-checkbox';
import { Primitive } from '@radix-ui/react-primitive';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';

import type { ControlVariants, LabelVariants, RootVariants } from './checkbox.css';
import * as styles from './checkbox.css';

type CheckboxVariants = RootVariants & ControlVariants & LabelVariants;
type CheckboxSharedProps = CheckboxVariants & {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    defaultChecked?: boolean;
    indeterminate?: boolean;
};

type CheckboxContext = CheckboxSharedProps & {
    checkboxId?: string;
};

const [CheckboxProvider, useCheckboxContext] = createContext<CheckboxContext>({
    name: 'Checkbox',
    hookName: 'useCheckbox',
    providerName: 'CheckboxProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Checkbox.Root
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveRootProps = ComponentPropsWithoutRef<typeof Primitive.div>;
interface CheckboxRootProps
    extends Omit<PrimitiveRootProps, keyof CheckboxSharedProps>,
        CheckboxSharedProps {}

const Root = forwardRef<HTMLDivElement, CheckboxRootProps>(({ className, ...props }, ref) => {
    const checkboxId = useId();
    const [checkboxProps, otherProps] = createSplitProps<CheckboxSharedProps>()(props, [
        'checked',
        'onCheckedChange',
        'defaultChecked',
        'indeterminate',
        'size',
        'invalid',
        'disabled',
        'visuallyHidden',
    ]);

    const { disabled } = checkboxProps;

    return (
        <CheckboxProvider value={{ checkboxId, ...checkboxProps }}>
            <Primitive.div
                ref={ref}
                className={clsx(styles.root({ disabled }), className)}
                {...otherProps}
            />
        </CheckboxProvider>
    );
});
Root.displayName = 'Checkbox.Root';

/* -------------------------------------------------------------------------------------------------
 * Checkbox.Label
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveLabelProps = ComponentPropsWithoutRef<typeof Primitive.label>;
interface CheckboxLabelProps extends PrimitiveLabelProps {}

const Label = forwardRef<HTMLLabelElement, CheckboxLabelProps>(
    ({ htmlFor, className, ...props }, ref) => {
        const { checkboxId, visuallyHidden } = useCheckboxContext();

        return (
            <Primitive.label
                ref={ref}
                htmlFor={htmlFor || checkboxId}
                className={clsx(styles.label({ visuallyHidden }), className)}
                {...props}
            />
        );
    },
);

/* ------------------------------------------------------------------------------------------------
 * Checkbox.Control
 * -----------------------------------------------------------------------------------------------*/

type ControlPrimitiveProps = ComponentPropsWithoutRef<typeof RadixRoot>;
interface CheckboxControlProps extends Omit<ControlPrimitiveProps, keyof CheckboxSharedProps> {}

const Control = forwardRef<HTMLButtonElement, CheckboxControlProps>(
    ({ id, className, ...props }, ref) => {
        const {
            checkboxId,
            checked,
            onCheckedChange,
            defaultChecked,
            indeterminate,
            invalid,
            disabled,
            size,
        } = useCheckboxContext();

        const [checkedState, setCheckedState] = useControllableState<CheckedState>({
            prop: indeterminate ? 'indeterminate' : checked,
            defaultProp: indeterminate ? 'indeterminate' : defaultChecked || false,
            onChange: (state) => {
                if (state === 'indeterminate') return;

                onCheckedChange?.(state);
            },
        });

        return (
            <RadixRoot
                ref={ref}
                id={checkboxId || id}
                checked={checkedState}
                onCheckedChange={setCheckedState}
                disabled={disabled}
                aria-invalid={invalid}
                className={clsx(styles.control({ invalid, size }), className)}
                {...props}
            >
                <RadixIndicator className={styles.indicator({ size })}>
                    {checkedState === 'indeterminate' && <DashIcon />}
                    {checkedState === true && <CheckIcon />}
                </RadixIndicator>
            </RadixRoot>
        );
    },
);
Control.displayName = 'Checkbox.Control';

/* -------------------------------------------------------------------------------------------------
 * Icons
 * -----------------------------------------------------------------------------------------------*/

interface IconProps extends ComponentPropsWithoutRef<'svg'> {}

const CheckIcon = (props: IconProps) => {
    return (
        <svg viewBox="0 0 8 7" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path
                d="M11.3135 5.29325c-.391-.391-1.024-.391-1.414 0l-3.364 3.364-.829-.828c-.39-.391-1.023-.391-1.414 0-.39.39-.39 1.023 0 1.414l1.536 1.535c.39.391 1.023.391 1.414 0l4.071-4.071c.391-.39.391-1.023 0-1.414"
                fill="currentColor"
                fillRule="evenodd"
                transform="translate(-4 -5)"
            />
        </svg>
    );
};

const DashIcon = (props: IconProps) => {
    return (
        <svg viewBox="0 0 8 2" xmlns="http://www.w3.org/2000/svg" {...props}>
            <rect fill="currentColor" fillRule="evenodd" height="2" rx="1" width="8" />
        </svg>
    );
};

/* -----------------------------------------------------------------------------------------------*/

export { Root as CheckboxRoot, Label as CheckboxLabel, Control as CheckboxControl };
export type { CheckedState, CheckboxRootProps, CheckboxLabelProps, CheckboxControlProps };

export const Checkbox = { Root, Label, Control };
