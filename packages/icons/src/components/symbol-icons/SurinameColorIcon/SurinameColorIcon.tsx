import IconBase, { type IconProps } from '~/components/icon-base';

const SurinameColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1420"
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
        <g mask="url(#mask0_9214_1420)">
            <path d="M20 12.8582H-4V16H20V12.8582Z" fill="#377E3F" />
            <path d="M20 0H-4V3.14182H20V0Z" fill="#377E3F" />
            <path d="M20 11.1709H-4V12.8582H20V11.1709Z" fill="white" />
            <path d="M20 3.14185H-4V4.82911H20V3.14185Z" fill="white" />
            <path d="M20 4.8291H-4V11.1709H20V4.8291Z" fill="#B40A2D" />
            <path
                d="M8.72733 7.45456L8.02006 5.2782L7.31279 7.45456H5.02551L6.87642 8.80002L6.16915 10.9764L8.02006 9.63091L9.87279 10.9764L9.16551 8.80002L11.0164 7.45456H8.72733Z"
                fill="#ECC81D"
            />
        </g>
    </IconBase>
);

export default SurinameColorIcon;
