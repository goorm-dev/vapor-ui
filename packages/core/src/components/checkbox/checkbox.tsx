'use client';

import { forwardRef } from 'react';

import { Checkbox as BaseCheckbox } from '@base-ui-components/react/checkbox';
import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { ControlVariants, RootVariants } from './checkbox.css';
import * as styles from './checkbox.css';

type CheckboxVariants = RootVariants & ControlVariants;
type CheckboxSharedProps = CheckboxVariants & {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    defaultChecked?: boolean;
    indeterminate?: boolean;
};

type CheckboxContext = CheckboxSharedProps;

const [CheckboxProvider, useCheckboxContext] = createContext<CheckboxContext>({
    name: 'Checkbox',
    hookName: 'useCheckbox',
    providerName: 'CheckboxProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Checkbox.Root
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveRootProps = VComponentProps<'label'>;
interface CheckboxRootProps extends PrimitiveRootProps, CheckboxSharedProps {}

const Root = forwardRef<HTMLLabelElement, CheckboxRootProps>(
    ({ render, className, ...props }, ref) => {
        const [checkboxProps, otherProps] = createSplitProps<CheckboxSharedProps>()(props, [
            'checked',
            'onCheckedChange',
            'defaultChecked',
            'indeterminate',
            'size',
            'invalid',
            'disabled',
        ]);

        const { disabled } = checkboxProps;

        const element = useRender({
            ref,
            render: render || <label />,
            props: {
                className: clsx(styles.root({ disabled }), className),
                ...otherProps,
            },
        });

        return <CheckboxProvider value={checkboxProps}>{element}</CheckboxProvider>;
    },
);
Root.displayName = 'Checkbox.Root';

/* ------------------------------------------------------------------------------------------------
 * Checkbox.Control
 * -----------------------------------------------------------------------------------------------*/

type ControlPrimitiveProps = VComponentProps<typeof BaseCheckbox.Root>;
interface CheckboxControlProps extends Omit<ControlPrimitiveProps, keyof CheckboxSharedProps> {}

const Control = forwardRef<HTMLButtonElement, CheckboxControlProps>(
    ({ className, ...props }, ref) => {
        const { indeterminate, invalid, size, ...context } = useCheckboxContext();

        return (
            <BaseCheckbox.Root
                ref={ref}
                aria-invalid={invalid}
                className={clsx(styles.control({ invalid, size }), className)}
                {...context}
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

export { Root as CheckboxRoot, Control as CheckboxControl };
export type { CheckboxRootProps, CheckboxControlProps };

export const Checkbox = { Root, Control };
