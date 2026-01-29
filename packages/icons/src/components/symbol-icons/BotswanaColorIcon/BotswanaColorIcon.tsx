import IconBase, { type IconProps } from '~/components/icon-base';

const BotswanaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1278"
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
        <g mask="url(#mask0_9214_1278)">
            <path d="M20 10.0109H-4V16H20V10.0109Z" fill="#6DA9D2" />
            <path d="M20 0H-4V5.98908H20V0Z" fill="#6DA9D2" />
            <path d="M20 5.98907H-4V6.6509H20V5.98907Z" fill="white" />
            <path d="M20 9.34912H-4V10.0109H20V9.34912Z" fill="white" />
            <path d="M20 6.65088H-4V9.34908H20V6.65088Z" fill="black" />
        </g>
    </IconBase>
);

export default BotswanaColorIcon;
