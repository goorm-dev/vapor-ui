import { createSplitProps } from './create-split-props';

export type PositionerProps = {
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
    sideOffset?: number;
    alignOffset?: number;
};

export const splitPositionerProps = <T extends PositionerProps>(props: T) => {
    return createSplitProps<PositionerProps>()(props, [
        'side',
        'align',
        'sideOffset',
        'alignOffset',
    ]);
};
