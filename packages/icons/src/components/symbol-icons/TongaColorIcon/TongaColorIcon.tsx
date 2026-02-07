import IconBase, { type IconProps } from '~/components/icon-base';

const TongaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1331"
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
        <g mask="url(#mask0_9214_1331)">
            <path d="M11.5073 0V8.00727H-1.80908V16H30.1909V0H11.5073Z" fill="#C20000" />
            <path d="M11.5091 0H-1.80908V8.00727H11.5091V0Z" fill="white" />
            <path d="M5.86186 0.994568H3.83643V7.01275H5.86186V0.994568Z" fill="#C20000" />
            <path d="M7.85829 2.99091H1.84009V5.01636H7.85829V2.99091Z" fill="#C20000" />
        </g>
    </IconBase>
);

export default TongaColorIcon;
