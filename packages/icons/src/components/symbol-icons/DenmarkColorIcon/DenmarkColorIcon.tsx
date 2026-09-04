import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const DenmarkColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-DenmarkColorIcon__a"
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
        <g mask="url(#vapor-icons-color-DenmarkColorIcon__a)">
            <path
                fill="#C8102E"
                d="m7.544 0 .01 6.858h12.022V0zm12.032 9.127H7.543V16h12.033zM5.285 0h-6.852v6.858h6.863zm0 9.127h-6.852V16h6.852z"
            />
            <path
                fill="#fff"
                d="M7.544 0h-2.26l.011 6.858h-6.863v2.27h6.852V16h2.258V9.127h12.033V6.858H7.554z"
            />
        </g>
    </IconBase>
);
export default DenmarkColorIcon;
