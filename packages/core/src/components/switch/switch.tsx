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

type RootPrimitiveProps = VComponentProps<typeof BaseSwitch.Root>;
interface SwitchRootProps extends RootPrimitiveProps, SwitchSharedProps {}

const Root = forwardRef<HTMLButtonElement, SwitchRootProps>(
    ({ className, children: childrenProp, ...props }, ref) => {
        const [variantProps, otherProps] = createSplitProps<SwitchSharedProps>()(props, ['size']);

        const { size } = variantProps;

        const ThumbElement = useMemo(() => createSlot(<Thumb />), []);
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

/* -------------------------------------------------------------------------------------------------
 * Switch.Thumb
 * -----------------------------------------------------------------------------------------------*/

type ThumbPrimitiveProps = VComponentProps<typeof BaseSwitch.Thumb>;
interface SwitchThumbProps extends ThumbPrimitiveProps {}

const Thumb = forwardRef<HTMLDivElement, SwitchThumbProps>(({ className, ...props }, ref) => {
    const { size } = useSwitchContext();

    return <BaseSwitch.Thumb ref={ref} className={styles.indicator({ size })} {...props} />;
});
Thumb.displayName = 'Switch.Thumb';

/* -----------------------------------------------------------------------------------------------*/

export { Root as SwitchRoot, Thumb as SwitchThumb };
export type { SwitchRootProps, SwitchThumbProps };

export const Switch = { Root, Thumb };
