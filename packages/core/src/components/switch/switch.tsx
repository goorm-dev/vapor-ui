import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef, useId } from 'react';

import { Thumb as RadixSwitchIndicator, Root as RadixSwitchRoot } from '@radix-ui/react-switch';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { splitLayoutProps, vapor } from '~/libs/factory';
import type { MergeRecipeVariants } from '~/libs/recipe';
import type { Sprinkles } from '~/styles/sprinkles.css';
import { createSplitProps } from '~/utils/create-split-props';

import * as styles from './switch.css';

type SwitchVariants = MergeRecipeVariants<
    typeof styles.root | typeof styles.label | typeof styles.control
>;

type SwitchSharedProps = SwitchVariants & {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    defaultChecked?: boolean;
};

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

type SwitchRootPrimitiveProps = ComponentPropsWithoutRef<typeof vapor.div>;

interface SwitchRootProps
    extends Omit<SwitchRootPrimitiveProps, keyof SwitchSharedProps>,
        SwitchSharedProps {}

const Root = forwardRef<HTMLDivElement, SwitchRootProps>(({ className, ...props }, ref) => {
    const switchId = useId();
    const [switchProps, otherProps] = createSplitProps<SwitchSharedProps>()(props, [
        'checked',
        'onCheckedChange',
        'defaultChecked',
        'disabled',
        'size',
        'visuallyHidden',
    ]);

    const { disabled } = switchProps;

    return (
        <SwitchProvider value={{ switchId, ...switchProps }}>
            <vapor.div
                ref={ref}
                className={clsx(styles.root({ disabled }), className)}
                {...otherProps}
            />
        </SwitchProvider>
    );
});
Root.displayName = 'Switch.Root';

/* -------------------------------------------------------------------------------------------------
 * Switch.Label
 * -----------------------------------------------------------------------------------------------*/

type SwitchLabelPrimitiveProps = ComponentPropsWithoutRef<typeof vapor.label>;

interface SwitchLabelProps extends SwitchLabelPrimitiveProps {}

const Label = forwardRef<HTMLLabelElement, SwitchLabelProps>(
    ({ htmlFor, className, ...props }, ref) => {
        const { switchId, visuallyHidden } = useSwitchContext();

        return (
            <vapor.label
                ref={ref}
                htmlFor={htmlFor || switchId}
                className={clsx(styles.label({ visuallyHidden }), className)}
                {...props}
            />
        );
    },
);
Label.displayName = 'Switch.Label';

/* -------------------------------------------------------------------------------------------------
 * Switch.Control
 * -----------------------------------------------------------------------------------------------*/

type SwitchControlPrimitiveProps = ComponentPropsWithoutRef<typeof RadixSwitchRoot>;
interface SwitchControlProps
    extends Omit<SwitchControlPrimitiveProps, keyof SwitchSharedProps>,
        Sprinkles {}

const Control = forwardRef<HTMLButtonElement, SwitchControlProps>(
    ({ id, className, ...props }, ref) => {
        const { switchId, checked, onCheckedChange, defaultChecked, disabled, size } =
            useSwitchContext();

        const [layoutProps, otherProps] = splitLayoutProps(props);

        return (
            <vapor.button asChild {...layoutProps}>
                <RadixSwitchRoot
                    ref={ref}
                    id={id || switchId}
                    checked={checked}
                    defaultChecked={defaultChecked}
                    onCheckedChange={onCheckedChange}
                    disabled={disabled}
                    className={clsx(styles.control({ size }), className)}
                    {...otherProps}
                >
                    <RadixSwitchIndicator className={styles.indicator({ size })} />
                </RadixSwitchRoot>
            </vapor.button>
        );
    },
);
Control.displayName = 'Switch.Control';

/* -----------------------------------------------------------------------------------------------*/

export { Root as SwitchRoot, Label as SwitchLabel, Control as SwitchControl };
export type { SwitchRootProps, SwitchLabelProps, SwitchControlProps };

export const Switch = { Root, Label, Control };
