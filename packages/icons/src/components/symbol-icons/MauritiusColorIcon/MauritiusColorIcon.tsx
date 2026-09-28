import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const MauritiusColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-MauritiusColorIcon__a"
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
        <g mask="url(#vapor-icons-color-MauritiusColorIcon__a)">
            <path fill="#EA2839" d="M20 0H-4v4h24z" />
            <path fill="#1A206D" d="M20 4H-4v4h24z" />
            <path fill="#FFD500" d="M20 8H-4v4h24z" />
            <path fill="#00A551" d="M20 12H-4v4h24z" />
        </g>
    </IconBase>
);
export default MauritiusColorIcon;
