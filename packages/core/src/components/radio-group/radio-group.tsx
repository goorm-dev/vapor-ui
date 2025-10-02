'use client';

import { forwardRef, useState } from 'react';

import { RadioGroup as BaseRadioGroup, useRender } from '@base-ui-components/react';
import clsx from 'clsx';

import { useIsoLayoutEffect } from '~/hooks/use-iso-layout-effect';
import { useVaporId } from '~/hooks/use-vapor-id';
import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { RootVariants } from './radio-group.css';
import * as styles from './radio-group.css';

type RadioGroupVariants = RootVariants;
type RadioGroupSharedProps = RadioGroupVariants & { invalid?: boolean };

type RadioGroupContext = RadioGroupSharedProps & {
    setLabelElementId?: (id?: string) => void;
};

export const [RadioGroupProvider, useRadioGroupContext] = createContext<RadioGroupContext>({
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

/**
 * Provides the root context for a radio group with selectable radio buttons. Renders a <div> element.
 */
const Root = forwardRef<HTMLDivElement, RadioGroupRootProps>(({ className, ...props }, ref) => {
    const [labelElementId, setLabelElementId] = useState<string | undefined>(undefined);

    const [variantProps, otherProps] = createSplitProps<RadioGroupSharedProps>()(props, [
        'size',
        'invalid',
        'orientation',
    ]);

    const { size, orientation, invalid } = variantProps;

    return (
        <RadioGroupProvider value={{ setLabelElementId, invalid, ...variantProps }}>
            <BaseRadioGroup
                ref={ref}
                aria-invalid={invalid}
                aria-orientation={orientation}
                aria-describedby={labelElementId}
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

type LabelPrimitiveProps = VComponentProps<'span'>;
interface RadioGroupLabelProps extends LabelPrimitiveProps {}

/**
 * Renders the label for the radio group. Renders a <span> element.
 */
const Label = forwardRef<HTMLSpanElement, RadioGroupLabelProps>(
    ({ render, className, ...props }, ref) => {
        const { setLabelElementId } = useRadioGroupContext();

        const id = useVaporId();

        useIsoLayoutEffect(() => {
            setLabelElementId?.(id);
            return () => setLabelElementId?.(undefined);
        }, [id, setLabelElementId]);

        return useRender({
            ref,
            render: render || <span />,
            props: { id, className: clsx(styles.label, className), ...props },
        });
    },
);
Label.displayName = 'RadioGroup.Label';

/* -----------------------------------------------------------------------------------------------*/

export { Root as RadioGroupRoot, Label as RadioGroupLabel };
export type { RadioGroupRootProps, RadioGroupLabelProps };

export const RadioGroup = { Root, Label };
