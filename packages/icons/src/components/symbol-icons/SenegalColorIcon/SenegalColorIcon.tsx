import IconBase, { type IconProps } from '~/components/icon-base';

const SenegalColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1260"
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
        <g mask="url(#mask0_9214_1260)">
            <path d="M4 0H-4V16H4V0Z" fill="#00853F" />
            <path d="M12 0H4V16H12V0Z" fill="#FDEF42" />
            <path d="M20 0H12V16H20V0Z" fill="#E31B23" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.99991 5.36365L8.59082 7.18183H10.5017L8.95623 8.30546L9.54714 10.1236L7.99991 9.00001L6.45446 10.1236L7.0435 8.30546L5.49805 7.18183H7.409L7.99991 5.36365Z"
                fill="#00853F"
            />
        </g>
    </IconBase>
);

export default SenegalColorIcon;
