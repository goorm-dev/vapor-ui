'use client';

import { createContext, forwardRef, useCallback, useContext, useState } from 'react';

import { useRender } from '@base-ui-components/react';
import clsx from 'clsx';

import type { VComponentProps } from '~/utils/types';

import * as styles from './input-group.css';

/* -------------------------------------------------------------------------------------------------
 * InputGroup Context
 * -----------------------------------------------------------------------------------------------*/

interface InputGroupContextValue {
    value?: string;
    maxLength?: number;
    updateValue?: (value: string) => void;
    setMaxLength?: (maxLength: number) => void;
}

const InputGroupContext = createContext<InputGroupContextValue>({});

const useInputGroupContext = () => {
    return useContext(InputGroupContext);
};

/* -------------------------------------------------------------------------------------------------
 * InputGroup Root
 * -----------------------------------------------------------------------------------------------*/

interface InputGroupRootProps extends VComponentProps<'div'> {}

const InputGroupRoot = forwardRef<HTMLDivElement, InputGroupRootProps>(
    ({ className, children, ...props }, ref) => {
        const [value, setValue] = useState('');
        const [maxLength, setMaxLength] = useState<number | undefined>();

        const updateValue = useCallback((newValue: string) => {
            setValue(newValue);
        }, []);

        const handleSetMaxLength = useCallback((newMaxLength: number) => {
            setMaxLength(newMaxLength);
        }, []);

        const contextValue: InputGroupContextValue = {
            value,
            maxLength,
            updateValue,
            setMaxLength: handleSetMaxLength,
        };

        return (
            <InputGroupContext.Provider value={contextValue}>
                <div ref={ref} className={clsx(styles.root(), className)} {...props}>
                    {children}
                </div>
            </InputGroupContext.Provider>
        );
    },
);
InputGroupRoot.displayName = 'InputGroup.Root';

/* -------------------------------------------------------------------------------------------------
 * InputGroup Count
 * -----------------------------------------------------------------------------------------------*/

interface InputGroupCountProps extends Omit<VComponentProps<'span'>, 'children'> {
    children?: (params: { current: number; maxLength?: number; value: string }) => React.ReactNode;
}

const InputGroupCount = forwardRef<HTMLSpanElement, InputGroupCountProps>(
    ({ className, children, render, ...props }, ref) => {
        const { value = '', maxLength } = useInputGroupContext();
        const currentLength = value.length;

        const content = children
            ? children({ current: currentLength, maxLength, value })
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
    Count: InputGroupCount,
};

export { InputGroup, useInputGroupContext };
export type { InputGroupRootProps, InputGroupCountProps };
