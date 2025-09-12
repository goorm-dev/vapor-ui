'use client';

import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react';
import { Field as BaseField } from '@base-ui-components/react/field';
import clsx from 'clsx';

import type { Assign, VComponentProps } from '~/utils/types';

import type { RootVariants } from './field.css';
import * as styles from './field.css';

type FieldVariants = RootVariants;

type FieldSharedProps = FieldVariants;

/* -------------------------------------------------------------------------------------------------
 * Field
 * -----------------------------------------------------------------------------------------------*/

type FieldPrimitiveProps = VComponentProps<typeof BaseField.Root>;
interface FieldRootProps extends Assign<FieldPrimitiveProps, FieldSharedProps> {}

const Root = forwardRef<HTMLDivElement, FieldRootProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <BaseField.Root className={clsx(className, styles.root())} ref={ref} {...props}>
                {children}
            </BaseField.Root>
        );
    },
);

Root.displayName = 'Field.Root';

/* -------------------------------------------------------------------------------------------------
 * Field.Label
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveLabelProps = VComponentProps<typeof BaseField.Label>;
interface FieldLabelProps extends PrimitiveLabelProps {}

const Label = forwardRef<HTMLLabelElement, FieldLabelProps>(({ className, ...props }, ref) => {
    return <BaseField.Label ref={ref} className={clsx(styles.label(), className)} {...props} />;
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
                className={clsx(styles.description(), className)}
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

type BaseFieldErrorProps = VComponentProps<typeof BaseField.Error>;
interface FieldErrorProps extends BaseFieldErrorProps {}

const Error = forwardRef<HTMLDivElement, FieldErrorProps>(({ className, match, ...props }, ref) => {
    return (
        <BaseField.Error
            {...props}
            ref={ref}
            className={clsx(styles.error(), className)}
            match={match}
        />
    );
});

Error.displayName = 'Field.Error';

/* -------------------------------------------------------------------------------------------------
 * Field.Success
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveSuccessProps = Omit<VComponentProps<typeof BaseField.Validity>, 'children'>;
interface FieldSuccessProps extends PrimitiveSuccessProps, useRender.ComponentProps<'span'> {}

const Success = forwardRef<HTMLSpanElement, FieldSuccessProps>(
    ({ render, className, ...props }, ref) => {
        const element = useRender({
            render: render || <span />,
            ref,
            props: { className: clsx(styles.success(), className), ...props },
        });
        return (
            <BaseField.Validity>
                {(validity) => {
                    return validity.validity.valid ? element : null;
                }}
            </BaseField.Validity>
        );
    },
);
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
