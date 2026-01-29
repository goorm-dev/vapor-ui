import IconBase, { type IconProps } from '~/components/icon-base';

const MaliColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1275"
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
        <g mask="url(#mask0_9214_1275)">
            <path d="M4.38192 0H-2.85449V16H4.38192V0Z" fill="#14B53A" />
            <path d="M11.6182 0H4.38184V16H11.6182V0Z" fill="#FCD116" />
            <path d="M18.8545 0H11.6182V16H18.8545V0Z" fill="#CE1126" />
        </g>
    </IconBase>
);

export default MaliColorIcon;
