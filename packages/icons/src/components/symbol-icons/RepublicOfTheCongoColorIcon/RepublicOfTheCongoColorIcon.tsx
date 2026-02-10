import IconBase, { type IconProps } from '~/components/icon-base';

const RepublicOfTheCongoColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1258"
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
        <g mask="url(#mask0_9214_1258)">
            <path d="M4 16H20V0L4 16Z" fill="#DA1A35" />
            <path d="M12 0L-4 16H4L20 0H12Z" fill="#FBDE4A" />
            <path d="M-4 0V16L12 0H-4Z" fill="#009543" />
        </g>
    </IconBase>
);

export default RepublicOfTheCongoColorIcon;
