'use client';

import { forwardRef, useMemo } from 'react';

import { Switch as BaseSwitch } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSlot } from '~/libs/create-slot';
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

export const SwitchRoot = forwardRef<HTMLButtonElement, SwitchRoot.Props>((props, ref) => {
    const { className, children: childrenProp, ...componentProps } = resolveStyles(props);
    const [variantProps, otherProps] = createSplitProps<SwitchSharedProps>()(componentProps, [
        'size',
        'invalid',
    ]);

    const { size, invalid } = variantProps;
    const { required } = otherProps;

    const dataAttrs = createDataAttributes({ invalid });

    const ThumbElement = useMemo(() => createSlot(<SwitchThumbPrimitive />), []);
    const children = childrenProp || <ThumbElement />;

    return (
        <SwitchProvider value={variantProps}>
            <BaseSwitch.Root
                ref={ref}
                aria-required={required || undefined}
                aria-invalid={invalid || undefined}
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
                className={styles.indicator({ size })}
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
