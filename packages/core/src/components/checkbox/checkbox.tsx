'use client';

import { forwardRef, useId } from 'react';

import { Checkbox as BaseCheckbox } from '@base-ui-components/react/checkbox';
import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { ControlVariants, LabelVariants, RootVariants } from './checkbox.css';
import * as styles from './checkbox.css';

type CheckboxVariants = RootVariants & ControlVariants & LabelVariants;
type CheckboxBaseProps = Pick<
    ControlPrimitiveProps,
    'checked' | 'onCheckedChange' | 'defaultChecked' | 'indeterminate' | 'readOnly' | 'required'
>;
type CheckboxSharedProps = CheckboxVariants & CheckboxBaseProps;

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

type PrimitiveRootProps = VComponentProps<'div'>;
interface CheckboxRootProps extends PrimitiveRootProps, CheckboxSharedProps {}

const Root = forwardRef<HTMLDivElement, CheckboxRootProps>(
    ({ render, className, ...props }, ref) => {
        const checkboxId = useId();
        const [checkboxProps, otherProps] = createSplitProps<CheckboxSharedProps>()(props, [
            'checked',
            'onCheckedChange',
            'defaultChecked',
            'indeterminate',
            'readOnly',
            'required',
            'size',
            'invalid',
            'disabled',
            'visuallyHidden',
        ]);

        const { disabled } = checkboxProps;

        const element = useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.root({ disabled }), className),
                ...otherProps,
            },
        });

        return (
            <CheckboxProvider value={{ checkboxId, ...checkboxProps }}>{element}</CheckboxProvider>
        );
    },
);
Root.displayName = 'Checkbox.Root';

/* -------------------------------------------------------------------------------------------------
 * Checkbox.Label
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveLabelProps = VComponentProps<'label'>;
interface CheckboxLabelProps extends PrimitiveLabelProps {}

const Label = forwardRef<HTMLLabelElement, CheckboxLabelProps>(
    ({ render, htmlFor, className, ...props }, ref) => {
        const { checkboxId, visuallyHidden } = useCheckboxContext();

        return useRender({
            ref,
            render: render || <label />,
            props: {
                htmlFor: htmlFor || checkboxId,
                className: clsx(styles.label({ visuallyHidden }), className),
                ...props,
            },
        });
    },
);

/* ------------------------------------------------------------------------------------------------
 * Checkbox.Control
 * -----------------------------------------------------------------------------------------------*/

type ControlPrimitiveProps = VComponentProps<typeof BaseCheckbox.Root>;
interface CheckboxControlProps extends Omit<ControlPrimitiveProps, keyof CheckboxSharedProps> {}

const Control = forwardRef<HTMLButtonElement, CheckboxControlProps>(
    ({ id: idProp, className, ...props }, ref) => {
        const {
            checkboxId,
            checked,
            onCheckedChange,
            defaultChecked,
            indeterminate,
            invalid,
            disabled,
            size,
            readOnly,
        } = useCheckboxContext();

        const id = idProp || checkboxId;

        return (
            <BaseCheckbox.Root
                ref={ref}
                id={id}
                readOnly={readOnly}
                checked={checked}
                defaultChecked={defaultChecked}
                onCheckedChange={(checked, event) => {
                    if (readOnly) {
                        event.preventDefault();
                        return;
                    }
                    if (onCheckedChange) onCheckedChange(checked, event);
                }}
                indeterminate={indeterminate}
                disabled={disabled}
                aria-invalid={invalid}
                className={clsx(styles.control({ invalid, size }), className)}
                {...props}
            >
                <BaseCheckbox.Indicator className={styles.indicator({ size })}>
                    {indeterminate ? <DashIcon /> : <CheckIcon />}
                </BaseCheckbox.Indicator>
            </BaseCheckbox.Root>
        );
    },
);
Control.displayName = 'Checkbox.Control';

/* -------------------------------------------------------------------------------------------------
 * Icons
 * -----------------------------------------------------------------------------------------------*/

interface IconProps extends VComponentProps<'svg'> {}

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
export type { CheckboxRootProps, CheckboxLabelProps, CheckboxControlProps };

export const Checkbox = { Root, Label, Control };
