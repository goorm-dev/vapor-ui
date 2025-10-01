'use client';

import { forwardRef } from 'react';

import { Field as BaseField } from '@base-ui-components/react/field';
import clsx from 'clsx';

import type { Assign, VComponentProps } from '~/utils/types';

import * as styles from './field.css';

/* -------------------------------------------------------------------------------------------------
 * Field
 * -----------------------------------------------------------------------------------------------*/

type FieldPrimitiveProps = VComponentProps<typeof BaseField.Root>;
interface FieldRootProps extends FieldPrimitiveProps {}

/**
 * Provides a container for form elements with label, description, and validation messages. Renders a <div> element.
 *
 * Documentation: [Field Documentation](https://vapor-ui.goorm.io/docs/components/field)
 */
const Root = forwardRef<HTMLDivElement, FieldRootProps>(({ className, ...props }, ref) => {
    return <BaseField.Root ref={ref} className={clsx(styles.root, className)} {...props} />;
});

Root.displayName = 'Field.Root';

/* -------------------------------------------------------------------------------------------------
 * Field.Label
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveLabelProps = VComponentProps<typeof BaseField.Label>;
interface FieldLabelProps extends PrimitiveLabelProps {}

/**
 * Displays a label for the form field with automatic association. Renders a <label> element.
 */
const Label = forwardRef<HTMLLabelElement, FieldLabelProps>(({ className, ...props }, ref) => {
    return <BaseField.Label ref={ref} className={clsx(styles.label, className)} {...props} />;
});
Label.displayName = 'Field.Label';

/* -------------------------------------------------------------------------------------------------
 * Field.Description
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveDescriptionProps = VComponentProps<typeof BaseField.Description>;
interface FieldDescriptionProps extends PrimitiveDescriptionProps {}

/**
 * Provides additional context and instructions for the form field. Renders a <p> element.
 */
const Description = forwardRef<HTMLParagraphElement, FieldDescriptionProps>(
    ({ className, ...props }, ref) => {
        return (
            <BaseField.Description
                className={clsx(styles.description, className)}
                {...props}
                ref={ref}
            />
        );
    },
);
Description.displayName = 'Field.Description';

/* -------------------------------------------------------------------------------------------------
 * Field.Error
 * -----------------------------------------------------------------------------------------------*/

type ErrorValidityState = Omit<
    Parameters<BaseField.Validity.Props['children']>[0]['validity'],
    'valid'
>;
type ErrorMatchProps = {
    /**
     * Determines whether to show the error message according to the field’s ValidityState. Specifying true will always show the error message, and lets external libraries control the visibility.
     */
    match?: boolean | keyof ErrorValidityState;
};

type BaseFieldErrorProps = VComponentProps<typeof BaseField.Error>;
interface FieldErrorProps extends Assign<BaseFieldErrorProps, ErrorMatchProps> {}

/**
 * Displays validation error messages when field validation fails. Renders a <div> element.
 */
const Error = forwardRef<HTMLDivElement, FieldErrorProps>(({ match, className, ...props }, ref) => {
    return (
        <BaseField.Error
            ref={ref}
            className={clsx(styles.error, className)}
            {...props}
            match={match}
        />
    );
});

Error.displayName = 'Field.Error';

/* -------------------------------------------------------------------------------------------------
 * Field.Success
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveSuccessProps = Omit<VComponentProps<typeof BaseField.Error>, 'match'>;
interface FieldSuccessProps extends PrimitiveSuccessProps {}

/**
 * Displays success messages when field validation passes. Renders a <div> element.
 */
const Success = forwardRef<HTMLDivElement, FieldSuccessProps>(({ className, ...props }, ref) => {
    return (
        <BaseField.Error
            ref={ref}
            className={clsx(styles.success, className)}
            {...props}
            match="valid"
        />
    );
});

Success.displayName = 'Field.Success';

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as FieldRoot,
    Label as FieldLabel,
    Description as FieldDescription,
    Error as FieldError,
    Success as FieldSuccess,
};
export type {
    FieldRootProps,
    FieldLabelProps,
    FieldDescriptionProps,
    FieldErrorProps,
    FieldSuccessProps,
};

export const Field = { Root, Label, Description, Error, Success };
