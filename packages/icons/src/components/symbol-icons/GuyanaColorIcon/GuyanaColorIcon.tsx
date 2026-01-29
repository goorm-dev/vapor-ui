import IconBase, { type IconProps } from '~/components/icon-base';

const GuyanaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1373"
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
        <g mask="url(#mask0_9214_1373)">
            <path d="M24.1035 0H-2.56372V16H24.1035V0Z" fill="#009F47" />
            <path d="M-2.56372 16L24.1035 8.04181L-2.56372 0V16Z" fill="white" />
            <path d="M-2.56372 15.3564L21.7163 8.04183L-2.56372 0.643646V15.3564Z" fill="#FCD20F" />
            <path d="M-2.56372 16L10.6981 8.04545L-2.56372 0V16Z" fill="black" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M-2.56372 15.1055L9.19809 8.04548L-2.56372 0.916382V15.1055Z"
                fill="#CF0921"
            />
        </g>
    </IconBase>
);

export default GuyanaColorIcon;
