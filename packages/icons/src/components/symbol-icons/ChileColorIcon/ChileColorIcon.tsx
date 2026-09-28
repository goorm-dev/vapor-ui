import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ChileColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-ChileColorIcon__a"
            width={16}
            height={16}
            x={0}
            y={0}
            maskUnits="userSpaceOnUse"
            style={{
                maskType: 'luminance',
            }}
        >
            <path fill="#fff" d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
        </mask>
        <g mask="url(#vapor-icons-color-ChileColorIcon__a)">
            <path fill="#fff" d="M24 0H7.984v8.09H24z" />
            <path fill="#0039A6" d="M7.984 0H0v8.09h7.984z" />
            <path fill="#D52B1E" d="M24 8.09H7.984V16H24zm-16.016 0H0V16h7.984z" />
            <path
                fill="#fff"
                d="M4.444 3.36 3.99 1.967 3.538 3.36H2.075l1.185.862-.453 1.393 1.184-.86 1.185.86-.452-1.393 1.185-.862z"
            />
        </g>
    </IconBase>
);
export default ChileColorIcon;
