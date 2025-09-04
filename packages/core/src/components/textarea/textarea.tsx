'use client';

import type { ChangeEvent } from 'react';
import { forwardRef, useId } from 'react';

import { Field as BaseField, useRender } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSplitProps } from '~/utils/create-split-props';
import type { Assign, VComponentProps } from '~/utils/types';

import type { FieldVariants, RootVariants } from './textarea.css';
import * as styles from './textarea.css';

type TextareaVariants = RootVariants & FieldVariants;
type TextareaSharedProps = TextareaVariants & {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    readOnly?: boolean;
    placeholder?: string;
    rows?: number;
    cols?: number;
    resizing?: boolean;
};

type TextareaContextType = TextareaSharedProps & {
    textareaId?: string;
};

const [TextareaProvider, useTextareaContext] = createContext<TextareaContextType>({
    name: 'Textarea',
    hookName: 'useTextareaContext',
    providerName: 'TextareaProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Textarea
 * -----------------------------------------------------------------------------------------------*/

type TextareaPrimitiveProps = VComponentProps<'div'>;
interface TextareaRootProps extends Assign<TextareaPrimitiveProps, TextareaSharedProps> {}

const Root = forwardRef<HTMLDivElement, TextareaRootProps>(
    ({ render, className, ...props }, ref) => {
        const textareaId = useId();
        const [textareaRootProps, otherProps] = createSplitProps<TextareaSharedProps>()(props, [
            'value',
            'onValueChange',
            'defaultValue',
            'size',
            'disabled',
            'invalid',
            'readOnly',
            'placeholder',
            'rows',
            'cols',
            'resizing',
        ]);

        const { disabled } = textareaRootProps;

        const element = useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.root({ disabled }), className),
                ...otherProps,
            },
        });

        return (
            <TextareaProvider value={{ textareaId, ...textareaRootProps }}>
                {element}
            </TextareaProvider>
        );
    },
);
Root.displayName = 'Textarea.Root';

/* -------------------------------------------------------------------------------------------------
 * Textarea.Field
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveTextareaProps = VComponentProps<'textarea'>;
interface TextareaFieldProps extends Omit<PrimitiveTextareaProps, keyof TextareaSharedProps> {}

const Field = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
    ({ render, id: idProp, className, ...props }, ref) => {
        const {
            textareaId,
            value,
            onValueChange,
            defaultValue,
            disabled,
            invalid,
            readOnly,
            size,
            placeholder,
            rows,
            cols,
            resizing,
        } = useTextareaContext();

        const id = idProp || textareaId;

        return useRender({
            ref,
            render: render || <BaseField.Control render={<textarea />} />,
            props: {
                id,
                value,
                onChange(event: ChangeEvent<HTMLTextAreaElement>) {
                    if (event.defaultPrevented) return;
                    if (disabled || readOnly) return;

                    onValueChange?.(event.target.value);
                },
                defaultValue,
                disabled,
                'aria-invalid': invalid,
                readOnly,
                placeholder,
                rows,
                cols,
                className: clsx(styles.field({ invalid, size, resizing }), className),
                ...props,
            },
        });
    },
);
Field.displayName = 'Textarea.Field';

/* -----------------------------------------------------------------------------------------------*/

export { Root as TextareaRoot, Field as TextareaField };
export type { TextareaRootProps, TextareaFieldProps };

export const Textarea = { Root, Field };
