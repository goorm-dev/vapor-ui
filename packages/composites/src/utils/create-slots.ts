'use client';

import type { ReactElement, ReactNode } from 'react';
import { Fragment, cloneElement, isValidElement } from 'react';

type SlotHost = ReactElement<{ render?: ReactElement; children?: ReactNode }>;

type HostProps<H> = H extends ReactElement<infer P> ? P : never;

type SlotComponentProps<H extends SlotHost> = HostProps<H>;

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

            const isElement = isValidElement(payload) && payload.type !== Fragment;

            return cloneElement(host, {
                ...extra,
                ...(isElement
                    ? { render: payload as ReactElement }
                    : { children: payload as ReactNode }),
            });
        }) as SlotMap<T>[typeof key];
    }

    return slots;
}
