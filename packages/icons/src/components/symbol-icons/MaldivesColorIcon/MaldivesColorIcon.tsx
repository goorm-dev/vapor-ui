import IconBase, { type IconProps } from '~/components/icon-base';

const MaldivesColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1411"
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
        <g mask="url(#mask0_9214_1411)">
            <path d="M20 0H-4V16H20V0Z" fill="#D30731" />
            <path d="M16.0127 4.02905H-0.0127411V11.9709H16.0127V4.02905Z" fill="#007F37" />
            <path
                d="M7.35818 8.11271C7.35818 6.72907 8.37636 5.58544 9.70363 5.38544C9.56727 5.36544 9.42908 5.35089 9.28726 5.35089C7.76181 5.35089 6.52364 6.58726 6.52364 8.11453C6.52364 9.6418 7.75999 10.8782 9.28726 10.8782C9.42908 10.8782 9.56727 10.8636 9.70363 10.8436C8.37636 10.6418 7.35818 9.49999 7.35818 8.11635V8.11271Z"
                fill="white"
            />
        </g>
    </IconBase>
);

export default MaldivesColorIcon;
