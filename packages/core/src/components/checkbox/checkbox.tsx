'use client';

import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';

import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

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

export const CheckboxRoot = forwardRef<HTMLElement, CheckboxRoot.Props>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);
    const [variantProps, otherProps] = createSplitProps<CheckboxSharedProps>()(componentProps, [
        'size',
        'invalid',
        'indeterminate',
    ]);

    const { size, invalid, indeterminate } = variantProps;

    const childrenRender = createRender(childrenProp, <CheckboxIndicatorPrimitive />);
    const children = useRenderElement({
        render: childrenRender,
    });

    const root = useRenderElement({
        ref,
        state: { invalid },
        render: <BaseCheckbox.Root />,
        props: {
            'aria-invalid': invalid,
            indeterminate,
            className: cn(styles.root({ invalid, size }), className),
            children,
            ...otherProps,
        },
    });

    return <CheckboxProvider value={{ size, indeterminate }}>{root}</CheckboxProvider>;
});
CheckboxRoot.displayName = 'Checkbox.Root';

/* -------------------------------------------------------------------------------------------------
 * Checkbox.IndicatorPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const CheckboxIndicatorPrimitive = forwardRef<
    HTMLSpanElement,
    CheckboxIndicatorPrimitive.Props
>((props, ref) => {
    const {
        keepMounted = true,
        className,
        children: childrenProp,
        ...componentProps
    } = resolveStyles(props);

    const { size, invalid, indeterminate } = useCheckboxContext();
    const dataAttrs = createDataAttributes({ invalid });

    const Icon = indeterminate ? DashIcon : CheckIcon;
    const childrenRender = createRender(childrenProp, <Icon />);
    const children = useRenderElement({
        render: childrenRender,
        props: { width: '100%', height: '100%' },
    });

    return (
        <BaseCheckbox.Indicator
            ref={ref}
            keepMounted={keepMounted}
            className={cn(styles.indicator({ size }), className)}
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

export interface IconProps extends ComponentProps<'svg'> {}

const CheckIcon = ({ className, ...props }: IconProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            viewBox="0 0 17 18"
            className={cn(styles.icon, className)}
            {...props}
        >
            <polyline points="2 9 7 14 15 5" />
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

export interface CheckboxRootState extends BaseCheckbox.Root.State {
    /**
     * Whether the component is in an error state.
     */
    invalid?: boolean;
}

export namespace CheckboxRoot {
    export type State = CheckboxRootState;
    export type Props = VaporUIComponentProps<typeof BaseCheckbox.Root, State> & CheckboxVariants;
    export type ChangeEventDetails = BaseCheckbox.Root.ChangeEventDetails;
}

export namespace CheckboxIndicatorPrimitive {
    export type State = BaseCheckbox.Indicator.State;
    export type Props = VaporUIComponentProps<typeof BaseCheckbox.Indicator, State>;
}
