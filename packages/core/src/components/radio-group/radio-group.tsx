'use client';

import { forwardRef } from 'react';

import { RadioGroup as BaseRadioGroup, useRender } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { RootVariants } from './radio-group.css';
import * as styles from './radio-group.css';

type RadioGroupVariants = RootVariants;
type RadioGroupSharedProps = RadioGroupVariants & { invalid?: boolean };

export const [RadioGroupProvider, useRadioGroupContext] = createContext<RadioGroupSharedProps>({
    name: 'RadioGroup',
    hookName: 'useRadioGroupContext',
    providerName: 'RadioGroupProvider',
    defaultValue: { size: 'md', orientation: 'vertical', invalid: false },
    strict: false,
});

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.Root
 * -----------------------------------------------------------------------------------------------*/

type RootPrimitiveProps = VComponentProps<typeof BaseRadioGroup>;
interface RadioGroupRootProps extends RootPrimitiveProps, RadioGroupSharedProps {}

const Root = forwardRef<HTMLDivElement, RadioGroupRootProps>(({ className, ...props }, ref) => {
    const [variantProps, otherProps] = createSplitProps<RadioGroupSharedProps>()(props, [
        'size',
        'invalid',
        'orientation',
    ]);

    const { invalid } = variantProps;
    const { size, orientation } = variantProps;

    return (
        <RadioGroupProvider value={{ invalid, ...variantProps }}>
            <BaseRadioGroup
                ref={ref}
                aria-invalid={invalid}
                aria-orientation={orientation}
                className={clsx(styles.root({ size, orientation }), className)}
                {...otherProps}
            />
        </RadioGroupProvider>
    );
});
Root.displayName = 'RadioGroup.Root';

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.Label
 * -----------------------------------------------------------------------------------------------*/

type LabelPrimitiveProps = VComponentProps<'label'>;
interface RadioGroupLabelProps extends LabelPrimitiveProps {}

const Label = forwardRef<HTMLLabelElement, RadioGroupLabelProps>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <label />,
            props: { className: clsx(styles.label, className), ...props },
        });
    },
);
Label.displayName = 'RadioGroup.Label';

/* -----------------------------------------------------------------------------------------------*/

export { Root as RadioGroupRoot };
export type { RadioGroupRootProps };

export const RadioGroup = { Root };
