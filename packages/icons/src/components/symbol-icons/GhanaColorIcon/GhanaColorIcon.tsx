import IconBase, { type IconProps } from '~/components/icon-base';

const GhanaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1393"
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
        <g mask="url(#mask0_9214_1393)">
            <path d="M20 0H-4V5.33273H20V0Z" fill="#CE1126" />
            <path d="M20 5.3327H-4V10.6654H20V5.3327Z" fill="#FCD116" />
            <path d="M20 10.6673H-4V16H20V10.6673Z" fill="#006B3F" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.00009 5.3291L8.66184 7.36547H10.8018L9.07093 8.62365L9.731 10.66L8.00009 9.40183L6.26918 10.66L6.92915 8.62365L5.19824 7.36547H7.33825L8.00009 5.3291Z"
                fill="black"
            />
        </g>
    </IconBase>
);

export default GhanaColorIcon;
