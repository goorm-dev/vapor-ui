'use client';

import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';

import { Field as BaseField } from '@base-ui/react/field';
import { useRender } from '@base-ui/react/use-render';
import { useControlled } from '@base-ui/utils/useControlled';
import clsx from 'clsx';

import { useInputGroup } from '~/components/input-group/input-group';
import { composeRefs } from '~/utils/compose-refs';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import type { TextareaVariants } from './textarea.css';
import * as styles from './textarea.css';

/* -------------------------------------------------------------------------------------------------
 * Textarea
 * -----------------------------------------------------------------------------------------------*/

export const Textarea = forwardRef<HTMLElement, Textarea.Props>((props, ref) => {
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

    const { invalid = false, autoResize } = variantProps;
    const { disabled = false, readOnly = false, required = false, maxLength } = otherProps;

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

    const state: Textarea.State = useMemo(
        () => ({ disabled, readOnly, required, invalid }),
        [disabled, readOnly, required, invalid],
    );

    return useRender({
        ref: composedRef,
        state,
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

export interface AutoResizeOptions extends Pick<Textarea.Props, 'value' | 'autoResize'> {
    ref: React.RefObject<HTMLTextAreaElement | null>;
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

export interface TextareaState {
    [key: string]: unknown;
    /**
     * Whether the component should ignore user interaction.
     */
    disabled: boolean;
    /**
     * Whether the user should be unable to edit the textarea.
     */
    readOnly: boolean;
    /**
     * Whether the user must fill out the textarea before submitting a form.
     */
    required: boolean;
    /**
     * Whether the component is in an error state.
     */
    invalid: boolean;
}

export interface TextareaFieldProps
    extends VaporUIComponentProps<'textarea', TextareaState>, TextareaVariants {
    /**
     * The value of the textarea. Use when controlled.
     */
    value?: string;
    /**
     * The default value of the textarea. Use when uncontrolled.
     */
    defaultValue?: string;
    /**
     * Event handler called when the value of the textarea changes.
     */
    onValueChange?: (value: string, event: Textarea.ChangeEventDetails) => void;
}

export namespace Textarea {
    export type State = TextareaState;
    export type Props = TextareaFieldProps;

    export type ChangeEventDetails = BaseField.Control.ChangeEventDetails;
}
