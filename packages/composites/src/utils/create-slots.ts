'use client';

import type { ComponentProps, ElementType, ReactElement, ReactNode } from 'react';
import { Fragment, createElement, isValidElement } from 'react';

const REACT_LAZY_TYPE = Symbol.for('react.lazy');

const isLazyElement = (value: unknown): boolean =>
    typeof value === 'object' &&
    value !== null &&
    (value as { $$typeof?: symbol }).$$typeof === REACT_LAZY_TYPE;

type SlotHost = ElementType;

type HostProps<H extends SlotHost> = ComponentProps<H>;

type SlotComponentProps<H extends SlotHost> = Omit<HostProps<H>, 'render' | 'children'> & {
    render?: ReactNode;
};

type SlotComponent<H extends SlotHost> = (props: SlotComponentProps<H>) => ReactElement | null;

export type SlotProps<T, Required extends keyof T = never> = {
    [K in Required]: ReactNode;
} & { [K in Exclude<keyof T, Required>]?: ReactNode };

type SlotMap<T extends Record<string, SlotHost>> = { [K in keyof T]: SlotComponent<T[K]> };

export function createSlots<T extends Record<string, SlotHost>>(anatomy: T): SlotMap<T> {
    const slots = {} as SlotMap<T>;

    for (const key in anatomy) {
        const host = anatomy[key];

        slots[key] = (({
            render: payload,
            ...extra
        }: { render?: ReactNode } & Record<string, unknown>) => {
            if (payload == null || payload === false) return null;

            const isElement =
                isLazyElement(payload) || (isValidElement(payload) && payload.type !== Fragment);

            return createElement(host, {
                ...extra,
                ...(isElement
                    ? { render: payload as ReactElement }
                    : { children: payload as ReactNode }),
            });
        }) as SlotMap<T>[typeof key];
    }

    return slots;
}
