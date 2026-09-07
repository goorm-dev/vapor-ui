import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const MyanmarColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-MyanmarColorIcon__a"
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
        <g mask="url(#vapor-icons-color-MyanmarColorIcon__a)">
            <path fill="#FECB00" d="M20 0H-4v5.367h24z" />
            <path fill="#EA2839" d="M20 10.633H-4V16h24z" />
            <path fill="#34B233" d="M20 5.367H-4v5.264h24z" />
            <path
                fill="#fff"
                d="m8 2.61 1.338 4.117h4.33l-3.503 2.546 1.337 4.116L8 10.846l-3.502 2.543 1.337-4.116-3.502-2.546h4.329z"
            />
        </g>
    </IconBase>
);
export default MyanmarColorIcon;
