import IconBase, { type IconProps } from '~/components/icon-base';

const FranceColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1312"
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
        <g mask="url(#mask0_9214_1312)">
            <path d="M4.71289 0H-1.57617V16H4.71289V0Z" fill="#002654" />
            <path d="M11.0018 0H4.71272V16H11.0018V0Z" fill="white" />
            <path d="M17.2927 0H11.0036V16H17.2927V0Z" fill="#CE1126" />
        </g>
    </IconBase>
);

export default FranceColorIcon;
