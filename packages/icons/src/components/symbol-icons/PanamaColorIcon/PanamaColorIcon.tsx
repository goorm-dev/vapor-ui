import IconBase, { type IconProps } from '~/components/icon-base';

const PanamaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1436"
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
        <g mask="url(#mask0_9214_1436)">
            <path d="M8 0H-4V8H8V0Z" fill="white" />
            <path d="M20 0H8V8H20V0Z" fill="#DB0A13" />
            <path d="M8 8H-4V16H8V8Z" fill="#011E56" />
            <path d="M20 8H8V16H20V8Z" fill="white" />
            <path
                d="M13.4127 11.0782L13.0855 10.0673L12.7564 11.0782H11.6927L12.5527 11.7019L12.2255 12.7128L13.0855 12.0891L13.9455 12.7128L13.6164 11.7019L14.4764 11.0782H13.4127Z"
                fill="#DB0A13"
            />
            <path
                d="M3.24367 4.29821L2.91458 3.28729L2.58731 4.29821H1.52368L2.38368 4.92184L2.05459 5.93276L2.91458 5.30911L3.77459 5.93276L3.44731 4.92184L4.30732 4.29821H3.24367Z"
                fill="#011E56"
            />
        </g>
    </IconBase>
);

export default PanamaColorIcon;
