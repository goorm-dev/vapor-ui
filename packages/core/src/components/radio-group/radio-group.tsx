'use client';

import { forwardRef, useState } from 'react';

import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';

import { useIsoLayoutEffect } from '~/hooks/use-iso-layout-effect';
import { useRenderElement } from '~/hooks/use-render-element';
import { useVaporId } from '~/hooks/use-vapor-id';
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

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
    defaultValue: { size: 'md', invalid: false },
    strict: false,
});

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.Root
 * -----------------------------------------------------------------------------------------------*/

export const RadioGroupRoot = forwardRef<HTMLDivElement, RadioGroupRoot.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    const [labelElementId, setLabelElementId] = useState<string | undefined>(undefined);

    const [variantProps, otherProps] = createSplitProps<RadioGroupSharedProps>()(componentProps, [
        'size',
        'invalid',
    ]);

    const { invalid } = variantProps;
    const dataAttrs = createDataAttributes({ invalid });

    return (
        <RadioGroupProvider value={{ setLabelElementId, invalid, ...variantProps }}>
            <BaseRadioGroup
                ref={ref}
                aria-labelledby={labelElementId}
                aria-invalid={invalid}
                className={cn(styles.root(), className)}
                {...dataAttrs}
                {...otherProps}
            />
        </RadioGroupProvider>
    );
});
RadioGroupRoot.displayName = 'RadioGroup.Root';

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.Label
 * -----------------------------------------------------------------------------------------------*/

export const RadioGroupLabel = forwardRef<HTMLSpanElement, RadioGroupLabel.Props>((props, ref) => {
    const { render, id: idProp, className, ...componentProps } = resolveStyles(props);
    const { setLabelElementId, invalid } = useRadioGroupContext();

    const id = useVaporId(idProp);

    useIsoLayoutEffect(() => {
        setLabelElementId?.(id);
        return () => setLabelElementId?.(undefined);
    }, [id, setLabelElementId]);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'span',
        state: { invalid },
        props: {
            id,
            className: [styles.label, className],
            ...componentProps,
        },
    });
});
RadioGroupLabel.displayName = 'RadioGroup.Label';

/* -----------------------------------------------------------------------------------------------*/

export namespace RadioGroupRoot {
    export type State = BaseRadioGroup.State;
    export type Props = VaporUIComponentProps<typeof BaseRadioGroup, State> & RadioGroupSharedProps;
    export type ChangeEventDetails = BaseRadioGroup.ChangeEventDetails;
}

export namespace RadioGroupLabel {
    export type State = {};
    export type Props = VaporUIComponentProps<'span', State>;
}
