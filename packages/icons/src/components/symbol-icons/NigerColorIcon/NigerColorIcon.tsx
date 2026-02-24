import IconBase, { type IconProps } from '~/components/icon-base';

const NigerColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1371"
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
        <g mask="url(#mask0_9214_1371)">
            <path d="M19.8601 -2.16547H-3.85986V4.6109H19.8601V-2.16547Z" fill="#E05206" />
            <path d="M19.8601 4.61084H-3.85986V11.3872H19.8601V4.61084Z" fill="white" />
            <path d="M19.8601 11.389H-3.85986V18.1654H19.8601V11.389Z" fill="#0DB02B" />
            <path
                d="M8.00022 10.8854C9.59381 10.8854 10.8856 9.59355 10.8856 7.99996C10.8856 6.40636 9.59381 5.1145 8.00022 5.1145C6.40663 5.1145 5.11475 6.40636 5.11475 7.99996C5.11475 9.59355 6.40663 10.8854 8.00022 10.8854Z"
                fill="#E05206"
            />
        </g>
    </IconBase>
);

export default NigerColorIcon;
