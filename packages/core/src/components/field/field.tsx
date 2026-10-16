'use client';

import { forwardRef } from 'react';

import { Field as BaseField } from '@base-ui/react/field';

import { cn } from '~/utils/cn';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import type { LabelVariants } from './field.css';
import * as styles from './field.css';

/* -------------------------------------------------------------------------------------------------
 * Field
 * -----------------------------------------------------------------------------------------------*/

/**
 * Root of the Field compound component, which connects a form control with its label, description, and validation messages. Renders a `<div>` element.
 */
export const FieldRoot = forwardRef<HTMLDivElement, FieldRoot.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return <BaseField.Root ref={ref} className={cn(styles.root, className)} {...componentProps} />;
});

FieldRoot.displayName = 'Field.Root';

/* -------------------------------------------------------------------------------------------------
 * Field.Label
 * -----------------------------------------------------------------------------------------------*/

/**
 * Label for the field's control, linked to it for assistive technologies. Renders a `<label>` element.
 */
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
 * Field.Description
 * -----------------------------------------------------------------------------------------------*/

/**
 * Helper text that explains the field, announced to assistive technologies with the control. Renders a `<p>` element.
 */
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

/**
 * Error message shown when the field fails validation. Use `match` to show it only for a specific validity state. Renders a `<div>` element.
 */
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

/**
 * Success message shown when the field passes validation. Renders a `<div>` element.
 */
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

/**
 * Groups a single checkbox or radio with its own label and description inside a checkbox group or radio group field. Renders a `<div>` element.
 */
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

export namespace FieldDescription {
    export type State = BaseField.Description.State;
    export type Props = VaporUIComponentProps<typeof BaseField.Description, State>;
}

export interface FieldErrorProps extends Omit<
    VaporUIComponentProps<typeof BaseField.Error, FieldError.State>,
    'match'
> {
    /**
     * Shows the message only for the given [ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState) key, such as `valueMissing` or `typeMismatch`. Set to `true` to always show it, letting an external library control its visibility. When omitted, the message shows whenever the field is invalid.
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
     * Controls when the message is shown. With `'valid'`, it shows once the field passes validation. Set to `true` to always show it, letting an external library control its visibility.
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
