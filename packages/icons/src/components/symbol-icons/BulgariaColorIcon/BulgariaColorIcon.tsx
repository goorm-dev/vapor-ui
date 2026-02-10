import IconBase, { type IconProps } from '~/components/icon-base';

const BulgariaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1308"
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
        <g mask="url(#mask0_9214_1308)">
            <path d="M21.0926 0.0982056H-5.37646V5.52366H21.0926V0.0982056Z" fill="white" />
            <path
                d="M8 16.1818C3.48909 16.1818 -0.181818 12.5109 -0.181818 7.99999C-0.181818 3.48909 3.48909 -0.181824 8 -0.181824C12.5109 -0.181824 16.1818 3.48909 16.1818 7.99999C16.1818 12.5109 12.5109 16.1818 8 16.1818ZM8 0.181813C3.68909 0.181813 0.181818 3.68909 0.181818 7.99999C0.181818 12.3109 3.68909 15.8182 8 15.8182C12.3109 15.8182 15.8182 12.3109 15.8182 7.99999C15.8182 3.68909 12.3109 0.181813 8 0.181813Z"
                fill="#F2F2F0"
            />
            <path d="M21.1927 5.3327H-5.47461V10.6654H21.1927V5.3327Z" fill="#00966E" />
            <path d="M21.1927 10.6673H-5.47461V16H21.1927V10.6673Z" fill="#D62612" />
        </g>
    </IconBase>
);

export default BulgariaColorIcon;
