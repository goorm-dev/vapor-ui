import IconBase, { type IconProps } from '~/components/icon-base';

const BeninColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1268"
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
        <g mask="url(#mask0_9214_1268)">
            <path d="M20 0H5.61087V8H20V0Z" fill="#FCD116" />
            <path d="M20 8H5.61084V16H20V8Z" fill="#E8112D" />
            <path d="M5.61088 0H-4V8V16H5.61088V8V0Z" fill="#008751" />
        </g>
    </IconBase>
);

export default BeninColorIcon;
