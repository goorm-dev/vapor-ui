import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SomaliaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-SomaliaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-SomaliaColorIcon__a)">
            <path fill="#4189DD" d="M20 0H-4v16h24z" />
            <path
                fill="#fff"
                fillRule="evenodd"
                d="m8.005 4.2.853 2.63h2.764L9.387 8.452l.853 2.627-2.235-1.624L5.77 11.08l.855-2.627-2.237-1.624h2.764z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default SomaliaColorIcon;
