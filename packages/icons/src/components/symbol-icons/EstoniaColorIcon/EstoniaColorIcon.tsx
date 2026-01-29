import IconBase, { type IconProps } from '~/components/icon-base';

const EstoniaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1298"
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
        <g mask="url(#mask0_9214_1298)">
            <path d="M20.4128 10.4146H-4.69629V15.9782H20.4128V10.4146Z" fill="white" />
            <path
                d="M7.99999 16.1818C3.48909 16.1818 -0.181824 12.5109 -0.181824 7.99999C-0.181824 3.48909 3.48909 -0.181824 7.99999 -0.181824C12.5109 -0.181824 16.1818 3.48909 16.1818 7.99999C16.1818 12.5109 12.5109 16.1818 7.99999 16.1818ZM7.99999 0.181813C3.68909 0.181813 0.181813 3.68909 0.181813 7.99999C0.181813 12.3109 3.68909 15.8182 7.99999 15.8182C12.3109 15.8182 15.8182 12.3109 15.8182 7.99999C15.8182 3.68909 12.3109 0.181813 7.99999 0.181813Z"
                fill="#F2F2F0"
            />
            <path d="M20.4128 0H-4.69629V5.32546H20.4128V0Z" fill="#0072CE" />
            <path d="M20.4128 5.32544H-4.69629V10.6509H20.4128V5.32544Z" fill="black" />
        </g>
    </IconBase>
);

export default EstoniaColorIcon;
