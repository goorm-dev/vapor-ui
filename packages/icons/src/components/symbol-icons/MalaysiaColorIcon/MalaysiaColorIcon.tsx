import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const MalaysiaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-MalaysiaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-MalaysiaColorIcon__a)">
            <path
                fill="#CD0000"
                d="M30.365 0h-32v1.144h32zm0 2.285h-32V3.43h32zm0 2.285h-32v1.145h32zm0 2.286h-32V8h32zm0 2.288h-32v1.143h32zm0 2.286h-32v1.143h32zm0 2.285h-32v1.143h32z"
            />
            <path
                fill="#fff"
                d="M30.365 1.144h-32v1.143h32zm0 2.285h-32v1.144h32zm0 2.285h-32v1.144h32zm0 2.286h-32v1.144h32zm0 2.285h-32v1.144h32zm0 2.285h-32v1.144h32zm0 2.286h-32V16h32z"
            />
            <path fill="#006" d="M14.356 0h-15.99v9.144h15.99z" />
            <path
                fill="#FFCD00"
                fillRule="evenodd"
                d="M5.729 7.642a3.07 3.07 0 1 1 1.413-5.797 3.465 3.465 0 1 0 0 5.447c-.424.22-.904.346-1.413.346z"
                clipRule="evenodd"
            />
            <path
                fill="#FFCD00"
                d="m8.465 7.37-.318-1.434-.896 1.162.333-1.429-1.311.658.922-1.142-1.468.024 1.326-.63-1.333-.615 1.467.007-.932-1.133 1.318.644-.35-1.426.91 1.153.303-1.436.319 1.432.896-1.161-.335 1.429 1.313-.658-.922 1.143 1.467-.023-1.325.629 1.333.616-1.467-.01.932 1.134L9.33 5.66l.35 1.425-.91-1.15z"
            />
        </g>
    </IconBase>
);
export default MalaysiaColorIcon;
