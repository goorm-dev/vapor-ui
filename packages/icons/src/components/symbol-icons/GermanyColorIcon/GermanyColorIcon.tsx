import IconBase, { type IconProps } from '~/components/icon-base';

const GermanyColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1301"
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
        <g mask="url(#mask0_9214_1301)">
            <path d="M21.1927 0H-5.47461V5.33273H21.1927V0Z" fill="black" />
            <path d="M21.1927 5.3327H-5.47461V10.6654H21.1927V5.3327Z" fill="#D00000" />
            <path d="M21.1927 10.6673H-5.47461V16H21.1927V10.6673Z" fill="#FFCE00" />
        </g>
    </IconBase>
);

export default GermanyColorIcon;
