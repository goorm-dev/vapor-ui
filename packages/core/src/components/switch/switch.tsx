'use client';

import { forwardRef, useMemo } from 'react';

import { Switch as BaseSwitch } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSlot } from '~/libs/create-slot';
import { createSplitProps } from '~/utils/create-split-props';
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

export const SwitchRoot = forwardRef<HTMLButtonElement, SwitchRoot.Props>(
    ({ className, children: childrenProp, ...props }, ref) => {
        const [variantProps, otherProps] = createSplitProps<SwitchSharedProps>()(props, ['size']);

        const { size } = variantProps;

        const ThumbElement = useMemo(() => createSlot(<SwitchThumb />), []);
        const children = childrenProp || <ThumbElement />;

        return (
            <SwitchProvider value={variantProps}>
                <BaseSwitch.Root
                    ref={ref}
                    className={clsx(styles.control({ size }), className)}
                    {...otherProps}
                >
                    {children}
                </BaseSwitch.Root>
            </SwitchProvider>
        );
    },
);
SwitchRoot.displayName = 'Switch.Root';

/* -------------------------------------------------------------------------------------------------
 * Switch.Thumb
 * -----------------------------------------------------------------------------------------------*/

export const SwitchThumb = forwardRef<HTMLDivElement, SwitchThumb.Props>(
    ({ className, ...props }, ref) => {
        const { size } = useSwitchContext();

        return <BaseSwitch.Thumb ref={ref} className={styles.indicator({ size })} {...props} />;
    },
);
SwitchThumb.displayName = 'Switch.Thumb';

/* -----------------------------------------------------------------------------------------------*/

export namespace SwitchRoot {
    type RootPrimitiveProps = VComponentProps<typeof BaseSwitch.Root>;
    export interface Props extends RootPrimitiveProps, SwitchSharedProps {}
    export type ChangeEventDetails = BaseSwitch.Root.ChangeEventDetails;
}

export namespace SwitchThumb {
    type ThumbPrimitiveProps = VComponentProps<typeof BaseSwitch.Thumb>;
    export interface Props extends ThumbPrimitiveProps {}
}
