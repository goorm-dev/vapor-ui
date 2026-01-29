import IconBase, { type IconProps } from '~/components/icon-base';

const SyriaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1441"
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
        <g mask="url(#mask0_9214_1441)">
            <path d="M20 0H-4V5.33273H20V0Z" fill="#CE1126" />
            <path d="M20 5.33276H-4V10.6655H20V5.33276Z" fill="white" />
            <path d="M20 10.6672H-4V16H20V10.6672Z" fill="black" />
            <path
                d="M12.0037 5.99091L11.5055 7.52181H9.89648L11.1983 8.46909L10.7001 9.99999L12.0037 9.05454L13.3056 9.99999L12.8092 8.46909L14.111 7.52181H12.5019L12.0037 5.99091Z"
                fill="#007A3D"
            />
            <path
                d="M4.498 7.51271L3.99982 5.97998L3.50346 7.51271H1.89258L3.19438 8.45816L2.69802 9.98907L3.99982 9.04361L5.30349 9.98907L4.80531 8.45816L6.10711 7.51271H4.498Z"
                fill="#007A3D"
            />
        </g>
    </IconBase>
);

export default SyriaColorIcon;
