import IconBase, { type IconProps } from '~/components/icon-base';

const SaintLuciaColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1445"
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
        <g mask="url(#mask0_9214_1445)">
            <path d="M24 0H-8V16H24V0Z" fill="#66CDFF" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.70361 14.6364H13.2963L7.99998 1.47638L2.70361 14.6364Z"
                fill="white"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.36902 14.6364H12.6308L7.99993 3.25092L3.36902 14.6364Z"
                fill="black"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.70361 14.6364H13.2963L7.99998 8.0564L2.70361 14.6364Z"
                fill="#FCD20F"
            />
        </g>
    </IconBase>
);

export default SaintLuciaColorIcon;
