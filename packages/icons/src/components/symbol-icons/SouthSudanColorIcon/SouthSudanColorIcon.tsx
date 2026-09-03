import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SouthSudanColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-SouthSudanColorIcon__a"
            width={16}
            height={16}
            x={0}
            y={0}
            maskUnits="userSpaceOnUse"
            style={{
                maskType: 'luminance',
            }}
        >
            <path fill="#fff" d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
        </mask>
        <g mask="url(#vapor-icons-color-SouthSudanColorIcon__a)">
            <path fill="#078930" d="M-1.178 16h32v-4.82H7.147z" />
            <path fill="#000" d="m-1.178 0 8.342 4.82h23.658V0z" />
            <path fill="#fff" d="M8.529 5.61h22.293v-.79H7.164zm-1.382 5.57h23.675v-.79H8.512z" />
            <path fill="#DA121A" d="m12.65 7.993-4.14 2.396h22.312V5.611H8.529z" />
            <path
                fill="#0F47AF"
                d="m8.51 10.39 4.14-2.397L8.53 5.61l-1.366-.79L-1.178 0v16l8.325-4.82z"
            />
            <path
                fill="#FCDD09"
                d="m5.576 9.558-1.83-.598-1.135 1.558.002-1.927-1.831-.598L2.614 7.4l.002-1.927 1.131 1.56L5.58 6.44 4.445 7.998z"
            />
        </g>
    </IconBase>
);
export default SouthSudanColorIcon;
