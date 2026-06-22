import { $style } from '@vapor-ui/core';
export const C = (isLarge) => <div className={$style({ padding: isLarge ? '$600' : '$400' })} />;
