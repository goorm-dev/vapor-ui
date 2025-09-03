'use client';

import { forwardRef } from 'react';

import { Switch as BaseSwitch } from '@base-ui-components/react';
import { useRender } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { ControlVariants, RootVariants } from './switch.css';
import * as styles from './switch.css';

type SwitchBaseProps = Pick<
    SwitchControlPrimitiveProps,
    'checked' | 'onCheckedChange' | 'defaultChecked' | 'required' | 'readOnly' | 'disabled'
>;

type SwitchVariants = RootVariants & ControlVariants;
type SwitchSharedProps = SwitchVariants & SwitchBaseProps;

type SwitchContext = SwitchSharedProps;

const [SwitchProvider, useSwitchContext] = createContext<SwitchContext>({
    name: 'Switch',
    hookName: 'useSwitch',
    providerName: 'SwitchProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Switch.Root
 * -----------------------------------------------------------------------------------------------*/

type SwitchRootPrimitiveProps = VComponentProps<'label'>;
interface SwitchRootProps extends SwitchRootPrimitiveProps, SwitchSharedProps {}

const Root = forwardRef<HTMLLabelElement, SwitchRootProps>(
    ({ render, className, ...props }, ref) => {
        const [switchProps, otherProps] = createSplitProps<SwitchSharedProps>()(props, [
            'checked',
            'onCheckedChange',
            'defaultChecked',
            'disabled',
            'readOnly',
            'required',
            'size',
        ]);

        const { disabled } = switchProps;

        const element = useRender({
            ref,
            render: render || <label />,
            props: {
                className: clsx(styles.root({ disabled }), className),
                ...otherProps,
            },
        });

        return <SwitchProvider value={switchProps}>{element}</SwitchProvider>;
    },
);
Root.displayName = 'Switch.Root';

/* -------------------------------------------------------------------------------------------------
 * Switch.Control
 * -----------------------------------------------------------------------------------------------*/

type SwitchControlPrimitiveProps = VComponentProps<typeof BaseSwitch.Root>;
interface SwitchControlProps extends Omit<SwitchControlPrimitiveProps, keyof SwitchSharedProps> {}

const Control = forwardRef<HTMLButtonElement, SwitchControlProps>(
    ({ className, ...props }, ref) => {
        const { size, ...context } = useSwitchContext();

        return (
            <BaseSwitch.Root
                ref={ref}
                className={clsx(styles.control({ size }), className)}
                {...context}
                {...props}
            >
                <BaseSwitch.Thumb className={styles.indicator({ size })} />
            </BaseSwitch.Root>
        );
    },
);
Control.displayName = 'Switch.Control';

/* -----------------------------------------------------------------------------------------------*/

export { Root as SwitchRoot, Control as SwitchControl };
export type { SwitchRootProps, SwitchControlProps };

export const Switch = { Root, Control };
