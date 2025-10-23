'use client';

import { forwardRef } from 'react';

import { Field as BaseField } from '@base-ui-components/react/field';
import clsx from 'clsx';

import type { Assign, VComponentProps } from '~/utils/types';

import * as styles from './field.css';

/* -------------------------------------------------------------------------------------------------
 * Field
 * -----------------------------------------------------------------------------------------------*/

export const FieldRoot = forwardRef<HTMLDivElement, FieldRoot.Props>(
    ({ className, ...props }, ref) => {
        return <BaseField.Root ref={ref} className={clsx(styles.root, className)} {...props} />;
    },
);

FieldRoot.displayName = 'Field.Root';

/* -------------------------------------------------------------------------------------------------
 * Field.Label
 * -----------------------------------------------------------------------------------------------*/

export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabel.Props>(
    ({ className, ...props }, ref) => {
        return <BaseField.Label ref={ref} className={clsx(styles.label, className)} {...props} />;
    },
);
FieldLabel.displayName = 'Field.Label';

/* -------------------------------------------------------------------------------------------------
 * Field.Description
 * -----------------------------------------------------------------------------------------------*/

export const FieldDescription = forwardRef<HTMLParagraphElement, FieldDescription.Props>(
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
FieldDescription.displayName = 'Field.Description';

/* -------------------------------------------------------------------------------------------------
 * Field.Error
 * -----------------------------------------------------------------------------------------------*/

export const FieldError = forwardRef<HTMLDivElement, FieldError.Props>(
    ({ match, className, ...props }, ref) => {
        return (
            <BaseField.Error
                ref={ref}
                className={clsx(styles.error, className)}
                {...props}
                match={match}
            />
        );
    },
);

FieldError.displayName = 'Field.Error';

/* -------------------------------------------------------------------------------------------------
 * Field.Success
 * -----------------------------------------------------------------------------------------------*/

export const FieldSuccess = forwardRef<HTMLDivElement, FieldSuccess.Props>(
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
FieldSuccess.displayName = 'Field.Success';

/* -----------------------------------------------------------------------------------------------*/

export namespace FieldRoot {
    export interface Props extends VComponentProps<typeof BaseField.Root> {}
}

export namespace FieldLabel {
    export interface Props extends VComponentProps<typeof BaseField.Label> {}
}

export namespace FieldDescription {
    export interface Props extends VComponentProps<typeof BaseField.Description> {}
}

export namespace FieldError {
    type ErrorValidityState = Omit<
        Parameters<BaseField.Validity.Props['children']>[0]['validity'],
        'valid'
    >;
    type ErrorMatchProps = { match?: boolean | keyof ErrorValidityState };

    type BaseFieldErrorProps = VComponentProps<typeof BaseField.Error>;
    export interface Props extends Assign<BaseFieldErrorProps, ErrorMatchProps> {}
}

export namespace FieldSuccess {
    type PrimitiveSuccessProps = Omit<VComponentProps<typeof BaseField.Error>, 'match'>;
    export interface Props extends PrimitiveSuccessProps {
        match?: boolean | 'valid';
    }
}
