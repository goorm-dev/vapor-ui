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

type ErrorValidityState = Omit<
    Parameters<BaseField.Validity.Props['children']>[0]['validity'],
    'valid'
>;
type ErrorMatchProps = { match?: boolean | keyof ErrorValidityState };

type BaseFieldErrorProps = VComponentProps<typeof BaseField.Error>;
interface FieldErrorProps extends Assign<BaseFieldErrorProps, ErrorMatchProps> {}

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
interface FieldSuccessProps extends PrimitiveSuccessProps {
    match?: boolean | 'valid';
}

const Success = forwardRef<HTMLDivElement, FieldSuccessProps>(
    ({ match = 'valid', className, ...props }, ref) => {
        return (
            <BaseField.Error
                ref={ref}
                className={clsx(styles.success, className)}
                {...props}
                match={match}
            />
        );
    },
);
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
