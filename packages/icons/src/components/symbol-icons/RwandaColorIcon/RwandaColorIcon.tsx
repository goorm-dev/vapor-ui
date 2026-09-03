import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const RwandaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-RwandaColorIcon__a"
            width={16}
            height={16}
            x={0}
            y={0}
            maskUnits="userSpaceOnUse"
            style={{
                maskType: 'luminance',
            }}
        >
            <path fill="#fff" d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
        </mask>
        <g mask="url(#vapor-icons-color-RwandaColorIcon__a)">
            <path fill="#20603D" d="M16 11.97H-8V16h24z" />
            <path fill="#00A1DE" d="M16 0H-8v7.982h24z" />
            <path fill="#FAD201" d="M16 7.982H-8v3.987h24z" />
            <path
                fill="#E5BE01"
                d="m11.702 1.758.1 1.658.525-1.576-.333 1.627.917-1.385-.744 1.485 1.244-1.102-1.102 1.244 1.485-.744-1.385.917 1.627-.333-1.576.526 1.658.1-1.658.1 1.576.525-1.627-.333 1.385.915-1.485-.742 1.102 1.242-1.244-1.102.744 1.487-.917-1.387.333 1.627-.525-1.574-.1 1.658-.1-1.658-.526 1.574.333-1.627-.915 1.387.742-1.487-1.242 1.102 1.102-1.242-1.485.742 1.385-.915L9.37 4.8l1.574-.525-1.656-.1 1.656-.1-1.574-.526 1.627.333-1.385-.917 1.485.744-1.102-1.244 1.242 1.102-.742-1.485.915 1.385-.333-1.627.526 1.576z"
            />
            <path fill="#00A1DE" d="M11.702 4.975a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6" />
            <path fill="#E5BE01" d="M11.702 4.895a.72.72 0 1 0 0-1.44.72.72 0 0 0 0 1.44" />
        </g>
    </IconBase>
);
export default RwandaColorIcon;
