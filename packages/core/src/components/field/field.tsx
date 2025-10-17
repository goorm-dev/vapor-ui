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
 * Field.VLabel
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveLabelProps = VComponentProps<typeof BaseField.Label>;

interface FieldHLabelProps extends PrimitiveLabelProps {}

const HLabel = forwardRef<HTMLLabelElement, FieldHLabelProps>(({ className, ...props }, ref) => {
    return (
        <BaseField.Label ref={ref} className={clsx(styles.horizontalLabel, className)} {...props} />
    );
});
HLabel.displayName = 'Field.HLabel';

/* -------------------------------------------------------------------------------------------------
 * Field.VLabel
 * -----------------------------------------------------------------------------------------------*/

interface FieldVLabelProps extends PrimitiveLabelProps {}

const VLabel = forwardRef<HTMLLabelElement, FieldVLabelProps>(({ className, ...props }, ref) => {
    return (
        <BaseField.Label ref={ref} className={clsx(styles.verticalLabel, className)} {...props} />
    );
});
VLabel.displayName = 'Field.VLabel';

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
    ({ match, className, ...props }, ref) => {
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
    HLabel as FieldHLabel,
    VLabel as FieldVLabel,
    Description as FieldDescription,
    Error as FieldError,
    Success as FieldSuccess,
};
export type {
    FieldRootProps,
    FieldHLabelProps,
    FieldVLabelProps,
    FieldDescriptionProps,
    FieldErrorProps,
    FieldSuccessProps,
};

export const Field = { Root, HLabel, VLabel, Description, Error, Success };
