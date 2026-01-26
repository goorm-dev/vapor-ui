'use client';

import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import { useRender } from '@base-ui/react';
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import type { RootVariants } from './checkbox.css';
import * as styles from './checkbox.css';

type CheckboxVariants = RootVariants;
type CheckboxSharedProps = CheckboxVariants & Pick<BaseCheckbox.Root.Props, 'indeterminate'>;

const [CheckboxProvider, useCheckboxContext] = createContext<CheckboxSharedProps>({
    name: 'Checkbox',
    hookName: 'useCheckbox',
    providerName: 'CheckboxProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Checkbox.Root
 * -----------------------------------------------------------------------------------------------*/

export const CheckboxRoot = forwardRef<HTMLSpanElement, CheckboxRoot.Props>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);
    const [variantProps, otherProps] = createSplitProps<CheckboxSharedProps>()(componentProps, [
        'size',
        'invalid',
        'indeterminate',
    ]);

    const { size, invalid, indeterminate } = variantProps;

    const children = useRender({
        render: createRender(childrenProp, <CheckboxIndicatorPrimitive />),
    });

    const defaultProps: useRender.ElementProps<typeof BaseCheckbox.Root> = {
        'aria-invalid': invalid,
        indeterminate,
        className: clsx(styles.root({ invalid, size }), className),
        children,
        ...otherProps,
    };

    const root = useRender({
        ref,
        state: { invalid },
        render: <BaseCheckbox.Root />,
        props: defaultProps,
    });

    return <CheckboxProvider value={{ size, indeterminate }}>{root}</CheckboxProvider>;
});
CheckboxRoot.displayName = 'Checkbox.Root';

/* -------------------------------------------------------------------------------------------------
 * Checkbox.IndicatorPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const CheckboxIndicatorPrimitive = forwardRef<
    HTMLDivElement,
    CheckboxIndicatorPrimitive.Props
>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const { size, invalid, indeterminate } = useCheckboxContext();
    const dataAttrs = createDataAttributes({ invalid });

    const Icon = indeterminate ? DashIcon : CheckIcon;
    const children = useRender({
        render: createRender(childrenProp, <Icon />),
        props: { width: '100%', height: '100%' },
    });

    return (
        <BaseCheckbox.Indicator
            ref={ref}
            className={clsx(styles.indicator({ size }), className)}
            {...dataAttrs}
            {...componentProps}
        >
            {children}
        </BaseCheckbox.Indicator>
    );
});
CheckboxIndicatorPrimitive.displayName = 'Checkbox.IndicatorPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Icons
 * -----------------------------------------------------------------------------------------------*/

interface IconProps extends ComponentProps<'svg'> {}

const CheckIcon = (props: IconProps) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" {...props}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.5374 1.93469C10.9206 1.3551 9.92198 1.3551 9.30673 1.93469L3.99987 6.92127L2.69208 5.6939C2.07684 5.1143 1.07825 5.1143 0.461432 5.6939C-0.153811 6.27201 -0.153811 7.21033 0.461432 7.78992L2.88454 10.0653C3.49979 10.6449 4.49837 10.6449 5.11519 10.0653L11.5374 4.03072C12.1542 3.45261 12.1542 2.51429 11.5374 1.93469"
                fill="currentColor"
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

export namespace CheckboxRoot {
    type RootPrimitiveProps = VComponentProps<typeof BaseCheckbox.Root>;

    export interface Props extends RootPrimitiveProps, CheckboxSharedProps {}
    export type ChangeEventDetails = BaseCheckbox.Root.ChangeEventDetails;
}

export namespace CheckboxIndicatorPrimitive {
    type IndicatorPrimitiveProps = VComponentProps<typeof BaseCheckbox.Indicator>;

    export interface Props extends IndicatorPrimitiveProps {}
}
