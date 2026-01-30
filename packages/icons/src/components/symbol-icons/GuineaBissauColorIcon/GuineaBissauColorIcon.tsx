import IconBase, { type IconProps } from '~/components/icon-base';

const GuineaBissauColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1251"
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
        <g mask="url(#mask0_9214_1251)">
            <path d="M29.5982 0H8.21635V8H29.5982V0Z" fill="#FCD116" />
            <path d="M29.5981 8H8.21631V16H29.5981V8Z" fill="#009E49" />
            <path d="M-2.40186 0V8V16H8.25812V8V0H-2.40186Z" fill="#CE1126" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.92738 5.36365L3.51829 7.18365H5.43093L3.8837 8.30728L4.47461 10.1273L2.92738 9.00365L1.37828 10.1273L1.96919 8.30728L0.421875 7.18365H2.33461L2.92738 5.36365Z"
                fill="black"
            />
        </g>
    </IconBase>
);

export default GuineaBissauColorIcon;
