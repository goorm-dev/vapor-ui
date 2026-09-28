import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const HomeIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M2.667 12.667v-6A1.32 1.32 0 0 1 3.2 5.6l4-3q.35-.267.8-.267t.8.267l4 3q.25.183.391.467.142.282.142.6v6q0 .55-.392.941A1.28 1.28 0 0 1 12 14h-2a.65.65 0 0 1-.475-.192.65.65 0 0 1-.192-.475V10a.65.65 0 0 0-.191-.475.65.65 0 0 0-.476-.192H7.333a.65.65 0 0 0-.475.192.65.65 0 0 0-.191.475v3.333a.65.65 0 0 1-.192.475A.65.65 0 0 1 6 14H4q-.55 0-.942-.392a1.28 1.28 0 0 1-.391-.941"
        />
    </IconBase>
);
export default HomeIcon;
