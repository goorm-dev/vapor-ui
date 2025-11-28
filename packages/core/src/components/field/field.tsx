'use client';

import { forwardRef } from 'react';

import { Field as BaseField } from '@base-ui-components/react/field';
import clsx from 'clsx';

import { resolveStyles } from '~/utils/resolve-styles';
import type { Assign, VComponentProps } from '~/utils/types';

import * as styles from './field.css';

/* -------------------------------------------------------------------------------------------------
 * Field
 * -----------------------------------------------------------------------------------------------*/

/**
 * 폼 입력 필드를 구성하는 컨테이너 컴포넌트
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
 * 필드 레이블
 */
export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabel.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseField.Label ref={ref} className={clsx(styles.label, className)} {...componentProps} />
    );
});
FieldLabel.displayName = 'Field.Label';

/* -------------------------------------------------------------------------------------------------
 * Field.Description
 * -----------------------------------------------------------------------------------------------*/

/**
 * 필드 설명 텍스트
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
 * 필드 오류 메시지
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
 * 필드 성공 메시지
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
    export interface Props extends VComponentProps<typeof BaseField.Label> {}
}

export namespace FieldDescription {
    export interface Props extends VComponentProps<typeof BaseField.Description> {}
}

export namespace FieldError {
    type ErrorValidityState = Omit<BaseField.ValidityData['state'], 'valid'>;
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
