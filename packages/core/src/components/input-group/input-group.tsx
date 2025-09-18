'use client';

import { forwardRef, useCallback, useState } from 'react';

import type { Field } from '@base-ui-components/react';
import { useRender } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import type { VComponentProps } from '~/utils/types';

import * as styles from './input-group.css';

/* -------------------------------------------------------------------------------------------------
 * InputGroup Context
 * -----------------------------------------------------------------------------------------------*/

interface InputGroupSharedProps {
    value?: Field.Control.Props['value'];
    maxLength?: Field.Control.Props['maxLength'];
    updateValue?: (value: Field.Control.Props['value']) => void;
    setMaxLength?: (maxLength: Field.Control.Props['maxLength']) => void;
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

const Root = forwardRef<HTMLDivElement, InputGroupRootProps>(
    ({ className, render, ...props }, ref) => {
        const [value, setValue] = useState<Field.Control.Props['value']>('');
        const [maxLength, setMaxLength] = useState<Field.Control.Props['maxLength'] | undefined>();

        const updateValue = useCallback((value: Field.Control.Props['value']) => {
            setValue(value);
        }, []);

        const updateMaxLength = useCallback((length: Field.Control.Props['maxLength']) => {
            setMaxLength(length);
        }, []);

        const contextValue: InputGroupSharedProps = {
            value,
            maxLength,
            updateValue,
            setMaxLength: updateMaxLength,
        };

        const element = useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.root, className),
                ...props,
            },
        });

        return <InputGroupProvider value={contextValue}>{element}</InputGroupProvider>;
    },
);
Root.displayName = 'InputGroup.Root';

/* -------------------------------------------------------------------------------------------------
 * InputGroup Count
 * -----------------------------------------------------------------------------------------------*/

type ChildrenProps = { count: number; maxLength?: number; value: Field.Control.Props['value'] };

interface InputGroupCounterProps extends Omit<VComponentProps<'span'>, 'children'> {
    children?: React.ReactNode | ((props: ChildrenProps) => React.ReactNode);
}

const Counter = forwardRef<HTMLSpanElement, InputGroupCounterProps>(
    ({ className, children, render, ...props }, ref) => {
        const { value = '', maxLength } = useInputGroupContext();
        const currentLength = value.toString().length;

        const content = children
            ? typeof children === 'function'
                ? children({ count: currentLength, maxLength, value })
                : children
            : maxLength !== undefined
              ? `${currentLength}/${maxLength}`
              : currentLength.toString();

        return useRender({
            ref,
            render: render || <span />,
            props: {
                className: clsx(styles.counter, className),
                children: content,
                ...props,
            },
        });
    },
);

Counter.displayName = 'InputGroup.Counter';

/* -----------------------------------------------------------------------------------------------*/

export const InputGroup = {
    Root,
    Counter,
};

export { Counter as InputGroupCounter, Root as InputGroupRoot, useInputGroupContext };
export type { InputGroupCounterProps, InputGroupRootProps };
