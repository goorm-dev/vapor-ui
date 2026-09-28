import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const RefreshOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M8 13.333q-2.234 0-3.783-1.55-1.55-1.55-1.55-3.783t1.55-3.783T8 2.667q1.15 0 2.2.475T12 4.5V3.333q0-.283.191-.475a.65.65 0 0 1 .475-.191q.285 0 .476.191a.65.65 0 0 1 .191.475v3.334a.65.65 0 0 1-.191.475.65.65 0 0 1-.476.191H9.333a.65.65 0 0 1-.475-.191.65.65 0 0 1-.192-.475q0-.284.192-.475A.65.65 0 0 1 9.333 6h2.133a3.9 3.9 0 0 0-1.458-1.467A3.95 3.95 0 0 0 8 4Q6.333 4 5.167 5.167T4 8t1.167 2.833T8 12q1.133 0 2.075-.575a3.97 3.97 0 0 0 1.458-1.542.7.7 0 0 1 .375-.325.7.7 0 0 1 .492-.008.6.6 0 0 1 .383.35.53.53 0 0 1-.016.5 5.4 5.4 0 0 1-1.95 2.133q-1.267.8-2.817.8"
        />
    </IconBase>
);
export default RefreshOutlineIcon;
