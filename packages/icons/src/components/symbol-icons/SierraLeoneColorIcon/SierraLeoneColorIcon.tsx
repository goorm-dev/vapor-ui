import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SierraLeoneColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-SierraLeoneColorIcon__a"
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
        <g mask="url(#vapor-icons-color-SierraLeoneColorIcon__a)">
            <path fill="#18B637" d="M20 0H-4v5.333h24z" />
            <path fill="#fff" d="M20 5.333H-4v5.333h24z" />
            <path fill="#0073C7" d="M20 10.667H-4V16h24z" />
        </g>
    </IconBase>
);
export default SierraLeoneColorIcon;
