import type { ComponentPropsWithoutRef, ElementType } from 'react';

export type Side = 'bottom' | 'left' | 'right' | 'top';
export type Align = 'start' | 'end' | 'center';

type PrimitiveProps = ComponentPropsWithoutRef<'div'>;

export type OnlyPositionerProps<T extends ElementType> = Omit<
    ComponentPropsWithoutRef<T>,
    keyof PrimitiveProps | 'render'
> & { side?: Side; align?: Align };
