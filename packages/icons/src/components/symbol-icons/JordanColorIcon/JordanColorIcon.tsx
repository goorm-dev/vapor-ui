import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const JordanColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-JordanColorIcon__a"
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
        <g mask="url(#vapor-icons-color-JordanColorIcon__a)">
            <path fill="#000" d="M28.77 0h-32v5.333h32z" />
            <path fill="#fff" d="M28.77 5.333h-32v5.332h32z" />
            <path fill="#007A3D" d="M28.77 10.667h-32V16h32z" />
            <path fill="#CE1126" fillRule="evenodd" d="M-3.23 0v16l16.086-8z" clipRule="evenodd" />
            <path
                fill="#fff"
                fillRule="evenodd"
                d="m1.715 6.867.247.626.642-.197-.335.582.553.38-.664.1.05.671-.493-.456-.493.456.049-.67-.664-.1.553-.38-.335-.583.642.197z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default JordanColorIcon;
