'use client';

import { forwardRef } from 'react';

import { Checkbox as BaseCheckbox } from '@base-ui-components/react/checkbox';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSlot } from '~/libs/create-slot';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import type { RootVariants } from './checkbox.css';
import * as styles from './checkbox.css';

type CheckboxVariants = RootVariants;
type CheckboxSharedProps = CheckboxVariants & Pick<RootPrimitiveProps, 'indeterminate'>;

const [CheckboxProvider, useCheckboxContext] = createContext<CheckboxSharedProps>({
    name: 'Checkbox',
    hookName: 'useCheckbox',
    providerName: 'CheckboxProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Checkbox.Root
 * -----------------------------------------------------------------------------------------------*/

type RootPrimitiveProps = VComponentProps<typeof BaseCheckbox.Root>;
interface CheckboxRootProps extends RootPrimitiveProps, CheckboxSharedProps {}

const Root = forwardRef<HTMLButtonElement, CheckboxRootProps>((props, ref) => {
    const { render, className, children, ...componentProps } = resolveStyles(props);
    const [variantProps, otherProps] = createSplitProps<CheckboxSharedProps>()(componentProps, [
        'size',
        'invalid',
        'indeterminate',
    ]);

    const { size, invalid, indeterminate } = variantProps;

    const IndicatorElement = createSlot(children || <Indicator />);

    return (
        <CheckboxProvider value={{ size, indeterminate }}>
            <BaseCheckbox.Root
                ref={ref}
                aria-invalid={invalid}
                indeterminate={indeterminate}
                className={clsx(styles.root({ invalid, size }), className)}
                {...otherProps}
            >
                <IndicatorElement />
            </BaseCheckbox.Root>
        </CheckboxProvider>
    );
});
Root.displayName = 'Checkbox.Root';

/* -------------------------------------------------------------------------------------------------
 * Checkbox.Indicator
 * -----------------------------------------------------------------------------------------------*/

type IndicatorPrimitiveProps = VComponentProps<typeof BaseCheckbox.Indicator>;
interface CheckboxIndicatorProps extends IndicatorPrimitiveProps {}

const Indicator = forwardRef<HTMLDivElement, CheckboxIndicatorProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const { size, indeterminate } = useCheckboxContext();

    return (
        <BaseCheckbox.Indicator
            ref={ref}
            className={clsx(styles.indicator({ size }), className)}
            {...componentProps}
        >
            {indeterminate ? <DashIcon /> : <CheckIcon />}
        </BaseCheckbox.Indicator>
    );
});
Indicator.displayName = 'Checkbox.Indicator';

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

export { Root as CheckboxRoot, Indicator as CheckboxIndicator };
export type { CheckboxRootProps, CheckboxIndicatorProps };

export const Checkbox = { Root, Indicator };
