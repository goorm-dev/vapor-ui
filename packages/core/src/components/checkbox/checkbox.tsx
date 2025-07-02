import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef, useId } from 'react';

import type { CheckedState } from '@radix-ui/react-checkbox';
import { Indicator as RadixIndicator, Root as RadixRoot } from '@radix-ui/react-checkbox';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { splitLayoutProps, vapor } from '~/libs/factory';
import type { MergeRecipeVariants } from '~/libs/recipe';
import type { Sprinkles } from '~/styles/sprinkles.css';
import { createSplitProps } from '~/utils/create-split-props';

import * as styles from './checkbox.css';

type CheckboxVariants = MergeRecipeVariants<
    typeof styles.root | typeof styles.control | typeof styles.label
>;
type CheckboxSharedProps = CheckboxVariants &
    Pick<RadixRootProps, 'checked' | 'onCheckedChange' | 'defaultChecked'>;

type CheckboxContext = CheckboxSharedProps & {
    checkboxId?: string;
};

const [CheckboxProvider, useCheckboxContext] = createContext<CheckboxContext>({
    name: 'Checkbox',
    hookName: 'useCheckbox',
    providerName: 'CheckboxProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Checkbox.Root
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveRootProps = ComponentPropsWithoutRef<typeof vapor.div>;
interface CheckboxRootProps
    extends Omit<PrimitiveRootProps, keyof CheckboxSharedProps>,
        CheckboxSharedProps {}

const Root = forwardRef<HTMLDivElement, CheckboxRootProps>(({ className, ...props }, ref) => {
    const checkboxId = useId();
    const [checkboxProps, otherProps] = createSplitProps<CheckboxSharedProps>()(props, [
        'checked',
        'onCheckedChange',
        'defaultChecked',
        'size',
        'invalid',
        'disabled',
        'visuallyHidden',
    ]);

    const { disabled } = checkboxProps;

    return (
        <CheckboxProvider value={{ checkboxId, ...checkboxProps }}>
            <vapor.div
                ref={ref}
                className={clsx(styles.root({ disabled }), className)}
                {...otherProps}
            />
        </CheckboxProvider>
    );
});
Root.displayName = 'Checkbox.Root';

/* -------------------------------------------------------------------------------------------------
 * Checkbox.Label
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveLabelProps = ComponentPropsWithoutRef<typeof vapor.label>;
interface CheckboxLabelProps extends PrimitiveLabelProps {}

const Label = forwardRef<HTMLLabelElement, CheckboxLabelProps>(
    ({ htmlFor, className, ...props }, ref) => {
        const { checkboxId, visuallyHidden } = useCheckboxContext();

        return (
            <vapor.label
                ref={ref}
                htmlFor={htmlFor || checkboxId}
                className={clsx(styles.label({ visuallyHidden }), className)}
                {...props}
            />
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Checkbox.Indicator
 * -----------------------------------------------------------------------------------------------*/

type RadixRootProps = ComponentPropsWithoutRef<typeof RadixRoot>;
interface CheckboxIndicatorProps
    extends Omit<RadixRootProps, keyof CheckboxSharedProps>,
        Sprinkles {
    forceMount?: true;
}

const Indicator = forwardRef<HTMLButtonElement, CheckboxIndicatorProps>(
    ({ id, forceMount, className, ...props }, ref) => {
        const { checkboxId, checked, onCheckedChange, defaultChecked, invalid, disabled, size } =
            useCheckboxContext();

        const [checkedState, setCheckedState] = useControllableState({
            prop: checked,
            defaultProp: defaultChecked || false,
            onChange: onCheckedChange,
        });

        const [layoutProps, otherProps] = splitLayoutProps(props);

        return (
            <vapor.button asChild {...layoutProps}>
                <RadixRoot
                    ref={ref}
                    id={checkboxId || id}
                    checked={checkedState}
                    onCheckedChange={setCheckedState}
                    disabled={disabled}
                    aria-invalid={invalid}
                    className={clsx(styles.control({ invalid, size }), className)}
                    {...otherProps}
                >
                    <RadixIndicator forceMount={forceMount} className={styles.indicator({ size })}>
                        {checkedState === 'indeterminate' && <DashIcon />}
                        {checkedState === true && <CheckIcon />}
                    </RadixIndicator>
                </RadixRoot>
            </vapor.button>
        );
    },
);
Indicator.displayName = 'Checkbox.Indicator';

/* -------------------------------------------------------------------------------------------------
 * Icons
 * -----------------------------------------------------------------------------------------------*/

interface IconProps extends ComponentPropsWithoutRef<'svg'> {}

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

export { Root as CheckboxRoot, Label as CheckboxLabel, Indicator as CheckboxIndicator };
export type { CheckedState, CheckboxRootProps, CheckboxLabelProps, CheckboxIndicatorProps };

export const Checkbox = { Root, Label, Indicator };
