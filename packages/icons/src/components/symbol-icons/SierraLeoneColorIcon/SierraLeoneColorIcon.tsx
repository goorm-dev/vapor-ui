import IconBase, { type IconProps } from '~/components/icon-base';

const SierraLeoneColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1256"
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
        <g mask="url(#mask0_9214_1256)">
            <path d="M20 0H-4V5.33273H20V0Z" fill="#18B637" />
            <path d="M20 5.33276H-4V10.6655H20V5.33276Z" fill="white" />
            <path d="M20 10.6672H-4V16H20V10.6672Z" fill="#0073C7" />
        </g>
    </IconBase>
);

export default SierraLeoneColorIcon;
