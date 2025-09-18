'use client';

import { forwardRef, useMemo, useState } from 'react';

import type { Field } from '@base-ui-components/react';
import { useRender } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import type { VComponentProps } from '~/utils/types';

import * as styles from './input-group.css';

/* -------------------------------------------------------------------------------------------------
 * Type Aliases
 * -----------------------------------------------------------------------------------------------*/

type FieldValue = Field.Control.Props['value'];
type FieldMaxLength = Field.Control.Props['maxLength'];

/* -------------------------------------------------------------------------------------------------
 * InputGroup Context
 * -----------------------------------------------------------------------------------------------*/

interface InputGroupSharedProps {
    value?: FieldValue;
    maxLength?: FieldMaxLength;
    setValue?: (value: FieldValue) => void;
    setMaxLength?: (maxLength: FieldMaxLength) => void;
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
        const [value, setValue] = useState<FieldValue>('');
        const [maxLength, setMaxLength] = useState<FieldMaxLength | undefined>();

        const contextValue: InputGroupSharedProps = useMemo(
            () => ({
                value,
                maxLength,
                setValue,
                setMaxLength,
            }),
            [value, maxLength],
        );

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

type CounterRenderProps = { count: number; maxLength?: number; value: FieldValue };

interface InputGroupCounterProps extends Omit<VComponentProps<'span'>, 'children'> {
    children?: React.ReactNode | ((props: CounterRenderProps) => React.ReactNode);
}

/**
 * Safely calculates the length of a field value, handling null/undefined cases
 */
const getValueLength = (value: FieldValue): number => {
    if (value == null) return 0;
    return String(value).length;
};

/**
 * Generates counter content based on children prop or default format
 */
const generateCounterContent = (
    children: InputGroupCounterProps['children'],
    count: number,
    maxLength?: number,
    value?: FieldValue,
): React.ReactNode => {
    if (children) {
        return typeof children === 'function' ? children({ count, maxLength, value }) : children;
    }

    return maxLength !== undefined ? `${count}/${maxLength}` : count.toString();
};

const Counter = forwardRef<HTMLSpanElement, InputGroupCounterProps>(
    ({ className, children, render, ...props }, ref) => {
        const { value, maxLength } = useInputGroupContext();
        const currentLength = getValueLength(value);
        const content = generateCounterContent(children, currentLength, maxLength, value);

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
