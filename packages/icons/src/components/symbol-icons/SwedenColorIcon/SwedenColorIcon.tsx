import IconBase, { type IconProps } from '~/components/icon-base';

const SwedenColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1403"
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
        <g mask="url(#mask0_9214_1403)">
            <path d="M4.75835 9.58911H-3.22168V16H4.75835V9.58911Z" fill="#006AA7" />
            <path d="M4.75835 0H-3.22168V6.41091H4.75835V0Z" fill="#006AA7" />
            <path d="M22.3784 9.58911H7.93652V16H22.3784V9.58911Z" fill="#006AA7" />
            <path d="M22.3782 0H7.93635V6.41091H22.3782V0Z" fill="#006AA7" />
            <path
                d="M7.93652 0H4.75835V6.41091H-3.22168V9.58909H4.75835V16H7.93652V9.58909H22.3784V6.41091H7.93652V0Z"
                fill="#FECC00"
            />
        </g>
    </IconBase>
);

export default SwedenColorIcon;
