import IconBase, { type IconProps } from '~/components/icon-base';

const TanzaniaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1265"
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
        <g mask="url(#mask0_9214_1265)">
            <path d="M-4 0V12.2273L14.3054 0H-4Z" fill="#1EB53A" />
            <path d="M14.3054 0L-4 12.2273V13.4091L16.0745 0H14.3054Z" fill="#FCD116" />
            <path
                d="M20.0001 2.65094L0.0146484 16H1.73828L20.0001 3.80184V2.65094Z"
                fill="#FCD116"
            />
            <path d="M20.0001 3.80182L1.73828 16H20.0001V3.80182Z" fill="#00A3DD" />
            <path d="M20 0H16.0745L-4 13.4091V16H0.0145597L20 2.65091V0Z" fill="black" />
        </g>
    </IconBase>
);

export default TanzaniaColorIcon;
