import IconBase, { type IconProps } from '~/components/icon-base';

const GuineaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1252"
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
        <g mask="url(#mask0_9214_1252)">
            <path d="M4 0H-4V16H4V0Z" fill="#CF0921" />
            <path d="M12 0H4V16H12V0Z" fill="#FCD20F" />
            <path d="M20 0H12V16H20V0Z" fill="#009560" />
        </g>
    </IconBase>
);

export default GuineaColorIcon;
