import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ChadColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-ChadColorIcon__a"
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
        <g mask="url(#vapor-icons-color-ChadColorIcon__a)">
            <path fill="#002164" d="M4.636 0H-2.09v16h6.727z" />
            <path fill="#FECC00" d="M11.364 0H4.636v16h6.728z" />
            <path fill="#C7042C" d="M18.09 0h-6.726v16h6.727z" />
        </g>
    </IconBase>
);
export default ChadColorIcon;
