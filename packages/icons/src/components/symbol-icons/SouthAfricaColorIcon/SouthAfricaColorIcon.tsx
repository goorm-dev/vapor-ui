import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SouthAfricaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-SouthAfricaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-SouthAfricaColorIcon__a)">
            <path
                fill="#000"
                fillRule="evenodd"
                d="m3.025 9.624-1.598 1.065-3.218 2.146v-9.66L1.414 5.31l1.597 1.065 2.442 1.628z"
                clipRule="evenodd"
            />
            <path
                fill="#E1392D"
                fillRule="evenodd"
                d="M22.21 0v5.31H10.97L3.004 0z"
                clipRule="evenodd"
            />
            <path
                fill="#000C8A"
                fillRule="evenodd"
                d="M22.209 10.69V16H3.019l7.963-5.31z"
                clipRule="evenodd"
            />
            <path
                fill="#FFB915"
                d="m7.296 8.004-2.44-1.628-6.647-4.432v1.23l3.205 2.137 1.597 1.065 2.442 1.628-2.428 1.62-1.598 1.065-3.218 2.146v1.23l6.66-4.441z"
            />
            <path
                fill="#fff"
                d="M10.97 5.31 3.004 0H1.11l9.562 6.376H22.21V5.311zm-.287 4.314L1.122 16h1.896l7.964-5.31h11.227V9.623z"
            />
            <path
                fill="#007847"
                d="M10.67 6.376 1.11 0h-2.9v1.944l6.647 4.432 2.44 1.628-2.427 1.62-6.66 4.442V16h2.913l9.562-6.376H22.21V6.376z"
            />
        </g>
    </IconBase>
);
export default SouthAfricaColorIcon;
