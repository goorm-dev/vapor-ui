import IconBase, { type IconProps } from '~/components/icon-base';

const TogoColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1408"
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
        <g mask="url(#mask0_9214_1408)">
            <path d="M25.8909 0H9.59998V3.2H25.8909V0Z" fill="#006A4E" />
            <path d="M25.891 3.20001H9.6001V6.40002H25.891V3.20001Z" fill="#FFCE00" />
            <path d="M25.891 6.39996H9.6001V9.59996H25.891V6.39996Z" fill="#006A4E" />
            <path d="M0 9.60004V12.8H25.8909V9.60004H9.59997H0Z" fill="#FFCE00" />
            <path d="M25.8909 12.8H0V16H25.8909V12.8Z" fill="#006A4E" />
            <path d="M9.59996 6.4V3.2V0H0V3.2V6.4V9.6H9.59996V6.4Z" fill="#D21034" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.80012 1.85815L5.46373 3.89634H7.60738L5.87283 5.15634L6.53467 7.19634L4.80012 5.93453L3.06556 7.19634L3.72918 5.15634L1.99463 3.89634H4.13827L4.80012 1.85815Z"
                fill="white"
            />
        </g>
    </IconBase>
);

export default TogoColorIcon;
