'use client';

import { forwardRef, useCallback, useEffect, useRef } from 'react';

import { Field as BaseField, useRender } from '@base-ui-components/react';
import { useControlled } from '@base-ui-components/utils/useControlled';
import clsx from 'clsx';

import { useInputGroup } from '~/components/input-group/input-group';
import { useAutoResize } from '~/hooks/use-auto-resize';
import type { Assign, VComponentProps } from '~/utils/types';

import type { TextareaVariants } from './textarea.css';
import * as styles from './textarea.css';

type BaseProps = TextareaVariants & {
    onValueChange?: (value: string, event: Event) => void;
    autoResize?: boolean;
};

/* -------------------------------------------------------------------------------------------------
 * Textarea
 * -----------------------------------------------------------------------------------------------*/

type TextareaPrimitiveProps = VComponentProps<'textarea'>;
interface TextareaProps extends Assign<TextareaPrimitiveProps, BaseProps> {
    value?: string;
    defaultValue?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            onValueChange,
            value: valueProp,
            defaultValue,
            className,
            invalid,
            size,
            autoResize,
            maxLength,
            render,
            disabled,
            readOnly,
            ...props
        },
        ref,
    ) => {
        const isControlled = valueProp !== undefined;

        // Use useControlled for unified value state management
        const [value, setValue] = useControlled({
            controlled: valueProp,
            default: defaultValue,
            name: 'TextArea',
            state: 'value',
        });

        // Handle InputGroup synchronization via custom hook
        useInputGroup({
            value,
            maxLength,
        });

        const textareaRef = useRef<HTMLTextAreaElement | null>(null);

        // Auto resize functionality
        const adjustHeight = useAutoResize(textareaRef);

        // Trigger auto resize when value changes
        useEffect(() => {
            if (autoResize) {
                adjustHeight();
            }
        }, [value, autoResize, adjustHeight]);

        const handleRef = useCallback(
            (node: HTMLTextAreaElement | null) => {
                textareaRef.current = node;
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref && 'current' in ref) {
                    ref.current = node;
                }
            },
            [ref],
        );

        const handleValueChange = (newValue: string, event: Event) => {
            onValueChange?.(newValue, event);
            setValue(newValue);
        };

        const finalValue = value ?? '';
        return useRender({
            ref: handleRef,
            render: render || <BaseField.Control render={<textarea />} />,
            props: {
                onValueChange(newValue: string, event: Event) {
                    if (disabled || readOnly) return;

                    handleValueChange(newValue, event);
                },
                ...(isControlled ? { value: finalValue } : { defaultValue: defaultValue ?? '' }),
                disabled,
                readOnly,
                maxLength,
                'aria-invalid': invalid || undefined,
                'aria-required': props.required || undefined,
                className: clsx(styles.textarea({ invalid, size, autoResize }), className),
                ...props,
            },
        });
    },
);
Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaProps };
