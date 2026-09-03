import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const NetworkOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M2 13.333v-2q0-.55.392-.941.391-.392.941-.392H4V8.667q0-.55.392-.942.391-.392.941-.392h2V6h-.666q-.55 0-.942-.392a1.28 1.28 0 0 1-.392-.941v-2q0-.55.392-.942.391-.392.942-.392h2.666q.55 0 .942.392t.392.942v2q0 .55-.392.941A1.28 1.28 0 0 1 9.333 6h-.666v1.333h2q.55 0 .941.392.392.392.392.942V10h.667q.55 0 .941.392.392.391.392.941v2q0 .55-.392.942a1.28 1.28 0 0 1-.941.392H10q-.55 0-.942-.392a1.28 1.28 0 0 1-.391-.942v-2q0-.55.391-.941Q9.45 10 10 10h.667V8.667H5.333V10H6q.55 0 .942.392.39.391.391.941v2q0 .55-.391.942a1.28 1.28 0 0 1-.942.392H3.333q-.55 0-.941-.392A1.28 1.28 0 0 1 2 13.333m4.667-8.666h2.666v-2H6.667zm-3.334 8.666H6v-2H3.333zm6.667 0h2.667v-2H10z"
        />
    </IconBase>
);
export default NetworkOutlineIcon;
