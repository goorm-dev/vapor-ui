import IconBase, { type IconProps } from '~/components/icon-base';

const MauritiusColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1271"
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
        <g mask="url(#mask0_9214_1271)">
            <path d="M20 0H-4V4H20V0Z" fill="#EA2839" />
            <path d="M20 4H-4V8H20V4Z" fill="#1A206D" />
            <path d="M20 8H-4V12H20V8Z" fill="#FFD500" />
            <path d="M20 12H-4V16H20V12Z" fill="#00A551" />
        </g>
    </IconBase>
);

export default MauritiusColorIcon;
