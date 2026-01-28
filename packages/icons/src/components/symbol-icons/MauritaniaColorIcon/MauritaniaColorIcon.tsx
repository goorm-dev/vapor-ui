import IconBase, { type IconProps } from '~/components/icon-base';

const MauritaniaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1397"
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
        <g mask="url(#mask0_9214_1397)">
            <path d="M20 0H-4V3.2H20V0Z" fill="#D01C1F" />
            <path d="M20 12.8H-4V16H20V12.8Z" fill="#D01C1F" />
            <path d="M20 3.20001H-4V12.8H20V3.20001Z" fill="#00A95C" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.0272 5.43091C13.8472 8.65636 11.3999 11.2127 7.99991 11.2127C4.59991 11.2127 2.15266 8.65636 1.97266 5.43091C2.82175 8.13636 5.36173 9.58727 7.99991 9.58727C10.6381 9.58727 13.1781 8.13636 14.0272 5.43091Z"
                fill="#FFD700"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 4.80908L8.37633 5.96726H9.59455L8.60911 6.68364L8.98544 7.84L8 7.12544L7.01456 7.84L7.39089 6.68364L6.40723 5.96726H7.62358L8 4.80908Z"
                fill="#FFD700"
            />
        </g>
    </IconBase>
);

export default MauritaniaColorIcon;
