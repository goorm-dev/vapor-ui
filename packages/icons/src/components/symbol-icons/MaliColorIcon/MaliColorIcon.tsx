import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const MaliColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-MaliColorIcon__a"
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
        <g mask="url(#vapor-icons-color-MaliColorIcon__a)">
            <path fill="#14B53A" d="M4.382 0h-7.236v16h7.236z" />
            <path fill="#FCD116" d="M11.618 0H4.382v16h7.236z" />
            <path fill="#CE1126" d="M18.855 0h-7.237v16h7.237z" />
        </g>
    </IconBase>
);
export default MaliColorIcon;
