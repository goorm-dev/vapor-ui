import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const TurkeyColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-TurkeyColorIcon__a"
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
        <g mask="url(#vapor-icons-color-TurkeyColorIcon__a)">
            <path fill="#E30A17" d="M20.831 0h-24v16h24z" />
            <path
                fill="#fff"
                d="m10.135 7.225-.859-1.18v1.459l-1.387.45 1.387.451v1.459l.858-1.18 1.386.45-.856-1.18.856-1.18z"
            />
            <path
                fill="#fff"
                d="M2.553 7.964c0-1.768 1.449-3.2 3.236-3.2a3.24 3.24 0 0 1 2.193.85 4.009 4.009 0 1 0 0 4.698 3.24 3.24 0 0 1-2.193.852c-1.787 0-3.236-1.433-3.236-3.2"
            />
        </g>
    </IconBase>
);
export default TurkeyColorIcon;
