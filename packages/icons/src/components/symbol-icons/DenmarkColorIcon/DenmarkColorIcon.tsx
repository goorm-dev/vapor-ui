import IconBase, { type IconProps } from '~/components/icon-base';

const DenmarkColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1299"
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
        <g mask="url(#mask0_9214_1299)">
            <path d="M7.54359 0L7.55451 6.85818H19.5764V0H7.54359Z" fill="#C8102E" />
            <path d="M19.5762 9.12726H7.54346V16H19.5762V9.12726Z" fill="#C8102E" />
            <path d="M5.28533 0H-1.56738V6.85818H5.29625L5.28533 0Z" fill="#C8102E" />
            <path d="M5.28533 9.12726H-1.56738V16H5.28533V9.12726Z" fill="#C8102E" />
            <path
                d="M7.5435 0H5.28533L5.29625 6.85818H-1.56738V9.12728H5.28533V16H7.5435V9.12728H19.5763V6.85818H7.55442L7.5435 0Z"
                fill="white"
            />
        </g>
    </IconBase>
);

export default DenmarkColorIcon;
