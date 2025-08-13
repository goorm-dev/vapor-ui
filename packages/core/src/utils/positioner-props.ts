import type { ComponentPropsWithoutRef, ElementType } from 'react';

type PrimitiveProps = ComponentPropsWithoutRef<'div'>;

export type OnlyPositionerProps<T extends ElementType> = Omit<
    ComponentPropsWithoutRef<T>,
    keyof PrimitiveProps | 'render'
>;
