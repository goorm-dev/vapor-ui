import IconBase, { type IconProps } from '~/components/icon-base';

const SomaliaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1273"
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
        <g mask="url(#mask0_9214_1273)">
            <path d="M20 0H-4V16H20V0Z" fill="#4189DD" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.00537 4.20001L8.85809 6.82911H11.6218L9.38721 8.45274L10.2399 11.08L8.00537 9.45638L5.76904 11.08L6.62354 8.45274L4.38721 6.82911H7.15088L8.00537 4.20001Z"
                fill="white"
            />
        </g>
    </IconBase>
);

export default SomaliaColorIcon;
