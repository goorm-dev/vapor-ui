import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const FranceColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-FranceColorIcon__a"
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
        <g mask="url(#vapor-icons-color-FranceColorIcon__a)">
            <path fill="#002654" d="M4.713 0h-6.29v16h6.29z" />
            <path fill="#fff" d="M11.002 0h-6.29v16h6.29z" />
            <path fill="#CE1126" d="M17.293 0h-6.29v16h6.29z" />
        </g>
    </IconBase>
);
export default FranceColorIcon;
