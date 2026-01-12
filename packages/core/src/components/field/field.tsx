'use client';

import { forwardRef } from 'react';

import { Field as BaseField } from '@base-ui-components/react/field';
import clsx from 'clsx';

import { resolveStyles } from '~/utils/resolve-styles';
import type { Assign, VComponentProps } from '~/utils/types';

import type { LabelVariants } from './field.css';
import * as styles from './field.css';

/* -------------------------------------------------------------------------------------------------
 * Field
 * -----------------------------------------------------------------------------------------------*/

/**
 * Root container for Field that groups label, input, and messages. Renders a `<div>` element.
 */
export const FieldRoot = forwardRef<HTMLDivElement, FieldRoot.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseField.Root ref={ref} className={clsx(styles.root, className)} {...componentProps} />
    );
});

FieldRoot.displayName = 'Field.Root';

/* -------------------------------------------------------------------------------------------------
 * Field.Label
 * -----------------------------------------------------------------------------------------------*/

/**
 * Label element for Field input. Renders a `<label>` element.
 */
export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabel.Props>((props, ref) => {
    const { typography, foreground, className, ...componentProps } = resolveStyles(props);

    return (
        <BaseField.Label
            ref={ref}
            className={clsx(styles.label({ typography, foreground }), className)}
            {...componentProps}
        />
    );
});
FieldLabel.displayName = 'Field.Label';

/* -------------------------------------------------------------------------------------------------
 * Field.Description
 * -----------------------------------------------------------------------------------------------*/

/**
 * Descriptive text for Field to provide additional context. Renders a `<p>` element.
 */
export const FieldDescription = forwardRef<HTMLParagraphElement, FieldDescription.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseField.Description
                ref={ref}
                className={clsx(styles.description, className)}
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
 * Error message for Field validation. Renders a `<div>` element.
 */
export const FieldError = forwardRef<HTMLDivElement, FieldError.Props>((props, ref) => {
    const { match, className, ...componentProps } = resolveStyles(props);

    return (
        <BaseField.Error
            ref={ref}
            className={clsx(styles.error, className)}
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
 * Success message for Field validation. Renders a `<div>` element.
 */
export const FieldSuccess = forwardRef<HTMLDivElement, FieldSuccess.Props>((props, ref) => {
    const { match = 'valid', className, ...componentProps } = resolveStyles(props);

    return (
        <BaseField.Error
            ref={ref}
            className={clsx(styles.success, className)}
            {...componentProps}
            match={match}
        />
    );
});
FieldSuccess.displayName = 'Field.Success';

/* -----------------------------------------------------------------------------------------------*/

export namespace FieldRoot {
    export interface Props extends VComponentProps<typeof BaseField.Root> {}
}

export namespace FieldLabel {
    export interface Props extends VComponentProps<typeof BaseField.Label>, LabelVariants {}
}

export namespace FieldDescription {
    export interface Props extends VComponentProps<typeof BaseField.Description> {}
}

export namespace FieldError {
    type ErrorValidityState = Omit<BaseField.ValidityData['state'], 'valid'>;
    type ErrorMatchProps = { match?: boolean | keyof ErrorValidityState };
    type BaseFieldErrorProps = VComponentProps<typeof BaseField.Error>;

    export interface Props extends Assign<BaseFieldErrorProps, ErrorMatchProps> {
        /**
         * Determines when to show the error message. Can be a boolean or a validity state key.
         */
        match?: boolean | keyof ErrorValidityState;
    }
}

export namespace FieldSuccess {
    type PrimitiveSuccessProps = Omit<VComponentProps<typeof BaseField.Error>, 'match'>;
    export interface Props extends PrimitiveSuccessProps {
        /**
         * Determines when to show the success message.
         * @default 'valid'
         */
        match?: boolean | 'valid';
    }
}
