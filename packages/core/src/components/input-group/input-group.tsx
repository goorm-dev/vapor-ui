'use client';

import { forwardRef, useCallback, useState } from 'react';

import { useRender } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import type { VComponentProps } from '~/utils/types';

import * as styles from './input-group.css';

/* -------------------------------------------------------------------------------------------------
 * InputGroup Context
 * -----------------------------------------------------------------------------------------------*/

interface InputGroupSharedProps {
    value?: string;
    maxLength?: number;
    updateValue?: (value: string) => void;
    setMaxLength?: (maxLength: number) => void;
}

const [InputGroupProvider, useInputGroupContext] = createContext<InputGroupSharedProps>({
    name: 'InputGroup',
    hookName: 'useInputGroup',
    providerName: 'InputGroupProvider',
    strict: false, // Make it non-strict so TextInput can work standalone
});

/* -------------------------------------------------------------------------------------------------
 * InputGroup Root
 * -----------------------------------------------------------------------------------------------*/

interface InputGroupRootProps extends VComponentProps<'div'> {}

const InputGroupRoot = forwardRef<HTMLDivElement, InputGroupRootProps>(
    ({ className, children, render, ...props }, ref) => {
        const [value, setValue] = useState('');
        const [maxLength, setMaxLength] = useState<number | undefined>();

        const updateValue = useCallback((newValue: string) => {
            setValue(newValue);
        }, []);

        const handleSetMaxLength = useCallback((newMaxLength: number) => {
            setMaxLength(newMaxLength);
        }, []);

        const contextValue: InputGroupSharedProps = {
            value,
            maxLength,
            updateValue,
            setMaxLength: handleSetMaxLength,
        };

        const element = useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.root(), className),
                children,
                ...props,
            },
        });

        return <InputGroupProvider value={contextValue}>{element}</InputGroupProvider>;
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
export type { InputGroupCountProps, InputGroupRootProps };
