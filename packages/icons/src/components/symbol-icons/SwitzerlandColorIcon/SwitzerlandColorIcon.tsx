import IconBase, { type IconProps } from '~/components/icon-base';

const SwitzerlandColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1295"
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
        <g mask="url(#mask0_9214_1295)">
            <path d="M16 0H0V16H16V0Z" fill="#FF0000" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.9784 6.51816H9.48202V3.02179H6.51842V6.51816H3.02197V9.48179H6.51842V12.9782H9.48202V9.48179H12.9784V6.51816Z"
                fill="white"
            />
        </g>
    </IconBase>
);

export default SwitzerlandColorIcon;
