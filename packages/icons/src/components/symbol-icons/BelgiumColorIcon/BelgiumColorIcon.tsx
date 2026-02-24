import IconBase, { type IconProps } from '~/components/icon-base';

const BelgiumColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1309"
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
        <g mask="url(#mask0_9214_1309)">
            <path d="M4.93435 0H-1.22021V16H4.93435V0Z" fill="black" />
            <path d="M11.0891 0H4.93457V16H11.0891V0Z" fill="#FDDA25" />
            <path d="M17.2437 0H11.0891V16H17.2437V0Z" fill="#EF3340" />
        </g>
    </IconBase>
);

export default BelgiumColorIcon;
