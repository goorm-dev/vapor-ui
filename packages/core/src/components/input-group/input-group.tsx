'use client';

import { forwardRef, useEffect, useMemo, useState } from 'react';

import type { Field } from '@base-ui-components/react';
import { useRender } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import type { VComponentProps } from '~/utils/types';

import * as styles from './input-group.css';

/* -------------------------------------------------------------------------------------------------
 * Type Aliases
 * -----------------------------------------------------------------------------------------------*/

type FieldValue = string;
type FieldMaxLength = Field.Control.Props['maxLength'];

/* -------------------------------------------------------------------------------------------------
 * InputGroup Context
 * -----------------------------------------------------------------------------------------------*/

interface InputGroupSharedProps {
    value: FieldValue;
    maxLength?: FieldMaxLength;
    setValue: (value: FieldValue) => void;
    setMaxLength: (maxLength: FieldMaxLength) => void;
}

const [InputGroupProvider, useInputGroupContext] = createContext<InputGroupSharedProps>({
    name: 'InputGroup',
    hookName: 'useInputGroup',
    providerName: 'InputGroupProvider',
    strict: false,
});

/* -------------------------------------------------------------------------------------------------
 * useInputGroup Hook
 * -----------------------------------------------------------------------------------------------*/

interface UseInputGroupSyncOptions {
    value?: string;
    maxLength?: Field.Control.Props['maxLength'];
}

/**
 * Custom hook to handle InputGroup context synchronization
 * Separates InputGroup-related logic from Input component
 */
export function useInputGroup({ value, maxLength }: UseInputGroupSyncOptions) {
    const { setValue, setMaxLength } = useInputGroupContext() ?? {};

    useEffect(() => {
        if (setMaxLength && maxLength !== undefined) {
            setMaxLength(maxLength);
        }
    }, [setMaxLength, maxLength]);

    useEffect(() => {
        if (setValue && value !== undefined) {
            setValue(String(value));
        }
    }, [setValue, value]);
}

/* -------------------------------------------------------------------------------------------------
 * InputGroup Root
 * -----------------------------------------------------------------------------------------------*/

interface InputGroupRootProps extends VComponentProps<'div'> {}

/**
 * 입력 필드와 관련된 추가 정보를 그룹화하는 컨테이너 컴포넌트입니다.
 *
 * `<div>` 요소를 렌더링합니다.
 *
 * {@see https://vapor-ui.goorm.io/docs/components/input-group InputGroup Documentation}
 */
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

type CounterRenderProps = { count: number; maxLength?: number; value: string };

interface InputGroupCounterProps extends Omit<VComponentProps<'span'>, 'children'> {
    children?: React.ReactNode | ((props: CounterRenderProps) => React.ReactNode);
}

/**
 * Generates counter content based on children prop or default format
 */
const generateCounterContent = (
    children: InputGroupCounterProps['children'],
    count: number,
    maxLength?: number,
    value?: string,
): React.ReactNode => {
    if (children) {
        return typeof children === 'function'
            ? children({ count, maxLength, value: value ?? '' })
            : children;
    }

    return maxLength !== undefined ? `${count}/${maxLength}` : `${count}`;
};

/**
 * 입력 필드의 문자 개수를 표시하는 카운터 컴포넌트입니다.
 *
 * `<span>` 요소를 렌더링합니다.
 */
const Counter = forwardRef<HTMLSpanElement, InputGroupCounterProps>(
    ({ className, children, render, ...props }, ref) => {
        const { value, maxLength } = useInputGroupContext();
        const currentLength = value.length;
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
