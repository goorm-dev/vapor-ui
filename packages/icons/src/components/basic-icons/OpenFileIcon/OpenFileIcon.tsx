import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const OpenFileIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M4 14.667q-.55 0-.942-.392a1.28 1.28 0 0 1-.391-.942V2.667q0-.55.391-.942.392-.392.942-.392h4.783a1.32 1.32 0 0 1 .934.384L12.95 4.95q.183.183.283.425.1.241.1.508v7.45q0 .55-.392.942a1.28 1.28 0 0 1-.941.392zm4.666-9.334q0 .284.192.475A.65.65 0 0 0 9.333 6H12L8.666 2.667z"
        />
    </IconBase>
);
export default OpenFileIcon;
