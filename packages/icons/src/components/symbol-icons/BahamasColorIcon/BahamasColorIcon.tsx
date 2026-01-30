import IconBase, { type IconProps } from '~/components/icon-base';

const BahamasColorIcon = (props: IconProps) => (
    <IconBase viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <mask
            id="mask0_9214_1319"
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
        <g mask="url(#mask0_9214_1319)">
            <path d="M27.6455 10.7018H-4.35449V16H27.6455V10.7018Z" fill="#00788C" />
            <path d="M27.6455 0H-4.35449V5.29818H27.6455V0Z" fill="#00788C" />
            <path d="M27.6455 5.29816H-4.35449V10.7H27.6455V5.29816Z" fill="#FFC828" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M-4.35449 16L9.38734 8L-4.35449 0V16Z"
                fill="black"
            />
        </g>
    </IconBase>
);

export default BahamasColorIcon;
