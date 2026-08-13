'use client';

import type { ReactElement, ReactNode } from 'react';
import { Fragment, cloneElement, isValidElement } from 'react';

type SlotHost = ReactElement<{ render?: ReactElement; children?: ReactNode }>;
type Props = { render?: ReactNode; [key: string]: unknown };
type SlotComponent = (props: Props) => ReactElement | null;

export type SlotProps<T extends Record<string, SlotComponent>, Required extends keyof T = never> = {
    [K in Required]: ReactNode;
} & { [K in Exclude<keyof T, Required>]?: ReactNode };

type SlotMap<T> = { [K in keyof T]: SlotComponent };

export function createSlots<T extends Record<string, SlotHost>>(anatomy: T): SlotMap<T> {
    const slots = {} as SlotMap<T>;

    for (const key in anatomy) {
        const host = anatomy[key];

        slots[key] = ({ render: payload, ...extra }) => {
            if (payload == null || payload === false) return null;

            const isElement = isValidElement(payload) && payload.type !== Fragment;

            return cloneElement(host, {
                ...extra,
                ...(isElement
                    ? { render: payload as ReactElement }
                    : { children: payload as ReactNode }),
            });
        };
    }

    return slots;
}
