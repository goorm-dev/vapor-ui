'use client';

import { forwardRef, useCallback, useEffect, useRef } from 'react';

import { Field as BaseField, useRender } from '@base-ui/react';
import { useControlled } from '@base-ui/utils/useControlled';
import clsx from 'clsx';

import { useInputGroup } from '~/components/input-group/input-group';
import { composeRefs } from '~/utils/compose-refs';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { Assign, VComponentProps } from '~/utils/types';

import type { TextareaVariants } from './textarea.css';
import * as styles from './textarea.css';

/* -------------------------------------------------------------------------------------------------
 * Textarea
 * -----------------------------------------------------------------------------------------------*/

export const Textarea = forwardRef<HTMLTextAreaElement, Textarea.Props>((props, ref) => {
    const {
        render,
        value: valueProp,
        defaultValue = '',
        onValueChange,
        className,
        ...componentProps
    } = resolveStyles(props);
    const isControlled = valueProp !== undefined;

    const [variantProps, otherProps] = createSplitProps<TextareaVariants>()(componentProps, [
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

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useAutoResize({ ref: textareaRef, value, autoResize });

    const composedRef = composeRefs(textareaRef, ref);

    const handleValueChange = (newValue: string, event: Textarea.ChangeEventDetails) => {
        if (disabled || readOnly) return;

        onValueChange?.(newValue, event);
        setValue(newValue);
    };

    return useRender({
        ref: composedRef,
        state: { disabled, readOnly, required, invalid },
        render: render || <BaseField.Control render={<textarea />} />,
        props: {
            ...(isControlled ? { value } : { defaultValue }),
            'aria-invalid': invalid,
            onValueChange: handleValueChange,
            className: clsx(styles.textarea(variantProps), className),
            ...otherProps,
        },
    });
});
Textarea.displayName = 'Textarea';

/* -----------------------------------------------------------------------------------------------*/

interface AutoResizeOptions extends Pick<Textarea.Props, 'value' | 'autoResize'> {
    ref: React.RefObject<HTMLTextAreaElement>;
}

export function useAutoResize({ ref, value, autoResize }: AutoResizeOptions) {
    const adjustHeight = useCallback(() => {
        if (!autoResize) return;

        const element = ref.current;
        if (!element) return;

        // Reset height to auto to get the correct scrollHeight
        element.style.height = 'auto';

        // Set height to scrollHeight to fit content
        element.style.height = `${element.scrollHeight}px`;
    }, [ref, autoResize]);

    useEffect(() => {
        if (!autoResize) return;

        adjustHeight();
    }, [value, adjustHeight, autoResize]);

    return ref;
}

/* -----------------------------------------------------------------------------------------------*/

export namespace Textarea {
    type TextareaPrimitiveProps = VComponentProps<'textarea'>;

    export interface Props extends Assign<TextareaPrimitiveProps, TextareaVariants> {
        value?: string;
        defaultValue?: string;
        onValueChange?: (value: string, event: Textarea.ChangeEventDetails) => void;
    }

    export type ChangeEventDetails = BaseField.Control.ChangeEventDetails;
}
