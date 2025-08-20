'use client';

import { forwardRef, useId } from 'react';

import { Switch as BaseSwitch } from '@base-ui-components/react';
import { useRender } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { ControlVariants, LabelVariants, RootVariants } from './switch.css';
import * as styles from './switch.css';

type SwitchBaseProps = Pick<
    SwitchControlPrimitiveProps,
    'checked' | 'onCheckedChange' | 'defaultChecked' | 'required' | 'readOnly' | 'disabled'
>;

type SwitchVariants = RootVariants & ControlVariants & LabelVariants;
type SwitchSharedProps = SwitchVariants & SwitchBaseProps;

type SwitchContext = SwitchSharedProps & {
    switchId?: string;
};

const [SwitchProvider, useSwitchContext] = createContext<SwitchContext>({
    name: 'Switch',
    hookName: 'useSwitch',
    providerName: 'SwitchProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Switch.Root
 * -----------------------------------------------------------------------------------------------*/

type SwitchRootPrimitiveProps = VComponentProps<'div'>;
interface SwitchRootProps extends SwitchRootPrimitiveProps, SwitchSharedProps {}

const Root = forwardRef<HTMLDivElement, SwitchRootProps>(({ render, className, ...props }, ref) => {
    const switchId = useId();
    const [switchProps, otherProps] = createSplitProps<SwitchSharedProps>()(props, [
        'checked',
        'onCheckedChange',
        'defaultChecked',
        'disabled',
        'readOnly',
        'required',
        'size',
        'visuallyHidden',
    ]);

    const { disabled } = switchProps;

    const element = useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.root({ disabled }), className),
            ...otherProps,
        },
    });

    return <SwitchProvider value={{ switchId, ...switchProps }}>{element}</SwitchProvider>;
});
Root.displayName = 'Switch.Root';

/* -------------------------------------------------------------------------------------------------
 * Switch.Label
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveLabelProps = VComponentProps<'label'>;
interface SwitchLabelProps extends PrimitiveLabelProps {}

const Label = forwardRef<HTMLLabelElement, SwitchLabelProps>(
    ({ render, htmlFor, className, ...props }, ref) => {
        const { switchId, visuallyHidden } = useSwitchContext();

        return useRender({
            ref,
            render: render || <label />,
            props: {
                htmlFor: htmlFor || switchId,
                className: clsx(styles.label({ visuallyHidden }), className),
                ...props,
            },
        });
    },
);
Label.displayName = 'Switch.Label';

/* -------------------------------------------------------------------------------------------------
 * Switch.Control
 * -----------------------------------------------------------------------------------------------*/

type SwitchControlPrimitiveProps = VComponentProps<typeof BaseSwitch.Root>;
interface SwitchControlProps extends Omit<SwitchControlPrimitiveProps, keyof SwitchSharedProps> {}

const Control = forwardRef<HTMLButtonElement, SwitchControlProps>(
    ({ id, className, ...props }, ref) => {
        const { switchId, size, ...context } = useSwitchContext();
        const [switchProps] = createSplitProps<SwitchBaseProps>()(context, [
            'checked',
            'onCheckedChange',
            'defaultChecked',
            'disabled',
            'readOnly',
            'required',
        ]);

        return (
            <BaseSwitch.Root
                ref={ref}
                id={id || switchId}
                className={clsx(styles.control({ size }), className)}
                {...switchProps}
                {...props}
            >
                <BaseSwitch.Thumb className={styles.indicator({ size })} />
            </BaseSwitch.Root>
        );
    },
);
Control.displayName = 'Switch.Control';

/* -----------------------------------------------------------------------------------------------*/

export { Root as SwitchRoot, Label as SwitchLabel, Control as SwitchControl };
export type { SwitchRootProps, SwitchLabelProps, SwitchControlProps };

export const Switch = { Root, Label, Control };
