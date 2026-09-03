import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const CopyOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M6 12q-.55 0-.942-.392a1.28 1.28 0 0 1-.391-.941v-8q0-.55.391-.942T6 1.333h6q.55 0 .942.392.39.392.391.942v8q0 .55-.391.941A1.28 1.28 0 0 1 12 12zm0-1.333h6v-8H6zm-2.667 4q-.55 0-.941-.392A1.28 1.28 0 0 1 2 13.333V4.667q0-.285.192-.475A.65.65 0 0 1 2.667 4q.283 0 .475.192a.65.65 0 0 1 .191.475v8.666H10q.283 0 .475.192a.65.65 0 0 1 .192.475.65.65 0 0 1-.192.475.65.65 0 0 1-.475.192z"
        />
    </IconBase>
);
export default CopyOutlineIcon;
