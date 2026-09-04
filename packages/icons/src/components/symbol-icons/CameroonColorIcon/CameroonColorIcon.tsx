import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const CameroonColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-CameroonColorIcon__a"
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
        <g mask="url(#vapor-icons-color-CameroonColorIcon__a)">
            <path fill="#007A5E" d="M4 0h-8v16h8z" />
            <path fill="#CE1126" d="M12 0H4v16h8z" />
            <path fill="#FCD116" d="M20 0h-8v16h8z" />
            <path
                fill="#FCD20F"
                fillRule="evenodd"
                d="m7.998 5.876.477 1.466h1.541l-1.247.907.477 1.466-1.248-.906-1.247.906.476-1.466-1.247-.907h1.542z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default CameroonColorIcon;
