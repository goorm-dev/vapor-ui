import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ThailandColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-ThailandColorIcon__a"
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
        <g mask="url(#vapor-icons-color-ThailandColorIcon__a)">
            <path fill="#A51931" d="M20 13.318H-4V16h24zM20 0H-4v2.682h24z" />
            <path fill="#fff" d="M20 10.642H-4v2.676h24zm0-7.96H-4v2.676h24z" />
            <path fill="#2D2A4A" d="M20 5.358H-4v5.282h24z" />
        </g>
    </IconBase>
);
export default ThailandColorIcon;
