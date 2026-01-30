import IconBase, { type IconProps } from '~/components/icon-base';

const UkraineColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1352"
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
        <g mask="url(#mask0_9214_1352)">
            <path d="M19.8582 0H-4.14182V8H19.8582V0Z" fill="#0057B8" />
            <path d="M19.8582 8H-4.14182V16H19.8582V8Z" fill="#FFD700" />
        </g>
    </IconBase>
);

export default UkraineColorIcon;
