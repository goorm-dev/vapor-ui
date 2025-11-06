'use client';

import { forwardRef, useState } from 'react';

import { RadioGroup as BaseRadioGroup, useRender } from '@base-ui-components/react';
import clsx from 'clsx';

import { useIsoLayoutEffect } from '~/hooks/use-iso-layout-effect';
import { useVaporId } from '~/hooks/use-vapor-id';
import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
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

export const RadioGroupRoot = forwardRef<HTMLDivElement, RadioGroupRoot.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    const [labelElementId, setLabelElementId] = useState<string | undefined>(undefined);

    const [variantProps, otherProps] = createSplitProps<RadioGroupSharedProps>()(componentProps, [
        'size',
        'invalid',
        'orientation',
    ]);

    const { size, orientation, invalid } = variantProps;
    const dataAttrs = createDataAttributes({ invalid });

    return (
        <RadioGroupProvider value={{ setLabelElementId, invalid, ...variantProps }}>
            <BaseRadioGroup
                ref={ref}
                aria-labelledby={labelElementId}
                aria-invalid={invalid}
                aria-orientation={orientation}
                className={clsx(styles.root({ size, orientation }), className)}
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

    return useRender({
        ref,
        render: render || <span />,
        state: { invalid },
        props: { id, className: clsx(styles.label, className), ...componentProps },
    });
});
RadioGroupLabel.displayName = 'RadioGroup.Label';

/* -----------------------------------------------------------------------------------------------*/

export namespace RadioGroupRoot {
    export interface Props extends VComponentProps<typeof BaseRadioGroup>, RadioGroupSharedProps {}
}

export namespace RadioGroupLabel {
    export interface Props extends VComponentProps<'span'> {}
}
