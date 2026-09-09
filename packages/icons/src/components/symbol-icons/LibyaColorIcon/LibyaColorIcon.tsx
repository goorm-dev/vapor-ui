import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const LibyaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-LibyaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-LibyaColorIcon__a)">
            <path fill="#239E46" d="M29.338 13.35H-13.34v5.32h42.678z" />
            <path fill="#E70013" d="M29.338-2.67H-13.34v5.323h42.678z" />
            <path fill="#000" d="M29.338 2.65H-13.34v10.7h42.678z" />
            <path
                fill="#fff"
                d="m12.842 9.14-1.338-.436-.83 1.136.003-1.407-1.339-.438 1.34-.433.002-1.407.826 1.14 1.34-.433L12.016 8z"
            />
            <path
                fill="#fff"
                d="M8.529 10.33c.5 0 .962-.157 1.342-.425a2.683 2.683 0 0 1-4.578-1.9 2.684 2.684 0 0 1 4.578-1.9 2.323 2.323 0 1 0-1.342 4.222z"
            />
        </g>
    </IconBase>
);
export default LibyaColorIcon;
