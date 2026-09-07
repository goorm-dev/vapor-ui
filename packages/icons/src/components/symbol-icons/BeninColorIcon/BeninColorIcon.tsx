import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const BeninColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-BeninColorIcon__a"
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
        <g mask="url(#vapor-icons-color-BeninColorIcon__a)">
            <path fill="#FCD116" d="M20 0H5.61v8H20z" />
            <path fill="#E8112D" d="M20 8H5.61v8H20z" />
            <path fill="#008751" d="M5.61 0H-4v16h9.61z" />
        </g>
    </IconBase>
);
export default BeninColorIcon;
