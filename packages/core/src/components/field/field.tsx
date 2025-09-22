'use client';

import { forwardRef } from 'react';

import { Field as BaseField } from '@base-ui-components/react/field';
import clsx from 'clsx';

import type { VComponentProps } from '~/utils/types';

import * as styles from './field.css';

/* -------------------------------------------------------------------------------------------------
 * Field
 * -----------------------------------------------------------------------------------------------*/

type FieldPrimitiveProps = VComponentProps<typeof BaseField.Root>;
interface FieldRootProps extends FieldPrimitiveProps {}

const Root = forwardRef<HTMLDivElement, FieldRootProps>(({ className, ...props }, ref) => {
    return <BaseField.Root ref={ref} className={clsx(styles.root, className)} {...props} />;
});

Root.displayName = 'Field.Root';

/* -------------------------------------------------------------------------------------------------
 * Field.Label
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveLabelProps = VComponentProps<typeof BaseField.Label>;
interface FieldLabelProps extends PrimitiveLabelProps {}

const Label = forwardRef<HTMLLabelElement, FieldLabelProps>(({ className, ...props }, ref) => {
    return <BaseField.Label ref={ref} className={clsx(styles.label, className)} {...props} />;
});
Label.displayName = 'Field.Label';

/* -------------------------------------------------------------------------------------------------
 * Field.Description
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveDescriptionProps = VComponentProps<typeof BaseField.Description>;
interface FieldDescriptionProps extends PrimitiveDescriptionProps {}

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

type ErrorValidityState = keyof Parameters<BaseField.Validity.Props['children']>[0]['validity'];
type ErrorMatchProps = { match?: boolean | ErrorValidityState };

type BaseFieldErrorProps = VComponentProps<typeof BaseField.Error>;
interface FieldErrorProps extends BaseFieldErrorProps, ErrorMatchProps {}

const Error = forwardRef<HTMLDivElement, FieldErrorProps>(({ match, className, ...props }, ref) => {
    return (
        <BaseField.Error
            ref={ref}
            match={match}
            className={clsx(styles.error, className)}
            {...props}
        />
    );
});

Error.displayName = 'Field.Error';

/* -------------------------------------------------------------------------------------------------
 * Field.Success
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveSuccessProps = Omit<VComponentProps<typeof BaseField.Error>, 'match'>;
interface FieldSuccessProps extends PrimitiveSuccessProps {}

const Success = forwardRef<HTMLDivElement, FieldSuccessProps>(({ className, ...props }, ref) => {
    return (
        <BaseField.Error
            ref={ref}
            match="valid"
            className={clsx(styles.success, className)}
            {...props}
        />
    );
});
Success.displayName = 'Field.Success';

/* -----------------------------------------------------------------------------------------------*/

export {
    Description as FieldDescription,
    Error as FieldError,
    Label as FieldLabel,
    Root as FieldRoot,
    Success as FieldSuccess,
};
export type {
    FieldDescriptionProps,
    FieldErrorProps,
    FieldLabelProps,
    FieldRootProps,
    FieldSuccessProps,
};

export const Field = { Root, Label, Description, Error, Success };
