import IconBase, { type IconProps } from '~/components/icon-base';

const VietnamColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1388"
            style={{ maskType: 'luminance' }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="16"
            height="16"
        >
            <path
                d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
                fill="white"
            />
        </mask>
        <g mask="url(#mask0_9214_1388)">
            <path d="M20 0H-4V16H20V0Z" fill="#DA251D" />
            <path
                d="M8.01456 3.12L9.10183 6.46363H12.6164L9.77273 8.52908L10.8582 11.8709L8.01456 9.80545L5.17276 11.8709L6.25821 8.52908L3.41455 6.46363H6.92911L8.01456 3.12Z"
                fill="#FFFF00"
            />
        </g>
    </IconBase>
);

export default VietnamColorIcon;
