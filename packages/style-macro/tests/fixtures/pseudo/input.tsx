import { $style } from '@vapor-ui/core';

export const C = () => (
    <div className={$style({ color: { default: '$primary', _hover: '$primary' } })} />
);
