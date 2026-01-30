import IconBase, { type IconProps } from '~/components/icon-base';

const PalauColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1324"
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
        <g mask="url(#mask0_9214_1324)">
            <path d="M22.4273 0H-3.17272V16H22.4273V0Z" fill="#009AFF" />
            <path
                d="M12.7786 8.7814C13.2034 6.16468 11.4264 3.6991 8.80973 3.27435C6.19302 2.84959 3.72741 4.62652 3.30266 7.24323C2.87791 9.85995 4.65485 12.3255 7.27157 12.7503C9.88829 13.175 12.3539 11.3981 12.7786 8.7814Z"
                fill="#FFFF00"
            />
        </g>
    </IconBase>
);

export default PalauColorIcon;
