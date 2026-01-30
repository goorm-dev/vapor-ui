import IconBase, { type IconProps } from '~/components/icon-base';

const SudanColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1359"
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
        <g mask="url(#mask0_9214_1359)">
            <path d="M0 0L7.11994 5.33273H32V0H0Z" fill="#D21034" />
            <path
                d="M10.6801 8.00003L7.12012 10.6673H32.0002V5.33276H7.12012L10.6801 8.00003Z"
                fill="white"
            />
            <path d="M0 16H32V10.6672H7.11994L0 16Z" fill="black" />
            <path
                d="M10.68 8L7.11994 5.33273L0 0V5.33273V10.6673V16L7.11994 10.6673L10.68 8Z"
                fill="#007229"
            />
        </g>
    </IconBase>
);

export default SudanColorIcon;
