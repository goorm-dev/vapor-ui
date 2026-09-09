import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const OrganizationIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M1.334 12.667V3.333q0-.55.391-.941Q2.116 2 2.667 2h4q.55 0 .942.392.39.391.391.941v1.334h5.334q.55 0 .941.391.392.391.392.942v6.667q0 .55-.392.941a1.28 1.28 0 0 1-.941.392H2.667q-.55 0-.942-.392a1.28 1.28 0 0 1-.392-.941m1.333 0H4v-1.334H2.667zm0-2.667H4V8.667H2.667zm0-2.667H4V6H2.667zm0-2.666H4V3.333H2.667zm2.667 8h1.333v-1.334H5.334zm0-2.667h1.333V8.667H5.334zm0-2.667h1.333V6H5.334zm0-2.666h1.333V3.333H5.334zm2.666 8h5.334V6H8v1.333h1.334v1.334H8V10h1.334v1.333H8zm2.667-4V7.333H12v1.334zm0 2.666V10H12v1.333z"
        />
    </IconBase>
);
export default OrganizationIcon;
