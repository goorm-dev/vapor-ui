import type { ComponentPropsWithoutRef, ElementType } from 'react';

type PrimitiveProps = ComponentPropsWithoutRef<'div'>;

export type OnlyPositionerProps<T extends ElementType> = Omit<
    ComponentPropsWithoutRef<T>,
    keyof PrimitiveProps | 'render'
>;

// export type PositionerProps = {
//     side?: 'top' | 'bottom' | 'left' | 'right';
//     align?: 'start' | 'center' | 'end';
//     sideOffset?: number;
//     alignOffset?: number;
// };

// export const splitPositionerProps = <T extends PositionerProps>(props: T) => {
//     return createSplitProps<PositionerProps>()(props, [
//         'side',
//         'align',
//         'sideOffset',
//         'alignOffset',
//     ]);
// };
