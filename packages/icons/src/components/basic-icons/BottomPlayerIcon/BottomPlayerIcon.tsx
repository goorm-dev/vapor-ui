import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const BottomPlayerIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M7.333 11.333H12a.65.65 0 0 0 .475-.191.65.65 0 0 0 .191-.476V8a.65.65 0 0 0-.191-.475.65.65 0 0 0-.475-.192H7.333a.65.65 0 0 0-.475.192.65.65 0 0 0-.192.475v2.666q0 .285.192.476a.65.65 0 0 0 .475.191m-4.667 2q-.55 0-.941-.392A1.28 1.28 0 0 1 1.333 12V4q0-.55.392-.942.391-.39.941-.391h10.667q.55 0 .942.391.39.392.391.942v8q0 .55-.391.941a1.28 1.28 0 0 1-.942.392z"
        />
    </IconBase>
);
export default BottomPlayerIcon;
