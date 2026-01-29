import IconBase, { type IconProps } from '~/components/icon-base';

const EastTimorColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1364"
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
        <g mask="url(#mask0_9214_1364)">
            <path d="M-1.08002 0L14.6545 8L-1.08002 16H30.92V0H-1.08002Z" fill="#DD1F19" />
            <path d="M-1.08002 0L9.41455 8L-1.08002 16L14.6545 8L-1.08002 0Z" fill="#FFC821" />
            <path d="M-1.08002 0V16L9.41455 8L-1.08002 0Z" fill="black" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.64906 9.12366L2.85634 8.73821L1.93453 10.3237L1.74725 8.50003L-0.0454712 8.11275L1.63271 7.37093L1.44543 5.5473L2.66906 6.91275L4.34544 6.17276L3.42543 7.75821L4.64906 9.12366Z"
                fill="white"
            />
        </g>
    </IconBase>
);

export default EastTimorColorIcon;
