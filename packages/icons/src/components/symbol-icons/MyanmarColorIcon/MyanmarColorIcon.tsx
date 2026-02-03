import IconBase, { type IconProps } from '~/components/icon-base';

const MyanmarColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1368"
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
        <g mask="url(#mask0_9214_1368)">
            <path d="M20 0H-4V5.36728H20V0Z" fill="#FECB00" />
            <path d="M20 10.6328H-4V16H20V10.6328Z" fill="#EA2839" />
            <path d="M20 5.36728H-4V10.6309H20V5.36728Z" fill="#34B233" />
            <path
                d="M7.99998 2.6109L9.33816 6.72727H13.6673L10.1654 9.27272L11.5018 13.3891L7.99998 10.8455L4.49816 13.3891L5.83452 9.27272L2.3327 6.72727H6.6618L7.99998 2.6109Z"
                fill="white"
            />
        </g>
    </IconBase>
);

export default MyanmarColorIcon;
