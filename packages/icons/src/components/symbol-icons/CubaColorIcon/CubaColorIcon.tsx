import IconBase, { type IconProps } from '~/components/icon-base';

const CubaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1407"
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
        <g mask="url(#mask0_9214_1407)">
            <path d="M30.4146 3.20001H-1.58545V6.40002H30.4146V3.20001Z" fill="white" />
            <path d="M30.4146 9.6001H-1.58545V12.8001H30.4146V9.6001Z" fill="white" />
            <path d="M30.4146 0H-1.58545V3.2H30.4146V0Z" fill="#002A8F" />
            <path d="M30.4146 6.39996H-1.58545V9.59996H30.4146V6.39996Z" fill="#002A8F" />
            <path d="M30.4146 12.8H-1.58545V16H30.4146V12.8Z" fill="#002A8F" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M-1.58545 16L12.1346 8L-1.58545 0V16Z"
                fill="#CF142B"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.56543 7.27455L3.03816 5.65454L2.5127 7.27455H0.807251L2.18543 8.27637L1.65998 9.89818L3.03816 8.89636L4.41816 9.89818L3.89089 8.27637L5.27089 7.27455H3.56543Z"
                fill="white"
            />
        </g>
    </IconBase>
);

export default CubaColorIcon;
