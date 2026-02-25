'use client';

import { forwardRef } from 'react';

import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { useRender } from '@base-ui/react/use-render';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import type { ControlVariants } from './switch.css';
import * as styles from './switch.css';

type SwitchVariants = ControlVariants;
type SwitchSharedProps = SwitchVariants;

const [SwitchProvider, useSwitchContext] = createContext<SwitchSharedProps>({
    name: 'Switch',
    hookName: 'useSwitch',
    providerName: 'SwitchProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Switch.Root
 * -----------------------------------------------------------------------------------------------*/

export const SwitchRoot = forwardRef<HTMLSpanElement, SwitchRoot.Props>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);
    const [variantProps, otherProps] = createSplitProps<SwitchSharedProps>()(componentProps, [
        'size',
        'invalid',
    ]);

    const { size, invalid } = variantProps;
    const { required } = otherProps;
    const dataAttrs = createDataAttributes({ invalid });

    const children = useRender({
        render: createRender(childrenProp, <SwitchThumbPrimitive />),
    });

    return (
        <SwitchProvider value={variantProps}>
            <BaseSwitch.Root
                ref={ref}
                aria-required={required}
                aria-invalid={invalid}
                className={clsx(styles.control({ size }), className)}
                {...dataAttrs}
                {...otherProps}
            >
                {children}
            </BaseSwitch.Root>
        </SwitchProvider>
    );
});
SwitchRoot.displayName = 'Switch.Root';

/* -------------------------------------------------------------------------------------------------
 * Switch.ThumbPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const SwitchThumbPrimitive = forwardRef<HTMLDivElement, SwitchThumbPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);
        const { size } = useSwitchContext();

        return (
            <BaseSwitch.Thumb
                ref={ref}
                className={clsx(styles.indicator({ size }), className)}
                {...componentProps}
            />
        );
    },
);
SwitchThumbPrimitive.displayName = 'Switch.ThumbPrimitive';

/* -----------------------------------------------------------------------------------------------*/

export namespace SwitchRoot {
    type RootPrimitiveProps = VComponentProps<typeof BaseSwitch.Root>;
    export interface Props extends RootPrimitiveProps, SwitchSharedProps {}
    export type ChangeEventDetails = BaseSwitch.Root.ChangeEventDetails;
}

export namespace SwitchThumbPrimitive {
    type ThumbPrimitiveProps = VComponentProps<typeof BaseSwitch.Thumb>;
    export interface Props extends ThumbPrimitiveProps {}
}
