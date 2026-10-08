'use client';

import { forwardRef, useCallback, useMemo, useState } from 'react';

import { Field as BaseField } from '@base-ui/react/field';

import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import type { LabelVariants } from './field.css';
import * as styles from './field.css';

type FieldContext = {
    required: boolean;
    setRequired: (required: boolean) => void;
};

const defaultContext: FieldContext = {
    required: false,
    setRequired: () => {},
};

export const [FieldProvider, useFieldContext] = createContext<FieldContext>({
    name: 'Field',
    hookName: 'useFieldContext',
    providerName: 'FieldProvider',
    defaultValue: defaultContext,
});

/* -------------------------------------------------------------------------------------------------
 * Field.Root
 * -----------------------------------------------------------------------------------------------*/

export const FieldRoot = forwardRef<HTMLDivElement, FieldRoot.Props>((props, ref) => {
    const { className, ...otherProps } = resolveStyles(props);

    const [required, setRequiredState] = useState(false);

    const setRequired = useCallback((next: boolean) => {
        setRequiredState(next);
    }, []);

    const contextValue = useMemo<FieldContext>(
        () => ({ required, setRequired }),
        [required, setRequired],
    );

    return (
        <FieldProvider value={contextValue}>
            <BaseField.Root ref={ref} className={cn(styles.root, className)} {...otherProps} />
        </FieldProvider>
    );
});

FieldRoot.displayName = 'Field.Root';

/* -------------------------------------------------------------------------------------------------
 * Field.Label
 * -----------------------------------------------------------------------------------------------*/

export const FieldLabel = forwardRef<HTMLElement, FieldLabel.Props>((props, ref) => {
    const { typography, foreground, className, ...componentProps } = resolveStyles(props);

    return (
        <BaseField.Label
            ref={ref}
            className={cn(styles.label({ typography, foreground }), className)}
            {...componentProps}
        />
    );
});
FieldLabel.displayName = 'Field.Label';

/* -------------------------------------------------------------------------------------------------
 * Field.RequiredSymbol
 * -----------------------------------------------------------------------------------------------*/

export const FieldRequiredSymbol = forwardRef<HTMLSpanElement, FieldRequiredSymbol.Props>(
    (props, ref) => {
        const {
            render,
            className,
            children: childrenProp,
            ...componentProps
        } = resolveStyles(props);

        const { required } = useFieldContext();
        const children = childrenProp || '*';

        return useRenderElement({
            ref,
            render,
            enabled: required,
            defaultTagName: 'span',
            props: {
                'aria-hidden': true,
                className: cn(styles.requiredSymbol, className),
                children,
                ...componentProps,
            },
        });
    },
);
FieldRequiredSymbol.displayName = 'Field.RequiredSymbol';

/* -------------------------------------------------------------------------------------------------
 * Field.Description
 * -----------------------------------------------------------------------------------------------*/

export const FieldDescription = forwardRef<HTMLParagraphElement, FieldDescription.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseField.Description
                ref={ref}
                className={cn(styles.description, className)}
                {...componentProps}
            />
        );
    },
);
FieldDescription.displayName = 'Field.Description';

/* -------------------------------------------------------------------------------------------------
 * Field.Error
 * -----------------------------------------------------------------------------------------------*/

export const FieldError = forwardRef<HTMLDivElement, FieldError.Props>((props, ref) => {
    const { match, className, ...componentProps } = resolveStyles(props);

    return (
        <BaseField.Error
            ref={ref}
            className={cn(styles.error, className)}
            {...componentProps}
            match={match}
        />
    );
});
FieldError.displayName = 'Field.Error';

/* -------------------------------------------------------------------------------------------------
 * Field.Success
 * -----------------------------------------------------------------------------------------------*/

export const FieldSuccess = forwardRef<HTMLDivElement, FieldSuccess.Props>((props, ref) => {
    const { match = 'valid', className, ...componentProps } = resolveStyles(props);

    return (
        <BaseField.Error
            ref={ref}
            className={cn(styles.success, className)}
            {...componentProps}
            match={match}
        />
    );
});
FieldSuccess.displayName = 'Field.Success';

/* -------------------------------------------------------------------------------------------------
 * Field.Item
 * -----------------------------------------------------------------------------------------------*/

export const FieldItem = forwardRef<HTMLDivElement, FieldItem.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return <BaseField.Item ref={ref} className={cn(styles.item, className)} {...componentProps} />;
});
FieldItem.displayName = 'Field.Item';

/* -----------------------------------------------------------------------------------------------*/

export namespace FieldRoot {
    export type State = BaseField.Root.State;
    export type Props = VaporUIComponentProps<typeof BaseField.Root, State>;
    export type Actions = BaseField.Root.Actions;
}

export namespace FieldLabel {
    export type State = BaseField.Label.State;
    export type Props = VaporUIComponentProps<typeof BaseField.Label, State> & LabelVariants;
}

export namespace FieldRequiredSymbol {
    export type State = {};
    export type Props = VaporUIComponentProps<'span', State>;
}

export namespace FieldDescription {
    export type State = BaseField.Description.State;
    export type Props = VaporUIComponentProps<typeof BaseField.Description, State>;
}

export interface FieldErrorProps extends Omit<
    VaporUIComponentProps<typeof BaseField.Error, FieldError.State>,
    'match'
> {
    /**
     * Determines whether to show the error message according to the field’s
     * [ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState).
     * @links https://github.com/mui/base-ui/blob/62e28c641db6d90647936ff0367d2b27641b7830/packages/react/src/field/error/FieldError.tsx#L137
     * @default false
     */
    match?: boolean | keyof Omit<BaseField.ValidityData['state'], 'valid'>;
}

export namespace FieldError {
    export type State = BaseField.Error.State;
    export type Props = FieldErrorProps;
}

export interface FieldSuccessProps extends Omit<
    VaporUIComponentProps<typeof BaseField.Error, FieldSuccess.State>,
    'match'
> {
    /**
     * Determines whether to show the success message according to the field’s
     * [ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState).
     * @links https://github.com/mui/base-ui/blob/62e28c641db6d90647936ff0367d2b27641b7830/packages/react/src/field/error/FieldError.tsx#L137
     * @default 'valid'
     */
    match?: boolean | 'valid';
}

export namespace FieldSuccess {
    export type State = BaseField.Error.State;
    export type Props = FieldSuccessProps;
}

export namespace FieldItem {
    export type State = BaseField.Item.State;
    export type Props = VaporUIComponentProps<typeof BaseField.Item, State>;
}
