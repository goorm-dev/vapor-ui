import IconBase, { type IconProps } from '~/components/icon-base';

const ChadColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1264"
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
        <g mask="url(#mask0_9214_1264)">
            <path d="M4.63645 0H-2.09082V16H4.63645V0Z" fill="#002164" />
            <path d="M11.3636 0H4.63635V16H11.3636V0Z" fill="#FECC00" />
            <path d="M18.0909 0H11.3636V16H18.0909V0Z" fill="#C7042C" />
        </g>
    </IconBase>
);

export default ChadColorIcon;
