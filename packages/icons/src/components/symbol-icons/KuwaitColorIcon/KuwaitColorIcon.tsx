import IconBase, { type IconProps } from '~/components/icon-base';

const KuwaitColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1341"
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
        <g mask="url(#mask0_9214_1341)">
            <path d="M32 0H0V5.33273H32V0Z" fill="#007A3D" />
            <path d="M32 5.33276H0V10.6655H32V5.33276Z" fill="white" />
            <path d="M32 10.6672H0V16H32V10.6672Z" fill="#CE1126" />
            <path d="M0 5.33273V10.6673V16L8 10.6673V5.33273L0 0V5.33273Z" fill="black" />
        </g>
    </IconBase>
);

export default KuwaitColorIcon;
