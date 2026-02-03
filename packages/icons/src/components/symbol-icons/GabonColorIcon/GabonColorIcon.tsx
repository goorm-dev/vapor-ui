import IconBase, { type IconProps } from '~/components/icon-base';

const GabonColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1254"
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
        <g mask="url(#mask0_9214_1254)">
            <path d="M18.6652 0H-2.66748V5.33273H18.6652V0Z" fill="#009F60" />
            <path d="M18.6652 5.3327H-2.66748V10.6654H18.6652V5.3327Z" fill="#FCD20F" />
            <path d="M18.6652 10.6673H-2.66748V16H18.6652V10.6673Z" fill="#3776C5" />
        </g>
    </IconBase>
);

export default GabonColorIcon;
