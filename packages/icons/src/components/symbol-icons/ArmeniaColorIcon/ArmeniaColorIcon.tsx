import IconBase, { type IconProps } from '~/components/icon-base';

const ArmeniaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1365"
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
        <g mask="url(#mask0_9214_1365)">
            <path d="M23.8582 0H-8.14182V5.33273H23.8582V0Z" fill="#D90012" />
            <path d="M23.8582 5.3327H-8.14182V10.6654H23.8582V5.3327Z" fill="#0033A0" />
            <path d="M23.8582 10.6673H-8.14182V16H23.8582V10.6673Z" fill="#F2A800" />
        </g>
    </IconBase>
);

export default ArmeniaColorIcon;
