import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const CubaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-CubaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-CubaColorIcon__a)">
            <path fill="#fff" d="M30.415 3.2h-32v3.2h32zm0 6.4h-32v3.2h32z" />
            <path fill="#002A8F" d="M30.415 0h-32v3.2h32zm0 6.4h-32v3.2h32zm0 6.4h-32V16h32z" />
            <path
                fill="#CF142B"
                fillRule="evenodd"
                d="m-1.585 16 13.72-8-13.72-8z"
                clipRule="evenodd"
            />
            <path
                fill="#fff"
                fillRule="evenodd"
                d="m3.565 7.275-.527-1.62-.525 1.62H.807l1.378 1.001-.525 1.622 1.378-1.002 1.38 1.002-.527-1.622 1.38-1.001z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default CubaColorIcon;
