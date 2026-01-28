import IconBase, { type IconProps } from '~/components/icon-base';

const HungaryColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1390"
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
        <g mask="url(#mask0_9214_1390)">
            <path d="M23.8579 10.6673H-8.14209V16H23.8579V10.6673Z" fill="#477050" />
            <path d="M23.8579 5.3327H-8.14209V10.6654H23.8579V5.3327Z" fill="white" />
            <path d="M23.8579 0H-8.14209V5.33273H23.8579V0Z" fill="#CE2939" />
        </g>
    </IconBase>
);

export default HungaryColorIcon;
