import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const PanamaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-PanamaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-PanamaColorIcon__a)">
            <path fill="#fff" d="M8 0H-4v8H8z" />
            <path fill="#DB0A13" d="M20 0H8v8h12z" />
            <path fill="#011E56" d="M8 8H-4v8H8z" />
            <path fill="#fff" d="M20 8H8v8h12z" />
            <path
                fill="#DB0A13"
                d="m13.413 11.078-.328-1.01-.329 1.01h-1.063l.86.624-.328 1.01.86-.623.86.624-.329-1.011.86-.624z"
            />
            <path
                fill="#011E56"
                d="m3.244 4.298-.33-1.01-.327 1.01H1.524l.86.624-.33 1.01.86-.623.86.624-.327-1.011.86-.624z"
            />
        </g>
    </IconBase>
);
export default PanamaColorIcon;
