import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const KuwaitColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-KuwaitColorIcon__a"
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
        <g mask="url(#vapor-icons-color-KuwaitColorIcon__a)">
            <path fill="#007A3D" d="M32 0H0v5.333h32z" />
            <path fill="#fff" d="M32 5.333H0v5.333h32z" />
            <path fill="#CE1126" d="M32 10.667H0V16h32z" />
            <path fill="#000" d="M0 5.333V16l8-5.333V5.333L0 0z" />
        </g>
    </IconBase>
);
export default KuwaitColorIcon;
