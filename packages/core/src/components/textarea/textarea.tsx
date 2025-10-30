'use client';

import { forwardRef, useEffect, useRef } from 'react';

import { Field as BaseField, useRender } from '@base-ui-components/react';
import { useControlled } from '@base-ui-components/utils/useControlled';
import clsx from 'clsx';

import { useInputGroup } from '~/components/input-group/input-group';
import { useAutoResize } from '~/hooks/use-auto-resize';
import { composeRefs } from '~/utils/compose-refs';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import type { Assign, VComponentProps } from '~/utils/types';

import type { TextareaVariants } from './textarea.css';
import * as styles from './textarea.css';

/* -------------------------------------------------------------------------------------------------
 * Textarea
 * -----------------------------------------------------------------------------------------------*/

export const Textarea = forwardRef<HTMLTextAreaElement, Textarea.Props>(
    ({ render, value: valueProp, defaultValue = '', onValueChange, className, ...props }, ref) => {
        const isControlled = valueProp !== undefined;

        const [variantProps, otherProps] = createSplitProps<TextareaVariants>()(props, [
            'invalid',
            'size',
            'autoResize',
        ]);

        const { invalid, autoResize } = variantProps;
        const { disabled, readOnly, required, maxLength } = otherProps;

        const [value, setValue] = useControlled({
            controlled: valueProp,
            default: defaultValue,
            name: 'TextArea',
            state: 'value',
        });

        useInputGroup({ value, maxLength });

        const textareaRef = useRef<HTMLTextAreaElement | null>(null);
        const adjustHeight = useAutoResize(textareaRef);

        useEffect(() => {
            if (autoResize) {
                adjustHeight();
            }
        }, [value, autoResize, adjustHeight]);

        const composedRef = composeRefs(textareaRef, ref);

        const handleValueChange = (newValue: string, event: Event) => {
            if (disabled || readOnly) return;

            onValueChange?.(newValue, event);
            setValue(newValue);
        };

        const dataAttrs = createDataAttributes({ disabled, readOnly, required, invalid });

        return useRender({
            ref: composedRef,
            render: render || <BaseField.Control render={<textarea />} />,
            props: {
                ...(isControlled ? { value } : { defaultValue }),
                'aria-invalid': invalid,
                onValueChange: handleValueChange,
                className: clsx(styles.textarea(variantProps), className),
                ...dataAttrs,
                ...otherProps,
            },
        });
    },
);
Textarea.displayName = 'Textarea';

export namespace Textarea {
    type TextareaPrimitiveProps = VComponentProps<'textarea'>;

    export interface Props extends Assign<TextareaPrimitiveProps, TextareaVariants> {
        value?: string;
        defaultValue?: string;
        onValueChange?: (value: string, event: Event) => void;
    }
}
