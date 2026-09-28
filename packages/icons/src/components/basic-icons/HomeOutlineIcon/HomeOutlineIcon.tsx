import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const HomeOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M4 12.667h2V9.333q0-.283.191-.475a.65.65 0 0 1 .476-.191h2.666q.284 0 .475.191a.65.65 0 0 1 .192.475v3.334h2v-6l-4-3-4 3zm-1.333 0v-6A1.32 1.32 0 0 1 3.2 5.6l4-3q.35-.267.8-.267t.8.267l4 3q.25.183.391.467.142.282.142.6v6q0 .55-.392.941A1.28 1.28 0 0 1 12 14H9.333a.65.65 0 0 1-.475-.192.65.65 0 0 1-.192-.475V10H7.333v3.333a.65.65 0 0 1-.192.475.65.65 0 0 1-.474.192H4q-.55 0-.942-.392a1.28 1.28 0 0 1-.391-.941"
        />
    </IconBase>
);
export default HomeOutlineIcon;
