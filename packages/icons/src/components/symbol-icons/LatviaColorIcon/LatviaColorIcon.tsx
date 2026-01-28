import IconBase, { type IconProps } from '~/components/icon-base';

const LatviaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1302"
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
        <g mask="url(#mask0_9214_1302)">
            <path d="M23.8581 0H-8.14188V6.41637H23.8581V0Z" fill="#9E3039" />
            <path d="M23.8581 9.58362H-8.14188V16H23.8581V9.58362Z" fill="#9E3039" />
            <path d="M23.8581 6.41638H-8.14188V9.58546H23.8581V6.41638Z" fill="white" />
        </g>
    </IconBase>
);

export default LatviaColorIcon;
