import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const PlusOutlineIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M7.334 8.667H4a.65.65 0 0 1-.475-.192A.65.65 0 0 1 3.334 8q0-.283.191-.475A.65.65 0 0 1 4 7.333h3.334V4q0-.283.191-.475A.65.65 0 0 1 8 3.333q.283 0 .475.192A.65.65 0 0 1 8.667 4v3.333H12q.284 0 .475.192a.65.65 0 0 1 .192.475.65.65 0 0 1-.192.475.65.65 0 0 1-.475.192H8.667V12a.65.65 0 0 1-.192.475.65.65 0 0 1-.475.192.65.65 0 0 1-.475-.192.65.65 0 0 1-.192-.475z"
        />
    </IconBase>
);
export default PlusOutlineIcon;
