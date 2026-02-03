import IconBase, { type IconProps } from '~/components/icon-base';

const CostaRicaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1330"
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
        <g mask="url(#mask0_9214_1330)">
            <path d="M21.3345 0H-5.33276V2.57273H21.3345V0Z" fill="#002B7F" />
            <path d="M21.3345 13.4272H-5.33276V16H21.3345V13.4272Z" fill="#002B7F" />
            <path d="M21.3345 10.7636H-5.33276V13.4272H21.3345V10.7636Z" fill="white" />
            <path d="M21.3345 2.57275H-5.33276V5.23638H21.3345V2.57275Z" fill="white" />
            <path d="M21.3345 5.23639H-5.33276V10.7637H21.3345V5.23639Z" fill="#CE1126" />
        </g>
    </IconBase>
);

export default CostaRicaColorIcon;
