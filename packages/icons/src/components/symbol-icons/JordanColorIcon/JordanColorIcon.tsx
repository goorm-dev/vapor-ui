import IconBase, { type IconProps } from '~/components/icon-base';

const JordanColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1316"
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
        <g mask="url(#mask0_9214_1316)">
            <path d="M28.7709 0H-3.2291V5.33272H28.7709V0Z" fill="black" />
            <path d="M28.7709 5.3327H-3.2291V10.6654H28.7709V5.3327Z" fill="white" />
            <path d="M28.7709 10.6673H-3.2291V16H28.7709V10.6673Z" fill="#007A3D" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M-3.2291 0V16L12.8564 8L-3.2291 0Z"
                fill="#CE1126"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.71459 6.86725L1.96184 7.49269L2.60366 7.29634L2.26914 7.87815L2.82183 8.25816L2.15821 8.35815L2.20731 9.02907L1.71459 8.5727L1.22187 9.02907L1.27092 8.35815L0.6073 8.25816L1.16003 7.87815L0.825473 7.29634L1.4673 7.49269L1.71459 6.86725Z"
                fill="white"
            />
        </g>
    </IconBase>
);

export default JordanColorIcon;
