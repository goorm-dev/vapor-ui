import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SudanColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-SudanColorIcon__a"
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
        <g mask="url(#vapor-icons-color-SudanColorIcon__a)">
            <path fill="#D21034" d="m0 0 7.12 5.333H32V0z" />
            <path fill="#fff" d="m10.68 8-3.56 2.667H32V5.333H7.12z" />
            <path fill="#000" d="M0 16h32v-5.333H7.12z" />
            <path fill="#007229" d="M10.68 8 7.12 5.333 0 0v16l7.12-5.333z" />
        </g>
    </IconBase>
);
export default SudanColorIcon;
