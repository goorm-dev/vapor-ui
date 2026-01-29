import IconBase, { type IconProps } from '~/components/icon-base';

const ItalyColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1293"
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
        <g mask="url(#mask0_9214_1293)">
            <path d="M3.85791 0H-4.14209V16H3.85791V0Z" fill="#008C45" />
            <path d="M11.8581 0H3.85813V16H11.8581V0Z" fill="#F4F5F0" />
            <path d="M19.8581 0H11.8581V16H19.8581V0Z" fill="#CD212A" />
        </g>
    </IconBase>
);

export default ItalyColorIcon;
