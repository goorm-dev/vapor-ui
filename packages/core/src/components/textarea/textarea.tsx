'use client';

import type { ComponentProps } from 'react';
import { forwardRef, useCallback, useEffect, useRef } from 'react';

import { Field as BaseField, useRender } from '@base-ui-components/react';
import { useControlled } from '@base-ui-components/utils/useControlled';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import clsx from 'clsx';

import { useAutoResize } from '~/hooks/use-auto-resize';
import { useInputGroup } from '~/hooks/use-input-group';
import type { Assign, VComponentProps } from '~/utils/types';

import type { TextareaVariants } from './textarea.css';
import * as styles from './textarea.css';

type BaseProps = TextareaVariants &
    ComponentProps<'textarea'> & {
        onValueChange?: (value: string) => void;
        minHeight?: number | string;
        maxHeight?: number | string;
        resize?: boolean;
        autoResize?: boolean;
    };

/* -------------------------------------------------------------------------------------------------
 * Textarea
 * -----------------------------------------------------------------------------------------------*/

type TextareaPrimitiveProps = VComponentProps<typeof BaseField.Control>;
interface TextareaProps extends Assign<TextareaPrimitiveProps, BaseProps> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            onValueChange,
            value: valueProp,
            defaultValue,
            className,
            minHeight = 116,
            maxHeight = 400,
            invalid,
            size,
            resize,
            autoResize,
            maxLength,
            render,
            disabled,
            readOnly,
            style,
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
        const { setInputGroupValue, isInGroup } = useInputGroup({
            value,
            defaultValue,
            maxLength,
        });

        const textareaRef = useRef<HTMLTextAreaElement | null>(null);

        const autoResizeTextarea = useAutoResize(textareaRef, {
            autoResize,
            minHeight,
            maxHeight,
        });

        useEffect(() => {
            if (autoResize) {
                autoResizeTextarea();
            }
        }, [value, autoResize, autoResizeTextarea]);

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

        const styleVars = assignInlineVars({
            [styles.textareaMinHeightVar]:
                typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
            [styles.textareaMaxHeightVar]:
                typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        });

        const handleValueChange = (newValue: string) => {
            onValueChange?.(newValue);
            setValue(newValue);
            if (isInGroup) setInputGroupValue(newValue);
        };

        const finalValue = value ?? '';
        return useRender({
            ref: handleRef,
            render: render || <BaseField.Control render={<textarea />} />,
            props: {
                onValueChange(newValue: string) {
                    if (disabled || readOnly) return;

                    handleValueChange(newValue);
                },
                ...(isControlled ? { value: finalValue } : { defaultValue: defaultValue ?? '' }),
                disabled,
                readOnly,
                maxLength,
                'aria-invalid': invalid || undefined,
                'aria-required': props.required || undefined,
                className: clsx(styles.textarea({ invalid, size, resize, autoResize }), className),
                style: { ...styleVars, ...style },
                ...props,
            },
        });
    },
);
Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaProps };
