import IconBase, { type IconProps } from '~/components/icon-base';

const JamaicaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1432"
            style={{ maskType: 'luminance' }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="16"
            height="16"
        >
            <path
                d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
                fill="white"
            />
        </mask>
        <g mask="url(#mask0_9214_1432)">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M-8 14.5091L4.91455 8.0509L-8 1.59271V14.5091Z"
                fill="#2D2926"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M24 14.5091V1.59271L11.0854 8.0509L24 14.5091Z"
                fill="#2D2926"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 6.50909L21.0182 0H-5.01818L8 6.50909Z"
                fill="#007749"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M-4.81285 16H20.8126L7.99987 9.59271L-4.81285 16Z"
                fill="#007749"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 6.50909L-5.01818 0H-8V1.59273L4.91455 8.05091L-8 14.5091V16H-4.81272L8 9.59273L20.8127 16H24V14.5091L11.0854 8.05091L24 1.59273V0H21.0182L8 6.50909Z"
                fill="#FFB81C"
            />
        </g>
    </IconBase>
);

export default JamaicaColorIcon;
