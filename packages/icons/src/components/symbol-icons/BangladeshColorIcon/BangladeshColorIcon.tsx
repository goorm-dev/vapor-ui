import IconBase, { type IconProps } from '~/components/icon-base';

const BangladeshColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1360"
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
        <g mask="url(#mask0_9214_1360)">
            <path d="M22.6473 0H-4.01997V16H22.6473V0Z" fill="#006A4E" />
            <path
                d="M8.01277 13.2418C10.9077 13.2418 13.2546 10.895 13.2546 7.99999C13.2546 5.10502 10.9077 2.75818 8.01277 2.75818C5.11779 2.75818 2.77094 5.10502 2.77094 7.99999C2.77094 10.895 5.11779 13.2418 8.01277 13.2418Z"
                fill="#F42A41"
            />
        </g>
    </IconBase>
);

export default BangladeshColorIcon;
