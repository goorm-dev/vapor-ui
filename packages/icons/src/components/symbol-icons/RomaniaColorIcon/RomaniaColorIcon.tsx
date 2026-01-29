import IconBase, { type IconProps } from '~/components/icon-base';

const RomaniaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1355"
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
        <g mask="url(#mask0_9214_1355)">
            <path d="M3.85812 0H-4.14188V16H3.85812V0Z" fill="#002B7F" />
            <path d="M11.8583 0H3.85834V16H11.8583V0Z" fill="#FCD116" />
            <path d="M19.8583 0H11.8583V16H19.8583V0Z" fill="#CE1126" />
        </g>
    </IconBase>
);

export default RomaniaColorIcon;
