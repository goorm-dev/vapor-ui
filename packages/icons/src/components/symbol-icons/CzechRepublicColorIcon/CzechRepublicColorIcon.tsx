import IconBase, { type IconProps } from '~/components/icon-base';

const CzechRepublicColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1439"
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
        <g mask="url(#mask0_9214_1439)">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.90563 8.23451L-4.05078 0.18543V0.0908813H19.7674V8.23451H7.90563Z"
                fill="white"
            />
            <path
                d="M8 16.1818C3.48909 16.1818 -0.181816 12.5109 -0.181816 7.99999C-0.181816 3.48909 3.48909 -0.181824 8 -0.181824C12.5109 -0.181824 16.1818 3.48909 16.1818 7.99999C16.1818 12.5109 12.5109 16.1818 8 16.1818ZM8 0.181813C3.68909 0.181813 0.18182 3.68909 0.18182 7.99999C0.18182 12.3109 3.68909 15.8182 8 15.8182C12.3109 15.8182 15.8182 12.3109 15.8182 7.99999C15.8182 3.68909 12.3109 0.181813 8 0.181813Z"
                fill="#F2F2F0"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.87797 8H19.8579V16H-4.14209L7.87797 8Z"
                fill="#D7141A"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M-4.14209 0V16L7.87797 8L-4.14209 0Z"
                fill="#11457E"
            />
        </g>
    </IconBase>
);

export default CzechRepublicColorIcon;
