import IconBase, { type IconProps } from '~/components/icon-base';

const CameroonColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1266"
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
        <g mask="url(#mask0_9214_1266)">
            <path d="M4 0H-4V16H4V0Z" fill="#007A5E" />
            <path d="M12 0H4V16H12V0Z" fill="#CE1126" />
            <path d="M20 0H12V16H20V0Z" fill="#FCD116" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.99818 5.87634L8.47457 7.3418H10.0164L8.76913 8.24907L9.24552 9.71452L7.99818 8.80907L6.75093 9.71452L7.22732 8.24907L5.97998 7.3418H7.5218L7.99818 5.87634Z"
                fill="#FCD20F"
            />
        </g>
    </IconBase>
);

export default CameroonColorIcon;
