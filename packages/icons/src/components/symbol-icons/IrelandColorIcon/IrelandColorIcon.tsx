import IconBase, { type IconProps } from '~/components/icon-base';

const IrelandColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1285"
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
        <g mask="url(#mask0_9214_1285)">
            <path d="M3.95983 0H-3.83838V16H3.95983V0Z" fill="#169B62" />
            <path d="M19.5545 0H11.7563V16H19.5545V0Z" fill="#FF883E" />
            <path d="M11.7582 0H3.95996V16H11.7582V0Z" fill="white" />
        </g>
    </IconBase>
);

export default IrelandColorIcon;
