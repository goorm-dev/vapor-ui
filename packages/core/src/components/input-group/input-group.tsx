'use client';

import { forwardRef, useEffect, useMemo, useState } from 'react';

import { useRender } from '@base-ui-components/react';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import * as styles from './input-group.css';

/* -------------------------------------------------------------------------------------------------
 * InputGroup Context
 * -----------------------------------------------------------------------------------------------*/

type FieldValue = string;
type FieldMaxLength = number;

type InputGroupSharedProps = {
    value: FieldValue;
    maxLength?: FieldMaxLength;
    setValue: (value: FieldValue) => void;
    setMaxLength: (maxLength: FieldMaxLength) => void;
};

export const [InputGroupProvider, useInputGroupContext] = createContext<InputGroupSharedProps>({
    name: 'InputGroup',
    hookName: 'useInputGroup',
    providerName: 'InputGroupProvider',
    strict: false,
});

/* -------------------------------------------------------------------------------------------------
 * InputGroup Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * 입력 필드와 관련 요소를 그룹화하는 컴포넌트
 */
export const InputGroupRoot = forwardRef<HTMLDivElement, InputGroupRoot.Props>((props, ref) => {
    const { className, render, ...componentProps } = resolveStyles(props);

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
            ...componentProps,
        },
    });

    return <InputGroupProvider value={contextValue}>{element}</InputGroupProvider>;
});
InputGroupRoot.displayName = 'InputGroup.Root';

/* -------------------------------------------------------------------------------------------------
 * InputGroup Count
 * -----------------------------------------------------------------------------------------------*/

/**
 * 입력 문자 수 표시 컴포넌트
 */
export const InputGroupCounter = forwardRef<HTMLSpanElement, InputGroupCounter.Props>(
    (props, ref) => {
        const {
            render,
            className,
            children: childrenProp,
            ...componentProps
        } = resolveStyles(props);

        const { value, maxLength } = useInputGroupContext();

        const content = generateCounterContent({
            maxLength,
            count: value.length,
        });

        const children =
            typeof childrenProp === 'function'
                ? childrenProp({ count: value.length, maxLength, value })
                : childrenProp || content;

        return useRender({
            ref,
            render: render || <span />,
            props: {
                className: clsx(styles.counter, className),
                children,
                ...componentProps,
            },
        });
    },
);
InputGroupCounter.displayName = 'InputGroup.Counter';

/* -----------------------------------------------------------------------------------------------*/

type CounterContentOptions = {
    count: number;
    maxLength?: number;
};

const generateCounterContent = ({ count, maxLength }: CounterContentOptions) => {
    return maxLength ? `${count}/${maxLength}` : `${count}`;
};

/* -----------------------------------------------------------------------------------------------*/

type UseInputGroupOptions = {
    value?: FieldValue;
    maxLength?: FieldMaxLength;
};

export function useInputGroup({ value, maxLength }: UseInputGroupOptions) {
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

/* -----------------------------------------------------------------------------------------------*/

export namespace InputGroupRoot {
    export interface Props extends VComponentProps<'div'> {}
}

export namespace InputGroupCounter {
    type PrimitiveCounterProps = Omit<VComponentProps<'span'>, 'children'>;
    type CounterRenderProps = { count: number; maxLength?: number; value: string };

    export interface Props extends PrimitiveCounterProps {
        children?: React.ReactNode | ((props: CounterRenderProps) => React.ReactNode);
    }
}
