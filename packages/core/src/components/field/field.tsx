'use client';

import { forwardRef } from 'react';

import { Field as BaseField } from '@base-ui/react/field';
import clsx from 'clsx';

import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import type { LabelVariants } from './field.css';
import * as styles from './field.css';

/* -------------------------------------------------------------------------------------------------
 * Field
 * -----------------------------------------------------------------------------------------------*/

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

export const FieldLabel = forwardRef<HTMLElement, FieldLabel.Props>((props, ref) => {
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

/* -------------------------------------------------------------------------------------------------
 * Field.Item
 * -----------------------------------------------------------------------------------------------*/

export const FieldItem = forwardRef<HTMLDivElement, FieldItem.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseField.Item ref={ref} className={clsx(styles.item, className)} {...componentProps} />
    );
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

export namespace FieldError {
    type ErrorValidityState = Omit<BaseField.ValidityData['state'], 'valid'>;
    type ErrorMatchProps = { match?: boolean | keyof ErrorValidityState };

    export type State = BaseField.Error.State;
    // TODO: match prop 오버라이드 잘 되는지 확인
    export type Props = VaporUIComponentProps<typeof BaseField.Error, State> & ErrorMatchProps;
}

export namespace FieldSuccess {
    type SuccessMatchProps = { match?: boolean | 'valid' };

    export type State = BaseField.Error.State;
    export type Props = VaporUIComponentProps<typeof BaseField.Error, State> & SuccessMatchProps;
}

export namespace FieldItem {
    export type State = BaseField.Item.State;
    export type Props = VaporUIComponentProps<typeof BaseField.Item, State>;
}
