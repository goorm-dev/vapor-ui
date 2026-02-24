import IconBase, { type IconProps } from '~/components/icon-base';

const NigeriaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1428"
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
        <g mask="url(#mask0_9214_1428)">
            <path d="M3.91455 0H-4.25635V16H3.91455V0Z" fill="#008850" />
            <path d="M12.0854 0H3.91452V16H12.0854V0Z" fill="white" />
            <path d="M20.2563 0H12.0854V16H20.2563V0Z" fill="#008850" />
        </g>
    </IconBase>
);

export default NigeriaColorIcon;
