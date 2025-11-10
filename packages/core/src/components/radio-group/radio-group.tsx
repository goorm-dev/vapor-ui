'use client';

import { forwardRef, useLayoutEffect, useState } from 'react';

import { RadioGroup as BaseRadioGroup, useRender } from '@base-ui-components/react';
import clsx from 'clsx';

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
    defaultValue: { size: 'md', invalid: false },
    strict: false,
});

/* -------------------------------------------------------------------------------------------------
 * RadioGroup.Root
 * -----------------------------------------------------------------------------------------------*/

export const RadioGroupRoot = forwardRef<HTMLDivElement, RadioGroupRoot.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    const [labelId, setLabelId] = useState<string | undefined>();

    const [variantProps, otherProps] = createSplitProps<RadioGroupSharedProps>()(componentProps, [
        'size',
        'invalid',
    ]);

    const { invalid } = variantProps;
    const dataAttrs = createDataAttributes({ invalid });

    const setLabelElementId = (id?: string) => {
        setLabelId(id);
    };

    return (
        <RadioGroupProvider value={{ setLabelElementId, invalid, ...variantProps }}>
            <BaseRadioGroup
                ref={ref}
                aria-labelledby={labelId}
                aria-invalid={invalid}
                className={clsx(styles.root(), className)}
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

export const RadioGroupLabel = forwardRef<HTMLSpanElement, RadioGroupLabel.Props>(
    (props, ref) => {
        const { render, className, id: idProp, ...componentProps } = resolveStyles(props);
        const { invalid, setLabelElementId } = useRadioGroupContext();

        const id = idProp ?? useVaporId();

    useLayoutEffect(() => {
        setLabelElementId?.(id);
        return () => setLabelElementId?.(undefined);
    }, [id, setLabelElementId]);

        return useRender({
            ref,
            render: render || <span />,
            state: { invalid },
            props: { id, className: clsx(styles.label, className), ...componentProps },
        });
    },
);
RadioGroupLabel.displayName = 'RadioGroup.Label';

/* -----------------------------------------------------------------------------------------------*/

export namespace RadioGroupRoot {
    export interface Props extends VComponentProps<typeof BaseRadioGroup>, RadioGroupSharedProps { }
    export type ChangeEventDetails = BaseRadioGroup.ChangeEventDetails;
}

export namespace RadioGroupLabel {
    export interface Props extends VComponentProps<'span'> { }
}
