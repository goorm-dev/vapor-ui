import IconBase, { type IconProps } from '~/components/icon-base';

const ThailandColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1328"
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
        <g mask="url(#mask0_9214_1328)">
            <path d="M20 13.3182H-4V16H20V13.3182Z" fill="#A51931" />
            <path d="M20 0H-4V2.68182H20V0Z" fill="#A51931" />
            <path d="M20 10.6418H-4V13.3182H20V10.6418Z" fill="white" />
            <path d="M20 2.68182H-4V5.35819H20V2.68182Z" fill="white" />
            <path d="M20 5.35815H-4V10.64H20V5.35815Z" fill="#2D2A4A" />
        </g>
    </IconBase>
);

export default ThailandColorIcon;
