'use client';

import {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { useRender } from '@base-ui-components/react';
import { useControlled } from '@base-ui-components/utils/useControlled';
import clsx from 'clsx';

import type { VComponentProps } from '~/utils/types';

import * as styles from './input-group.css';

/* -------------------------------------------------------------------------------------------------
 * InputGroup Context
 * -----------------------------------------------------------------------------------------------*/

interface InputGroupSharedProps {
    setValue: (value: string) => void;
    maxLength?: number;
    setInputRef: (ref: HTMLInputElement | null) => void;
    value: string;
    updateProps: (props: Partial<InputGroupInputProps & { maxLength?: number }>) => void;
}

const InputGroupRootContext = createContext<InputGroupSharedProps | null>(null);

const useInputGroupRootContext = (required: boolean = true) => {
    const context = useContext(InputGroupRootContext);

    if (required && !context) {
        throw new Error('useInputGroupRootContext must be used within InputGroup.Root');
    }

    return context;
};

/* -------------------------------------------------------------------------------------------------
 * InputGroup Root
 * -----------------------------------------------------------------------------------------------*/

interface InputGroupRootProps extends VComponentProps<'div'> {
    maxLength?: number;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}

const InputGroupRoot = forwardRef<HTMLDivElement, InputGroupRootProps>(
    (
        {
            maxLength: rootMaxLength,
            defaultValue = '',
            onValueChange: rootOnValueChange,
            className,
            children,
            ...props
        },
        ref,
    ) => {
        const [value, setValue] = useState(defaultValue);
        const [mergedProps, setMergedProps] = useState({
            maxLength: rootMaxLength,
            onValueChange: rootOnValueChange,
            defaultValue,
        });
        const inputRef = useRef<HTMLInputElement | null>(null);

        const handleSetValue = useCallback((newValue: string) => {
            setValue(newValue);
            mergedProps.onValueChange?.(newValue);
        }, [mergedProps]);

        const setInputRef = useCallback((ref: HTMLInputElement | null) => {
            inputRef.current = ref;
        }, []);

        const updateProps = useCallback(
            (inputProps: Partial<InputGroupInputProps & { maxLength?: number }>) => {
                setMergedProps(currentProps => {
                    const newMaxLength = inputProps.maxLength ?? currentProps.maxLength;
                    const newOnValueChange = inputProps.onValueChange ?? currentProps.onValueChange;
                    const newDefaultValue =
                        inputProps.defaultValue?.toString() ?? currentProps.defaultValue;

                    // Only update if something actually changed
                    if (
                        newMaxLength !== currentProps.maxLength ||
                        newOnValueChange !== currentProps.onValueChange ||
                        newDefaultValue !== currentProps.defaultValue
                    ) {
                        return {
                            maxLength: newMaxLength,
                            onValueChange: newOnValueChange,
                            defaultValue: newDefaultValue,
                        };
                    }
                    
                    return currentProps;
                });

                // Update defaultValue if provided from Input
                if (inputProps.defaultValue !== undefined && value === defaultValue) {
                    setValue(inputProps.defaultValue.toString());
                }
            },
            [value, defaultValue],
        );

        const contextValue = useMemo(
            (): InputGroupSharedProps => ({
                setValue: handleSetValue,
                maxLength: mergedProps.maxLength,
                setInputRef,
                value,
                updateProps,
            }),
            [handleSetValue, setInputRef, value, updateProps, mergedProps.maxLength],
        );

        return (
            <InputGroupRootContext.Provider value={contextValue}>
                <div ref={ref} className={clsx(styles.root(), className)} {...props}>
                    {children}
                </div>
            </InputGroupRootContext.Provider>
        );
    },
);
InputGroupRoot.displayName = 'InputGroup.Root';

/* -------------------------------------------------------------------------------------------------
 * InputGroup Input
 * -----------------------------------------------------------------------------------------------*/

interface InputGroupInputProps extends VComponentProps<'input'> {
    type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'search';
    onValueChange?: (value: string) => void;
    maxLength?: number;
}

const InputGroupInput = forwardRef<HTMLInputElement, InputGroupInputProps>(
    ({ onValueChange, className, defaultValue, maxLength: inputMaxLength, ...props }, ref) => {
        const groupContext = useInputGroupRootContext(true);
        const {
            maxLength: contextMaxLength,
            setInputRef,
            value: valueProp,
            updateProps,
        } = groupContext!;

        // Contribute props to context on mount and when props change
        useEffect(() => {
            updateProps({
                onValueChange,
                defaultValue,
                maxLength: inputMaxLength,
            });
        }, [updateProps, onValueChange, defaultValue, inputMaxLength]);

        const [value, setValue] = useControlled({
            controlled: valueProp,
            default: defaultValue,
            name: 'InputGroup',
            state: 'value',
        });

        const maxLength = inputMaxLength ?? contextMaxLength;

        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;
            setValue(newValue);
            onValueChange?.(newValue);
        };

        const handleRef = (element: HTMLInputElement | null) => {
            setInputRef(element);
            if (typeof ref === 'function') {
                ref(element);
            } else if (ref) {
                ref.current = element;
            }
        };

        return (
            <input
                ref={handleRef}
                value={value}
                maxLength={maxLength}
                onChange={handleChange}
                className={className}
                {...props}
            />
        );
    },
);
InputGroupInput.displayName = 'InputGroup.Input';

/* -------------------------------------------------------------------------------------------------
 * InputGroup Count
 * -----------------------------------------------------------------------------------------------*/

interface InputGroupCountProps extends Omit<VComponentProps<'span'>, 'children'> {
    children?: (params: { current: number; max?: number; value: string }) => React.ReactNode;
}

const InputGroupCount = forwardRef<HTMLSpanElement, InputGroupCountProps>(
    ({ className, children, render, ...props }, ref) => {
        const groupContext = useInputGroupRootContext(true);
        const { value, maxLength } = groupContext!;
        console.log(maxLength);
        const currentLength = value.length;

        const content = children
            ? children({ current: currentLength, max: maxLength, value })
            : maxLength !== undefined
              ? `${currentLength}/${maxLength}`
              : currentLength.toString();

        return useRender({
            ref,
            render: render || <span />,
            props: {
                className: clsx(styles.count(), className),
                children: content,
                ...props,
            },
        });
    },
);

InputGroupCount.displayName = 'InputGroup.Count';

/* -----------------------------------------------------------------------------------------------*/

const InputGroup = {
    Root: InputGroupRoot,
    Input: InputGroupInput,
    Count: InputGroupCount,
};

export { InputGroup, useInputGroupRootContext };
export type { InputGroupRootProps, InputGroupInputProps, InputGroupCountProps };
